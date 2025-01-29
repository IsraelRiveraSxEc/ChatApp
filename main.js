// Constantes de configuración
const DEBUG = true; // Modo debug activado para desarrollo

// Elementos del DOM para la autenticación
const loginView = document.getElementById('login-view');
const notesView = document.getElementById('notes-view');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// Elementos del DOM para las notas
const themeToggle = document.getElementById('theme-toggle');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const saveButton = document.getElementById('save-note');
const notesList = document.getElementById('notes-list');
const logoutBtn = document.getElementById('logout-btn');

// Sistema de logging para desarrollo
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

// Clase para manejar el almacenamiento de usuarios
class UserStorage {
    static saveUser(username, password) {
        const users = this.getUsers();
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        log(`Usuario guardado: ${username}`);
    }

    static getUsers() {
        return JSON.parse(localStorage.getItem('users') || '{}');
    }

    static checkCredentials(username, password) {
        const users = this.getUsers();
        return users[username] === password;
    }
}

// Funciones de manejo de vistas
function showNotesView() {
    loginView.style.display = 'none';
    notesView.style.display = 'block';
    loadNotesFromStorage();
    loadTheme();
    log('Vista de notas mostrada');
}

function showLoginView() {
    notesView.style.display = 'none';
    loginView.style.display = 'block';
    log('Vista de login mostrada');
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
    
    log(`Notificación mostrada: ${message}`, type);
}

// Manejo de notas
function createNote(title, content) {
    try {
        const noteElement = document.createElement('div');
        noteElement.className = 'note loading';
        
        noteElement.innerHTML = `
            <h3>${title}</h3>
            <p>${content}</p>
            <button class="delete-btn" onclick="deleteNote(this)">
                <span>Eliminar</span>
            </button>
        `;
        
        notesList.prepend(noteElement);
        
        setTimeout(() => {
            noteElement.classList.remove('loading');
        }, 500);

        saveNotesToStorage();
        showNotification('Nota creada exitosamente');
        log(`Nota creada: "${title}"`);
    } catch (error) {
        showNotification('Error al crear la nota', 'error');
        log('Error al crear nota: ' + error.message, 'error');
    }
}

function deleteNote(button) {
    try {
        const noteElement = button.parentElement;
        const noteTitle = noteElement.querySelector('h3').textContent;
        
        if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
            noteElement.style.transform = 'translateX(100%)';
            noteElement.style.opacity = '0';
            
            setTimeout(() => {
                noteElement.remove();
                saveNotesToStorage();
                showNotification('Nota eliminada correctamente');
            }, 300);
            
            log(`Nota eliminada: "${noteTitle}"`);
        }
    } catch (error) {
        showNotification('Error al eliminar la nota', 'error');
        log('Error al eliminar nota: ' + error.message, 'error');
    }
}

// Manejo del almacenamiento local
function saveNotesToStorage() {
    const notes = Array.from(notesList.children).map(note => ({
        title: note.querySelector('h3').textContent,
        content: note.querySelector('p').textContent
    }));
    
    localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
    log('Notas guardadas en localStorage');
}

function loadNotesFromStorage() {
    try {
        const savedNotes = localStorage.getItem(`notes_${currentUser}`);
        if (savedNotes) {
            const notes = JSON.parse(savedNotes);
            notesList.innerHTML = '';
            notes.reverse().forEach(note => {
                createNote(note.title, note.content);
            });
            log('Notas cargadas desde localStorage');
        }
    } catch (error) {
        log('Error al cargar notas: ' + error.message, 'error');
    }
}

// Manejo del tema
function loadTheme() {
    const isDarkTheme = localStorage.getItem(`darkTheme_${currentUser}`);
    if (isDarkTheme === 'true') {
        document.body.classList.add('dark-theme');
        log('Tema oscuro aplicado');
    }
}

// Event Listeners
saveButton.addEventListener('click', () => {
    try {
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();
        
        if (title && content) {
            saveButton.classList.add('loading');
            
            setTimeout(() => {
                createNote(title, content);
                noteTitle.value = '';
                noteContent.value = '';
                saveButton.classList.remove('loading');
            }, 500);
        } else {
            showNotification('Por favor completa todos los campos', 'error');
        }
    } catch (error) {
        log('Error al guardar nota: ' + error.message, 'error');
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem(
        `darkTheme_${currentUser}`, 
        document.body.classList.contains('dark-theme')
    );
    log('Tema cambiado');
});

// Inicialización
const currentUser = sessionStorage.getItem('currentUser');
if (!currentUser) {
    window.location.href = 'login.html';
    log('Usuario no autenticado, redirigiendo a login');
}

// Cargar datos iniciales
loadTheme();
loadNotesFromStorage();
log('Aplicación inicializada');