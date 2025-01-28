const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: ["https://chatapp-52hg.onrender.com", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
