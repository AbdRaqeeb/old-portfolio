import 'dotenv/config'
import amqplib from 'amqplib';
import { validateMessage } from '../../../middleware/validate';

class Email {
    /***
     * @static
     * @desc Add message to queue
     * @param {object} req express req object
     * @param {object} res express res object
     * */
    static async addEntry(req, res) {
        const { error } = validateMessage(req.body);
        if (error) return  res.status(400).json(error.details[0].message);

        const { name, email, subject, message } = req.body;
        try {
            // create queue
            const q = 'contact';

            // connect to rabbitmq server
            const conn = await amqplib.connect(process.env.amqplib);

            // create queue channel
            const ch = await conn.createChannel();

            // Ensure queue for messages
            await ch.assertQueue(q, { durable: true });

            // Stringify the messages
            const qm = JSON.stringify({ name, email, subject, message });

            // Send to queue
            await ch.sendToQueue(q, Buffer.from(qm, 'utf8'));

            console.log(" [x] Sent %s", qm);

            return res.status(200).json({
                msg: 'Thanks for reaching out!'
            })
        } catch (e) {
            console.log(e.stack);
            res.status(500).send('Internal server error...')
        }
    }
}

export default Email;

