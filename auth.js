// Constantes de configuración
const DEBUG = true;

// Clase para manejar el almacenamiento de usuarios
class UserStorage {
    static saveUser(username, password) {
        const users = this.getUsers();
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        log(`Usuario registrado: ${username}`);
    }

    static getUsers() {
        return JSON.parse(localStorage.getItem('users') || '{}');
    }

    static checkCredentials(username, password) {
        const users = this.getUsers();
        return users[username] === password;
    }
}

// Sistema de logging
function log(message, type = 'info') {
    if (DEBUG) {
        const styles = {
            info: 'color: #2ecc71',
            error: 'color: #e74c3c',
            warning: 'color: #f1c40f'
        };
        console.log(`%c[${type.toUpperCase()}] ${message}`, styles[type]);
    }
}

// Sistema de notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Elementos del DOM
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// Cargar credenciales guardadas
const savedUsername = localStorage.getItem('savedUsername');
const savedPassword = localStorage.getItem('savedPassword');
if (savedUsername && savedPassword) {
    usernameInput.value = savedUsername;
    passwordInput.value = savedPassword;
    rememberCheckbox.checked = true;
    log('Credenciales guardadas cargadas');
}

// Manejo del formulario de autenticación
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (password.length !== 8) {
        showNotification('La contraseña debe tener exactamente 8 caracteres', 'error');
        log('Intento de login con contraseña inválida', 'warning');
        return;
    }

    if (UserStorage.checkCredentials(username, password)) {
        handleSuccessfulLogin(username);
    } else {
        showNotification('Usuario o contraseña incorrectos', 'error');
        log('Intento de login fallido', 'error');
    }
});

// Manejo del registro de usuarios
registerBtn.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (password.length !== 8) {
        showNotification('La contraseña debe tener exactamente 8 caracteres', 'error');
        log('Intento de registro con contraseña inválida', 'warning');
        return;
    }

    if (UserStorage.getUsers()[username]) {
        showNotification('El usuario ya existe', 'error');
        log('Intento de registro con usuario existente', 'warning');
        return;
    }

    UserStorage.saveUser(username, password);
    showNotification('Usuario registrado exitosamente');
    log(`Usuario registrado: ${username}`);
});

// Manejo del login exitoso
function handleSuccessfulLogin(username) {
    if (rememberCheckbox.checked) {
        localStorage.setItem('savedUsername', username);
        localStorage.setItem('savedPassword', passwordInput.value);
        log('Credenciales guardadas');
    } else {
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedPassword');
        log('Credenciales removidas');
    }

    sessionStorage.setItem('currentUser', username);
    log(`Login exitoso: ${username}`);
    window.location.href = 'notes.html';
}

// Función de logout
function logout() {
    sessionStorage.removeItem('currentUser');
    log('Usuario desconectado');
    window.location.href = 'login.html';
}

log('Sistema de autenticación inicializado');