// Verificar si el usuario está autenticado
const currentUser = sessionStorage.getItem('currentUser');
if (!currentUser) {
    window.location.href = 'login.html';
}

// Selección de elementos del DOM
const themeToggle = document.getElementById('theme-toggle');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const saveButton = document.getElementById('save-note');
const notesList = document.getElementById('notes-list');

// Sistema de sonidos sintéticos
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const sounds = {
    buttons: [
        () => playBeep(200, 'square'),    // Sonido tipo arcade
        () => playBeep(300, 'sine'),      // Sonido suave
        () => playBeep(400, 'triangle'),  // Sonido metálico
        () => playBeep(500, 'sawtooth'),  // Sonido futurista
    ],
    success: [
        () => playSuccess(),              // Sonido de éxito
    ],
    delete: [
        () => playDelete(),               // Sonido de eliminación
    ]
};

function playBeep(frequency, type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playSuccess() {
    const frequencies = [523.25, 659.25, 783.99];
    frequencies.forEach((freq, index) => {
        setTimeout(() => {
            playBeep(freq, 'sine');
        }, index * 100);
    });
}

function playDelete() {
    const startFreq = 400;
    const endFreq = 100;
    const duration = 0.2;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// Función para reproducir sonido aleatorio
function playSound(category) {
    const soundList = sounds[category];
    const soundFunction = soundList[Math.floor(Math.random() * soundList.length)];
    soundFunction();
}

// Manejador para cambiar entre tema claro y oscuro
themeToggle.addEventListener('click', () => {
    playSound('buttons');
    document.body.classList.toggle('dark-theme');
    // Guardar la preferencia del tema
    localStorage.setItem(
        `darkTheme_${currentUser}`, 
        document.body.classList.contains('dark-theme')
    );
});

// Función para mostrar notificaciones
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

// Manejador para guardar una nueva nota
saveButton.addEventListener('click', () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (title && content) {
        playSound('buttons');
        saveButton.classList.add('loading');
        
        setTimeout(() => {
            createNote(title, content);
            noteTitle.value = '';
            noteContent.value = '';
            saveButton.classList.remove('loading');
            showNotification('Nota guardada exitosamente');
            playSound('success');
        }, 500);
    } else {
        showNotification('Por favor completa todos los campos', 'error');
        playSound('delete');
    }
});

// Función para crear una nueva nota
function createNote(title, content) {
    const noteElement = document.createElement('div');
    noteElement.className = 'note creating';
    
    noteElement.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
        <button onclick="deleteNote(this)" class="delete-btn">
            <span>Eliminar</span>
        </button>
    `;
    
    notesList.prepend(noteElement);
    saveNotesToStorage();
    
    setTimeout(() => {
        noteElement.classList.remove('creating');
    }, 500);
}

// Función para eliminar una nota
function deleteNote(button) {
    if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
        const noteElement = button.parentElement;
        playSound('delete');
        noteElement.classList.add('deleting');
        
        setTimeout(() => {
            noteElement.remove();
            saveNotesToStorage();
            showNotification('Nota eliminada correctamente');
        }, 500);
    }
}

// Función para guardar las notas en localStorage
function saveNotesToStorage() {
    const notes = Array.from(notesList.children).map(note => ({
        title: note.querySelector('h3').textContent,
        content: note.querySelector('p').textContent
    }));
    
    localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
}

// Función para cargar las notas del localStorage
function loadNotesFromStorage() {
    const savedNotes = localStorage.getItem(`notes_${currentUser}`);
    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        notes.reverse().forEach(note => {
            createNote(note.title, note.content);
        });
    }
}

// Función para cargar el tema
function loadTheme() {
    const isDarkTheme = localStorage.getItem(`darkTheme_${currentUser}`);
    if (isDarkTheme === 'true') {
        document.body.classList.add('dark-theme');
    }
}

// Función para cerrar sesión
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Agregar efecto de sonido al logout
document.getElementById('logout-btn').addEventListener('click', () => {
    playSound('buttons');
    setTimeout(() => {
        logout();
    }, 200);
});

// Inicialización
loadTheme();
loadNotesFromStorage();
