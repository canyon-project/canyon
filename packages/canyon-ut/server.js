import express from 'express';

const app = express();
import prisma from './lib/prisma';

app.post('/coverage/client', (req, res) => {
    // prisma.coverage.findFirst
    res.send('Hello World');
});

app.get('/coverage/map', (req, res) => {
    // prisma.coverage.findFirst
    res.send('Hello World');
});

app.get('/coverage/summary', (req, res) => {
    
});

app.listen(8080, () => {
    console.log('Server started on http://localhost:8080');
});