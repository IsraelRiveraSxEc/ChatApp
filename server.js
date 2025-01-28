const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Sirve los archivos estáticos
app.use(express.static(__dirname));

// Maneja las conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Maneja los mensajes entrantes
    socket.on('chat message', (msg) => {
        // Reenvía el mensaje a todos los clientes conectados
        io.emit('chat message', msg);
    });

    // Maneja las desconexiones
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});