import express from 'express';
import 'dotenv/config';
import path from 'path';


const app = express();

import email from "./modules/Email/routes/route";
import subscriber from "./subscriber";

app.use(express.json({ extended: false }));

app.use('/email', email);

// Server static file
app.use(express.static(path.resolve(__dirname, '../client')));

// Consume rabbitmq queue
// noinspection JSIgnoredPromiseFromCall
subscriber();

app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, ''))
);

const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});