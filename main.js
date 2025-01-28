/**
 * Clase principal que maneja toda la funcionalidad del chat
 */
class ChatApp {
    /**
     * Constructor de la clase
     * Inicializa todas las propiedades y eventos necesarios
     */
    constructor() {
        // Referencias a elementos del DOM
        this.messageForm = document.getElementById('messageForm');
        this.messageInput = document.getElementById('messageInput');
        this.messagesArea = document.getElementById('messagesArea');
        this.userModal = document.getElementById('userModal');
        this.userForm = document.getElementById('userForm');
        this.usernameInput = document.getElementById('username');
        this.currentUserSpan = document.getElementById('currentUser');
        this.themeToggle = document.getElementById('themeToggle');

        // Estado de la aplicación
        this.username = localStorage.getItem('username') || '';
        this.messages = JSON.parse(localStorage.getItem('messages')) || [];
        this.socket = null;

        // Vinculación de métodos
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleUserSubmit = this.handleUserSubmit.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);

        // Inicialización
        this.initializeTheme();
        this.initializeSocket();
        this.initializeEventListeners();
        this.loadStoredMessages();
        
        // Mostrar modal si no hay username
        if (!this.username) {
            this.showUserModal();
        } else {
            this.hideUserModal();
            this.updateCurrentUser();
        }
    }

    /**
     * Inicializa el tema según las preferencias del sistema
     */
    initializeTheme() {
        // Detecta preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        // Aplica el tema guardado o el preferido del sistema
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.body.setAttribute('data-theme', 'dark');
        }

        // Observa cambios en la preferencia del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Inicializa la conexión WebSocket
     */
    initializeSocket() {
        this.socket = io('http://localhost:3000');

        this.socket.on('connect', () => {
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            this.updateConnectionStatus(false);
        });

        this.socket.on('chat message', (data) => {
            this.receiveMessage(data);
        });
    }

    /**
     * Inicializa todos los event listeners
     */
    initializeEventListeners() {
        this.messageForm.addEventListener('submit', this.handleSubmit);
        this.messageInput.addEventListener('keydown', this.handleKeyPress);
        this.userForm.addEventListener('submit', this.handleUserSubmit);
        this.themeToggle.addEventListener('click', this.toggleTheme);
        
        this.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });
    }

    /**
     * Maneja el cambio de tema claro/oscuro
     */
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Actualiza el ícono
        const icon = this.themeToggle.querySelector('.material-icons');
        icon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }

    /**
     * Actualiza el estado de conexión en la UI
     */
    updateConnectionStatus(connected) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        statusIndicator.style.background = connected ? 'var(--status-color)' : '#ff3d00';
        statusText.textContent = connected ? 'Conectado' : 'Desconectado';
    }

    /**
     * Muestra el modal de usuario
     */
    showUserModal() {
        this.userModal.style.display = 'flex';
    }

    /**
     * Oculta el modal de usuario
     */
    hideUserModal() {
        this.userModal.style.display = 'none';
    }

    /**
     * Maneja el envío del formulario de usuario
     */
    handleUserSubmit(event) {
        event.preventDefault();
        this.username = this.usernameInput.value.trim();
        
        if (this.username) {
            localStorage.setItem('username', this.username);
            this.hideUserModal();
            this.updateCurrentUser();
        }
    }

    /**
     * Actualiza el nombre de usuario mostrado
     */
    updateCurrentUser() {
        this.currentUserSpan.textContent = this.username;
    }

    /**
     * Carga los mensajes almacenados en localStorage
     */
    loadStoredMessages() {
        this.messages.forEach(message => {
            this.displayMessage(message);
        });
        this.scrollToBottom();
    }

    /**
     * Maneja el envío de mensajes
     */
    handleSubmit(event) {
        event.preventDefault();
        const messageText = this.messageInput.value.trim();
        
        if (messageText && this.username) {
            const message = {
                text: messageText,
                username: this.username,
                timestamp: new Date().toISOString(),
                type: 'sent'
            };

            this.socket.emit('chat message', message);
            this.addMessage(message);
            
            this.messageInput.value = '';
            this.adjustTextareaHeight();
        }
    }

    /**
     * Maneja el evento de teclas presionadas
     */
    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSubmit(event);
        }
    }

    /**
     * Ajusta la altura del textarea según su contenido
     */
    adjustTextareaHeight() {
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    /**
     * Recibe y procesa mensajes entrantes
     */
    receiveMessage(message) {
        if (message.username !== this.username) {
            message.type = 'received';
            this.addMessage(message);
        }
    }

    /**
     * Agrega un mensaje al chat
     */
    addMessage(message) {
        this.messages.push(message);
        localStorage.setItem('messages', JSON.stringify(this.messages));
        this.displayMessage(message);
        this.scrollToBottom();
    }

    /**
     * Muestra un mensaje en la interfaz
     */
    displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', message.type);

        const header = document.createElement('div');
        header.classList.add('message-header');
        header.textContent = message.username;

        const content = document.createElement('div');
        content.classList.add('message-content');
        content.innerHTML = message.text.replace(/\n/g, '<br>');

        const footer = document.createElement('div');
        footer.classList.add('message-footer');
        footer.textContent = new Date(message.timestamp).toLocaleTimeString();

        messageElement.appendChild(header);
        messageElement.appendChild(content);
        messageElement.appendChild(footer);

        this.messagesArea.appendChild(messageElement);
    }

    /**
     * Hace scroll hasta el último mensaje
     */
    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }
}

// Inicia la aplicación cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});