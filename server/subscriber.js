import 'dotenv/config';
import nodemailer from 'nodemailer';
import amqplib from 'amqplib';

// Setup nodemailer transport
const transport = nodemailer.createTransport({
    host: process.env.SMTP_ENDPOINT,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const subscriber = async () => {
    try {
        // Name of queue
        const q = 'contact';

        // connect to amqplib server
        const conn = await amqplib.connect(process.env.amqplib);

        // Create channel
        const ch = await conn.createChannel();

        // Ensure queue for messages and Ensure that the queue is not deleted when server restarts
        await ch.assertQueue(q, {durable: true});

        // Only request 1 unacked message from queue
        // This value indicates how many messages we want to process in parallel
        await ch.prefetch(1);

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);

        // Set up callback to handle messages received from the queue
        ch.consume(q, async function (msg) {
            console.log(" [x] Received %s", msg.content.toString());

            const qm = JSON.parse(msg.content.toString());

            const {name, email, subject, message} = qm;

            // The message tags to apply to the email.
            const tag0 = "key0=value0";
            const tag1 = "key1=value1";

            const mailOption = {
                from: process.env.USER,
                to: process.env.RECEIVER,
                subject: 'PERSONAL PORTFOLIO',
                text: `Email: ${email}, name: ${name}, subject: ${subject}, message: ${message}`,
                html: `<html lang="">
                        <head><title>${subject}</title></head>
                        <body>
                            <h3>${name}</h3>
                            <p>Email: ${email}</p>
                            <p><strong>Message: </strong>${message}</p>
                        </body>                    
                    </html>`,
                // Custom headers for message tags.
                headers: {
                    'X-SES-MESSAGE-TAGS': tag0,
                    'X-SES-MESSAGE-TAGS': tag1
                }
            };

            // Send the message using the previously set up Nodemailer transport
            await transport.sendMail(mailOption, (err, info) => {
                if (err) {
                    console.error(err.stack);
                    // put the failed message item back to queue
                    return ch.nack(msg);
                }

                console.log('Delivered message %s', info.messageId);
                // remove message item from the queue
                ch.ack(msg);
            });
        });

    } catch (e) {
        console.log(e.stack);
    }
};

export default subscriber;
