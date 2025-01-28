// Importación de módulos necesarios para el servidor
const express = require('express');                // Framework web para Node.js
const app = express();                            // Creación de la aplicación Express
const http = require('http').createServer(app);   // Creación del servidor HTTP
const io = require('socket.io')(http, {
    cors: {
        origin: ["https://chatapp-52hg.onrender.com", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

// Implementar rate limiting por IP
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite por IP
});
app.use(limiter);

// Implementar validación de mensajes
function sanitizeMessage(msg) {
    // Implementar sanitización
    return msg.slice(0, 500).trim(); // Limitar longitud
}

// Configuración para servir archivos estáticos
app.use(express.static(__dirname));               // Sirve los archivos desde el directorio actual

// Array para almacenar usuarios conectados
let usuariosConectados = [];                      // Mantiene registro de usuarios activos

// Manejo de eventos de Socket.IO
io.on('connection', (socket) => {
    let messageCount = 0;
    let lastMessageTime = Date.now();

    // Se ejecuta cuando un cliente se conecta
    console.log('Usuario conectado');             // Registro de conexión en consola

    // Manejo del evento de nuevo usuario
    socket.on('nuevo usuario', (nombreUsuario) => {
        // Almacena el nombre del usuario en el objeto socket
        socket.nombreUsuario = nombreUsuario;
        // Añade el usuario a la lista de conectados
        usuariosConectados.push(nombreUsuario);
        // Emite la lista actualizada a todos los clientes
        io.emit('lista usuarios', usuariosConectados);
        // Anuncia la conexión del nuevo usuario
        io.emit('mensaje sistema', `${nombreUsuario} se ha unido al chat`);
    });

    // Manejo de mensajes de chat
    socket.on('chat message', (msg) => {
        // Rate limiting por usuario
        const now = Date.now();
        if (now - lastMessageTime < 1000) { // 1 segundo entre mensajes
            return;
        }
        if (messageCount > 50) { // 50 mensajes por minuto
            socket.emit('error', 'Demasiados mensajes');
            return;
        }
        
        const sanitizedMsg = sanitizeMessage(msg);
        // Crea objeto con información del mensaje
        const mensajeCompleto = {
            usuario: socket.nombreUsuario,         // Nombre del usuario
            mensaje: sanitizedMsg,                 // Contenido del mensaje
            tiempo: new Date().toLocaleTimeString()// Hora del mensaje
        };
        // Emite el mensaje a todos los clientes
        io.emit('chat message', mensajeCompleto);
        
        messageCount++;
        lastMessageTime = now;
    });

    // Manejo de desconexión de usuarios
    socket.on('disconnect', () => {
        if (socket.nombreUsuario) {
            // Elimina el usuario de la lista de conectados
            usuariosConectados = usuariosConectados.filter(u => u !== socket.nombreUsuario);
            // Emite la lista actualizada
            io.emit('lista usuarios', usuariosConectados);
            // Anuncia la desconexión del usuario
            io.emit('mensaje sistema', `${socket.nombreUsuario} ha abandonado el chat`);
        }
        console.log('Usuario desconectado');      // Registro de desconexión en consola
    });
});

// Configuración del puerto del servidor
const PORT = process.env.PORT || 3000;            // Usa el puerto proporcionado por el hosting o 3000 por defecto

// Inicio del servidor
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
    // Muestra las IPs disponibles para conexión
    const networkInterfaces = require('os').networkInterfaces();
    const addresses = [];
    for (const k in networkInterfaces) {
        for (const k2 in networkInterfaces[k]) {
            const address = networkInterfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    console.log('IPs disponibles para conexión:');
    addresses.forEach(ip => {
        console.log(`http://${ip}:${PORT}`);
    });
});
