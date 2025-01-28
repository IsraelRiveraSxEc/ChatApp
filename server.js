const express = require('express');
const compression = require('compression');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: ["https://chatapp-52hg.onrender.com", "http://localhost:3000"],
        methods: ["GET", "POST"]
    },
    pingTimeout: 10000,
    pingInterval: 2500
});

// Comprimir todas las respuestas
app.use(compression());

// Cache para archivos estáticos
app.use(express.static(__dirname, {
    maxAge: '1h'
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Lista de usuarios conectados
let usuarios = new Set();

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Manejo de nuevo usuario
    socket.on('nuevo usuario', (username) => {
        socket.username = username;
        usuarios.add(username);
        io.emit('mensaje sistema', `${username} se ha unido al chat`);
        io.emit('lista usuarios', Array.from(usuarios));
    });

    // Manejo de mensajes
    socket.on('chat message', (msg) => {
        io.emit('chat message', {
            usuario: socket.username,
            mensaje: msg,
            tiempo: new Date().toLocaleTimeString()
        });
    });

    // Manejo de desconexión
    socket.on('disconnect', () => {
        if (socket.username) {
            usuarios.delete(socket.username);
            io.emit('mensaje sistema', `${socket.username} ha salido del chat`);
            io.emit('lista usuarios', Array.from(usuarios));
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
