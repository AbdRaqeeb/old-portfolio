import 'dotenv/config';
import nodemailer from 'nodemailer';
import amqplib from 'amqplib';
import smtpTransport from 'nodemailer-smtp-transport';

// Setup nodemailer transport
const transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
}));



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
