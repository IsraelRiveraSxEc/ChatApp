// Clase principal para manejar el chat
class Chat {
    constructor() {
        // Inicialización de variables
        this.socket = null;                   // Conexión Socket.IO
        this.username = '';                   // Nombre del usuario
        this.theme = 'light';                 // Tema actual

        // Referencias a elementos del DOM
        this.messagesList = document.getElementById('messages');
        this.messageForm = document.getElementById('message-form');
        this.messageInput = document.getElementById('message');
        this.usernameForm = document.getElementById('username-form');
        this.usernameInput = document.getElementById('username');
        this.usersList = document.getElementById('users');
        this.themeToggle = document.getElementById('theme-toggle');
        this.connectionStatus = document.getElementById('connection-status');

        // Inicialización
        this.initializeSocket();              // Configura Socket.IO
        this.initializeEventListeners();      // Configura event listeners
        this.loadTheme();                     // Carga el tema guardado
    }

    // Inicializa la conexión Socket.IO
    initializeSocket() {
        this.socket = io();                   // Crea conexión Socket.IO

        // Manejo de eventos de Socket.IO
        this.socket.on('connect', () => this.updateConnectionStatus(true));
        this.socket.on('disconnect', () => this.updateConnectionStatus(false));
        this.socket.on('chat message', (msg) => this.displayMessage(msg));
        this.socket.on('mensaje sistema', (msg) => this.displaySystemMessage(msg));
        this.socket.on('lista usuarios', (users) => this.updateUsersList(users));
    }

    // Configura los event listeners
    initializeEventListeners() {
        // Manejo del formulario de nombre de usuario
        this.usernameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUsernameSubmit();
        });

        // Manejo del formulario de mensajes
        this.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMessageSubmit();
        });

        // Manejo del cambio de tema
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Maneja el envío del nombre de usuario
    handleUsernameSubmit() {
        this.username = this.usernameInput.value.trim();
        if (this.username) {
            this.socket.emit('nuevo usuario', this.username);
            this.usernameForm.classList.remove('active');
            this.usernameForm.classList.add('hidden');
            this.messageForm.classList.remove('hidden');
            this.messageForm.classList.add('active');
        }
    }

    // Maneja el envío de mensajes
    handleMessageSubmit() {
        const message = this.messageInput.value.trim();
        if (message) {
            this.socket.emit('chat message', message);
            this.messageInput.value = '';
        }
    }

    // Muestra un mensaje en el chat
    displayMessage(msg) {
        const li = document.createElement('li');
        li.className = `message ${msg.usuario === this.username ? 'own' : ''}`;
        li.innerHTML = `
            <strong>${msg.usuario}</strong>
            <span class="time">${msg.tiempo}</span><br>
            ${msg.mensaje}
        `;
        this.messagesList.appendChild(li);
        this.scrollToBottom();
    }

    // Muestra un mensaje del sistema
    displaySystemMessage(msg) {
        const li = document.createElement('li');
        li.className = 'message system';
        li.textContent = msg;
        this.messagesList.appendChild(li);
        this.scrollToBottom();
    }

    // Actualiza la lista de usuarios
    updateUsersList(users) {
        this.usersList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            this.usersList.appendChild(li);
        });
    }

    // Actualiza el estado de conexión
    updateConnectionStatus(connected) {
        this.connectionStatus.className = connected ? 'connected' : 'disconnected';
        this.connectionStatus.textContent = connected ? 'Conectado' : 'Desconectado';
    }

    // Cambia entre tema claro y oscuro
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('theme', this.theme);
    }

    // Carga el tema guardado
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }

    // Hace scroll al último mensaje
    scrollToBottom() {
        this.messagesList.scrollTop = this.messagesList.scrollHeight;
    }
}

// Inicializa la aplicación cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    new Chat();
});
