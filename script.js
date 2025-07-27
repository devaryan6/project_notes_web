class NotesApp {
    constructor() {
        this.notes = [];
        this.editingId = null;
        this.isGridView = true;
        this.deleteNoteId = null;
        this.initializeElements();
        this.loadFromStorage();
        this.attachEventListeners();
        this.loadTheme();
        this.updateDisplay();
    }

    initializeElements() {
        // Main containers
        this.noteFormContainer = document.getElementById('noteFormContainer');
        this.notesContainer = document.getElementById('notesContainer');
        this.emptyState = document.getElementById('emptyState');
        this.toastContainer = document.getElementById('toastContainer');
        
        // Form elements
        this.noteForm = document.getElementById('noteForm');
        this.formTitle = document.getElementById('formTitle');
        this.noteTitle = document.getElementById('noteTitle');
        this.noteContent = document.getElementById('noteContent');
        this.notePriority = document.getElementById('notePriority');
        this.titleCounter = document.getElementById('titleCounter');
        this.contentCounter = document.getElementById('contentCounter');
        
        // Buttons
        this.addNoteBtn = document.getElementById('addNoteBtn');
        this.emptyAddBtn = document.getElementById('emptyAddBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.closeForm = document.getElementById('closeForm');
        this.viewToggle = document.getElementById('viewToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.aboutBtn = document.getElementById('aboutBtn');
        
        // Filters
        this.searchInput = document.getElementById('searchInput');
        this.priorityFilter = document.getElementById('priorityFilter');
        this.sortFilter = document.getElementById('sortFilter');
        
        // Modals
        this.modalOverlay = document.getElementById('modalOverlay');
        this.confirmDelete = document.getElementById('confirmDelete');
        this.cancelDelete = document.getElementById('cancelDelete');
        this.aboutModalOverlay = document.getElementById('aboutModalOverlay');
        this.closeAboutModal = document.getElementById('closeAboutModal');

        // Display
        this.notesCount = document.getElementById('notesCount');
    }

    attachEventListeners() {
        this.noteForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addNoteBtn.addEventListener('click', () => this.showForm());
        this.emptyAddBtn.addEventListener('click', () => this.showForm());
        this.cancelBtn.addEventListener('click', () => this.hideForm());
        this.closeForm.addEventListener('click', () => this.hideForm());
        
        this.noteTitle.addEventListener('input', () => this.updateTitleCounter());
        this.noteContent.addEventListener('input', () => this.updateContentCounter());
        
        this.searchInput.addEventListener('input', () => this.filterNotes());
        this.priorityFilter.addEventListener('change', () => this.filterNotes());
        this.sortFilter.addEventListener('change', () => this.filterNotes());
        
        this.viewToggle.addEventListener('click', () => this.toggleView());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        this.exportBtn.addEventListener('click', () => this.exportNotes());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.importNotes(e));
        
        this.confirmDelete.addEventListener('click', () => this.executeDelete());
        this.cancelDelete.addEventListener('click', () => this.hideDeleteModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.hideDeleteModal();
        });
        
        this.aboutBtn.addEventListener('click', () => this.showAboutModal());
        this.closeAboutModal.addEventListener('click', () => this.hideAboutModal());
        this.aboutModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.aboutModalOverlay) this.hideAboutModal();
        });
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showForm(note = null) {
        this.editingId = note ? note.id : null;
        this.formTitle.textContent = note ? 'Edit Note' : 'Create New Note';
        this.saveBtn.textContent = note ? 'Update Note' : 'Save Note';
        
        if (note) {
            this.noteTitle.value = note.title;
            this.noteContent.value = note.content;
            this.notePriority.value = note.priority;
        } else {
            this.noteForm.reset();
        }
        
        this.updateTitleCounter();
        this.updateContentCounter();
        this.noteFormContainer.classList.add('active');
        this.noteTitle.focus();
    }

    hideForm() {
        this.noteFormContainer.classList.remove('active');
        this.editingId = null;
        this.noteForm.reset();
    }

    handleSubmit(e) {
        e.preventDefault();
        const title = this.noteTitle.value.trim();
        const content = this.noteContent.value.trim();
        if (!title || !content) return this.showToast('Please fill in title and content', 'error');
        
        const now = new Date().toISOString();
        if (this.editingId) {
            const noteIndex = this.notes.findIndex(n => n.id === this.editingId);
            if (noteIndex !== -1) {
                this.notes[noteIndex] = {
                    ...this.notes[noteIndex],
                    title,
                    content,
                    priority: this.notePriority.value,
                    updatedAt: now
                };
                this.showToast('Note updated successfully', 'success');
            }
        } else {
            this.notes.unshift({
                id: this.generateId(),
                title,
                content,
                priority: this.notePriority.value,
                pinned: false,
                createdAt: now,
                updatedAt: now
            });
            this.showToast('Note created successfully', 'success');
        }
        this.saveToStorage();
        this.updateDisplay();
        this.hideForm();
    }

    deleteNote(id) {
        this.deleteNoteId = id;
        this.showDeleteModal();
    }

    executeDelete() {
        if (this.deleteNoteId) {
            this.notes = this.notes.filter(note => note.id !== this.deleteNoteId);
            this.saveToStorage();
            this.updateDisplay();
            this.showToast('Note deleted successfully', 'info');
        }
        this.hideDeleteModal();
        this.deleteNoteId = null;
    }
    
    togglePin(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.pinned = !note.pinned;
            note.updatedAt = new Date().toISOString();
            this.saveToStorage();
            this.updateDisplay();
            this.showToast(note.pinned ? 'Note pinned' : 'Note unpinned', 'info');
        }
    }
    
    showDeleteModal() {
        this.modalOverlay.classList.add('active');
    }

    hideDeleteModal() {
        this.modalOverlay.classList.remove('active');
    }

    showAboutModal() {
        this.aboutModalOverlay.classList.add('active');
    }

    hideAboutModal() {
        this.aboutModalOverlay.classList.remove('active');
    }
    
    filterNotes() {
        const query = this.searchInput.value.toLowerCase();
        const priority = this.priorityFilter.value;
        const sort = this.sortFilter.value;
        
        let filtered = this.notes.filter(note =>
            (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) &&
            (!priority || note.priority === priority)
        );
        
        filtered.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            switch (sort) {
                case 'created': return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title': return a.title.localeCompare(b.title);
                default: return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
        });
        
        this.renderNotes(filtered);
    }

    renderNotes(notesToRender) {
        this.notesContainer.innerHTML = '';
        this.emptyState.classList.toggle('hidden', notesToRender.length > 0);
        this.notesCount.textContent = `${notesToRender.length} note${notesToRender.length !== 1 ? 's' : ''}`;
        
        notesToRender.forEach(note => {
            const card = document.createElement('div');
            card.className = `note-card priority-${note.priority}${note.pinned ? ' pinned' : ''}`;
            const createdDate = new Date(note.createdAt).toLocaleDateString();
            const updatedDate = new Date(note.updatedAt).toLocaleDateString();
            const dateText = updatedDate !== createdDate ? `Updated ${updatedDate}` : `Created ${createdDate}`;
            
            card.innerHTML = `
                <div class="note-header">
                    <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        <button class="btn btn-icon" onclick="app.togglePin('${note.id}')" title="${note.pinned ? 'Unpin' : 'Pin'} note">
                            <i class="fas fa-thumbtack ${note.pinned ? 'pinned-icon' : ''}"></i>
                        </button>
                        <button class="btn btn-icon" onclick='app.showForm(${JSON.stringify(note)})' title="Edit note">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon" onclick="app.deleteNote('${note.id}')" title="Delete note">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
                <div class="note-footer">
                    <div class="note-meta">${dateText}</div>
                    <div class="priority-badge priority-${note.priority}">${note.priority}</div>
                </div>
            `;
            this.notesContainer.appendChild(card);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleView() {
        this.isGridView = !this.isGridView;
        this.notesContainer.classList.toggle('list-view', !this.isGridView);
        this.viewToggle.querySelector('i').className = this.isGridView ? 'fas fa-th-large' : 'fas fa-list';
        this.viewToggle.title = this.isGridView ? 'Switch to List View' : 'Switch to Grid View';
    }

    toggleTheme() {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.themeToggle.querySelector('i').className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('notesAppTheme', newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('notesAppTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.themeToggle.querySelector('i').className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    updateTitleCounter() {
        this.titleCounter.textContent = this.noteTitle.value.length;
    }

    updateContentCounter() {
        this.contentCounter.textContent = this.noteContent.value.length;
    }

    updateDisplay() {
        this.filterNotes();
    }

    saveToStorage() {
        localStorage.setItem('notesAppData', JSON.stringify(this.notes));
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem('notesAppData');
            this.notes = data ? JSON.parse(data) : [];
        } catch {
            this.notes = [];
            this.showToast('Failed to load notes', 'error');
        }
    }

    exportNotes() {
        if (this.notes.length === 0) return this.showToast('No notes to export', 'info');
        const dataStr = JSON.stringify(this.notes, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vibe-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('Notes exported successfully', 'success');
    }

    importNotes(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (!Array.isArray(importedNotes)) throw new Error('Invalid file format');
                const validNotes = importedNotes.filter(n => n.id && n.title && n.content);
                if (validNotes.length === 0) throw new Error('No valid notes found');
                
                const existingIds = new Set(this.notes.map(n => n.id));
                const newNotes = validNotes.filter(n => !existingIds.has(n.id));
                
                if (newNotes.length === 0) return this.showToast('No new notes to import. All notes already exist.', 'info');
                
                this.notes = [...newNotes, ...this.notes];
                this.saveToStorage();
                this.updateDisplay();
                this.showToast(`Imported ${newNotes.length} new note${newNotes.length !== 1 ? 's' : ''}`, 'success');
            } catch (error) {
                this.showToast(`Import failed: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        toast.innerHTML = `<i class="toast-icon fas ${icons[type]}"></i><span class="toast-message">${message}</span>`;
        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    handleKeyboard(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.showForm();
        }
        if (e.key === 'Escape') {
            if (this.noteFormContainer.classList.contains('active')) this.hideForm();
            else if (this.modalOverlay.classList.contains('active')) this.hideDeleteModal();
            else if (this.aboutModalOverlay.classList.contains('active')) this.hideAboutModal();
        }
    }
}

// Initialize the app
const app = new NotesApp();
