
// NoteTrader Application Script - Fully Working Version
document.addEventListener('DOMContentLoaded', function() {
    // App State
    const state = {
        notes: [],
        activeNote: null,
        viewMode: 'grid',
        filter: 'all',
        sortBy: 'priority',
        tags: [],
        categories: ['personal', 'work', 'ideas', 'tasks'],
        priorities: ['low', 'medium', 'high', 'critical'],
        notificationCount: 3,
        isLeftSidebarOpen: false,
        isRightSidebarOpen: false
    };

    // DOM Elements with null checks
    const elements = {
        noteGrid: document.querySelector('.note-grid'),
        noteDetailContent: document.querySelector('.note-detail-content'),
        activityTimeline: document.querySelector('.activity-timeline'),
        newNoteBtn: document.getElementById('new-note-btn'),
        noteEditorModal: document.getElementById('note-editor-modal'),
        saveNoteBtn: document.getElementById('save-note'),
        modalCloseBtns: document.querySelectorAll('.modal-close'),
        noteTitleInput: document.getElementById('note-title'),
        noteContentInput: document.getElementById('note-content'),
        notePrioritySelect: document.getElementById('note-priority'),
        noteCategorySelect: document.getElementById('note-category'),
        noteTagsInput: document.getElementById('note-tags'),
        noteDueDateInput: document.getElementById('note-due-date'),
        tagsContainer: document.querySelector('.tags-container'),
        notificationCenter: document.querySelector('.notification-center'),
        clearNotificationsBtn: document.getElementById('clear-notifications'),
        currentTimeDisplay: document.getElementById('current-time'),
        marketTabs: document.querySelectorAll('.tab-btn'),
        viewButtons: document.querySelectorAll('.view-btn')
    };

    // Initialize the app
    function init() {
        console.log('App initialized'); // Debug log
        
        // Load sample data
        loadSampleData();
        
        // Render initial views
        renderNoteGrid();
        updateCurrentTime();
        
        // Set up event listeners
        setupEventListeners();
        
        // Show notifications
        toggleNotificationCenter(true);
        
        // Start simulated real-time updates
        startRealTimeUpdates();
    }

    // Load sample data
    function loadSampleData() {
        state.notes = [
            {
                id: '1',
                title: 'Project Ideas',
                content: 'Brainstorming for new project ideas. Potential topics: AI note-taking assistant, habit tracker with gamification, collaborative coding platform.',
                priority: 'high',
                category: 'ideas',
                tags: ['brainstorm', 'innovation', 'startup'],
                createdAt: new Date('2023-05-15T09:30:00'),
                updatedAt: new Date('2023-05-16T14:45:00'),
                dueDate: new Date('2023-06-01T23:59:59'),
                completed: true
            },
            {
                id: '2',
                title: 'Meeting Notes - Q2 Planning',
                content: 'Discussed Q2 goals and milestones. Key points: Increase user engagement by 20%, launch new features by mid-June, conduct user research in May.',
                priority: 'critical',
                category: 'work',
                tags: ['meeting', 'planning', 'goals'],
                createdAt: new Date('2023-05-10T14:00:00'),
                updatedAt: new Date('2023-05-16T10:15:00'),
                dueDate: new Date('2023-05-20T18:00:00'),
                completed: false
            },
            {
                id: '3',
                title: 'Personal Goals',
                content: '1. Read 20 books this year\n2. Learn React Native\n3. Exercise 4x per week\n4. Meditate daily',
                priority: 'medium',
                category: 'personal',
                tags: ['self-improvement', 'goals'],
                createdAt: new Date('2023-01-01T00:00:00'),
                updatedAt: new Date('2023-05-15T08:30:00'),
                dueDate: new Date('2023-12-31T23:59:59'),
                completed: false
            }
        ];
    }

    // Set up all event listeners with proper checks
    function setupEventListeners() {
        console.log('Setting up event listeners'); // Debug log
        
        // New note button
        if (elements.newNoteBtn) {
            elements.newNoteBtn.addEventListener('click', () => openNoteEditor());
        }

        // Save note button
        if (elements.saveNoteBtn) {
            elements.saveNoteBtn.addEventListener('click', saveNote);
        }

        // Modal close buttons
        if (elements.modalCloseBtns) {
            elements.modalCloseBtns.forEach(btn => {
                btn.addEventListener('click', closeModal);
            });
        }

        // Tags input
        if (elements.noteTagsInput) {
            elements.noteTagsInput.addEventListener('keydown', handleTagInput);
        }

        // Clear notifications
        if (elements.clearNotificationsBtn) {
            elements.clearNotificationsBtn.addEventListener('click', clearNotifications);
        }

        // Market tabs
        if (elements.marketTabs) {
            elements.marketTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    elements.marketTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    state.filter = this.textContent.toLowerCase().replace("'s", '');
                    renderNoteGrid();
                });
            });
        }

        // View buttons
        if (elements.viewButtons) {
            elements.viewButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    elements.viewButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    // In a real app, change view mode here
                });
            });
        }

        // Note card clicks (delegated event)
        if (elements.noteGrid) {
            elements.noteGrid.addEventListener('click', function(e) {
                const noteCard = e.target.closest('.note-card');
                if (noteCard) {
                    const noteId = noteCard.dataset.id;
                    showNoteDetails(noteId);
                }
            });
        }

        // Click outside modal to close
        if (elements.noteEditorModal) {
            elements.noteEditorModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        }
    }

    // Render note grid
    function renderNoteGrid() {
        if (!elements.noteGrid) return;
        
        elements.noteGrid.innerHTML = '';
        
        // Filter notes based on current filter
        let filteredNotes = [...state.notes];
        
        if (state.filter === 'today') {
            const today = new Date().toDateString();
            filteredNotes = filteredNotes.filter(note => {
                return note.dueDate && new Date(note.dueDate).toDateString() === today;
            });
        } else if (state.filter === 'priority') {
            filteredNotes = filteredNotes.filter(note => note.priority === 'high' || note.priority === 'critical');
        } else if (state.filter === 'personal') {
            filteredNotes = filteredNotes.filter(note => note.category === 'personal');
        } else if (state.filter === 'work') {
            filteredNotes = filteredNotes.filter(note => note.category === 'work');
        }
        
        // Sort notes
        filteredNotes.sort((a, b) => {
            if (state.sortBy === 'priority') {
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            } else if (state.sortBy === 'recent') {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            } else if (state.sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            return 0;
        });
        
        // Create note cards
        filteredNotes.forEach(note => {
            const noteCard = createNoteCard(note);
            elements.noteGrid.appendChild(noteCard);
        });
    }

    // Create a note card element
    function createNoteCard(note) {
        const card = document.createElement('div');
        card.className = `note-card priority-${note.priority}`;
        card.dataset.id = note.id;
        
        if (state.activeNote && note.id === state.activeNote.id) {
            card.classList.add('active');
        }
        
        const dueDate = note.dueDate ? new Date(note.dueDate) : null;
        const now = new Date();
        const isDueSoon = dueDate && (dueDate - now) < 86400000 * 2; // Within 2 days
        
        card.innerHTML = `
            <div class="note-card-header">
                <div>
                    <div class="note-title">${note.title}</div>
                    <span class="note-priority">${note.priority}</span>
                </div>
                ${isDueSoon && !note.completed ? '<span class="badge">Due Soon</span>' : ''}
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-footer">
                <span class="note-category">${note.category}</span>
                <div class="note-tags">
                    ${note.tags.slice(0, 2).map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                    ${note.tags.length > 2 ? `<span class="note-tag">+${note.tags.length - 2}</span>` : ''}
                </div>
            </div>
            <div class="note-activity-indicator"></div>
        `;
        
        return card;
    }

    // Show note details in right sidebar
    function showNoteDetails(noteId) {
        const note = state.notes.find(n => n.id === noteId);
        if (!note || !elements.noteDetailContent || !elements.activityTimeline) return;
        
        state.activeNote = note;
        
        // Update active state in grid
        document.querySelectorAll('.note-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.id === noteId) {
                card.classList.add('active');
            }
        });
        
        // Format dates
        const createdAt = formatDate(note.createdAt);
        const updatedAt = formatDate(note.updatedAt);
        const dueDate = note.dueDate ? formatDate(note.dueDate) : 'No due date';
        
        // Create note details HTML
        elements.noteDetailContent.innerHTML = `
            <div class="note-detail-title">${note.title}</div>
            <div class="note-detail-meta">
                <span class="note-detail-priority priority-${note.priority}">${note.priority}</span>
                <span class="note-detail-category">${note.category}</span>
                <span class="note-detail-date">Created: ${createdAt}</span>
                <span class="note-detail-date">Updated: ${updatedAt}</span>
                <span class="note-detail-date">Due: ${dueDate}</span>
            </div>
            <div class="note-detail-text">${note.content.replace(/\n/g, '<br>')}</div>
            <div class="note-detail-tags">
                ${note.tags.map(tag => `<span class="tag-item">${tag}</span>`).join('')}
            </div>
        `;
        
        // Create activity timeline
        const activities = generateNoteActivities(note);
        elements.activityTimeline.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon} ${activity.type}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <small>${formatTime(activity.time)}</small>
                </div>
            </div>
        `).join('');
        
        // Open right sidebar on mobile
        toggleRightSidebar(true);
    }

    // Generate simulated note activities
    function generateNoteActivities(note) {
        const activities = [
            {
                icon: 'sticky-note',
                text: 'Note created',
                time: note.createdAt,
                type: 'info'
            },
            {
                icon: 'edit',
                text: 'Note updated',
                time: note.updatedAt,
                type: 'primary'
            }
        ];
        
        if (note.completed) {
            activities.push({
                icon: 'check-circle',
                text: 'Note marked as completed',
                time: new Date(note.updatedAt.getTime() - 10000),
                type: 'success'
            });
        }
        
        if (note.priority === 'high' || note.priority === 'critical') {
            activities.push({
                icon: 'exclamation-circle',
                text: 'Priority set to ' + note.priority,
                time: new Date(note.createdAt.getTime() + 60000),
                type: 'warning'
            });
        }
        
        // Sort by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        return activities;
    }

    // Open note editor modal
    function openNoteEditor(note) {
        if (!elements.noteEditorModal) return;
        
        // Reset form
        if (elements.noteTitleInput) elements.noteTitleInput.value = '';
        if (elements.noteContentInput) elements.noteContentInput.value = '';
        if (elements.notePrioritySelect) elements.notePrioritySelect.value = 'medium';
        if (elements.noteCategorySelect) elements.noteCategorySelect.value = 'personal';
        if (elements.noteTagsInput) elements.noteTagsInput.value = '';
        if (elements.tagsContainer) elements.tagsContainer.innerHTML = '';
        if (elements.noteDueDateInput) elements.noteDueDateInput.value = '';
        
        // If editing existing note
        if (note) {
            if (elements.noteTitleInput) elements.noteTitleInput.value = note.title;
            if (elements.noteContentInput) elements.noteContentInput.value = note.content;
            if (elements.notePrioritySelect) elements.notePrioritySelect.value = note.priority;
            if (elements.noteCategorySelect) elements.noteCategorySelect.value = note.category;
            
            if (note.tags && note.tags.length > 0 && elements.tagsContainer) {
                note.tags.forEach(tag => {
                    addTagToInput(tag);
                });
            }
            
            if (note.dueDate && elements.noteDueDateInput) {
                const dueDate = new Date(note.dueDate);
                const formattedDate = dueDate.toISOString().slice(0, 16);
                elements.noteDueDateInput.value = formattedDate;
            }
        }
        
        toggleModal(true);
    }

    // Save note
    function saveNote() {
        if (!elements.noteTitleInput || !elements.noteContentInput) return;
        
        const title = elements.noteTitleInput.value.trim();
        const content = elements.noteContentInput.value.trim();
        const priority = elements.notePrioritySelect ? elements.notePrioritySelect.value : 'medium';
        const category = elements.noteCategorySelect ? elements.noteCategorySelect.value : 'personal';
        
        const tags = [];
        if (elements.tagsContainer) {
            const tagElements = elements.tagsContainer.querySelectorAll('.tag-item');
            tagElements.forEach(el => {
                const tagText = el.textContent.trim().replace('×', '').trim();
                if (tagText) tags.push(tagText);
            });
        }
        
        const dueDate = elements.noteDueDateInput && elements.noteDueDateInput.value ? 
            new Date(elements.noteDueDateInput.value) : null;
        
        if (!title) {
            alert('Please enter a title for your note');
            return;
        }
        
        const now = new Date();
        
        if (state.activeNote) {
            // Update existing note
            state.activeNote.title = title;
            state.activeNote.content = content;
            state.activeNote.priority = priority;
            state.activeNote.category = category;
            state.activeNote.tags = tags;
            state.activeNote.dueDate = dueDate;
            state.activeNote.updatedAt = now;
        } else {
            // Create new note
            const newNote = {
                id: generateId(),
                title,
                content,
                priority,
                category,
                tags,
                createdAt: now,
                updatedAt: now,
                dueDate,
                completed: false
            };
            
            state.notes.unshift(newNote);
            state.activeNote = newNote;
        }
        
        // Update UI
        renderNoteGrid();
        showNoteDetails(state.activeNote.id);
        closeModal();
        
        // Show notification
        addNotification({
            type: 'success',
            message: `Note "${title}" ${state.activeNote ? 'updated' : 'created'} successfully`,
            time: new Date()
        });
    }

    // Handle tag input
    function handleTagInput(e) {
        if (!elements.noteTagsInput || !elements.tagsContainer) return;
        
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = elements.noteTagsInput.value.trim();
            if (tag) {
                addTagToInput(tag);
                elements.noteTagsInput.value = '';
            }
        } else if (e.key === 'Backspace' && elements.noteTagsInput.value === '') {
            const tags = elements.tagsContainer.querySelectorAll('.tag-item');
            if (tags.length > 0) {
                const lastTag = tags[tags.length - 1];
                lastTag.remove();
            }
        }
    }

    // Add tag to input
    function addTagToInput(tag) {
        if (!tag || !elements.tagsContainer) return;
        
        // Remove commas if present
        tag = tag.replace(/,/g, '');
        
        const tagElement = document.createElement('span');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tag}
            <span class="remove-tag">&times;</span>
        `;
        
        elements.tagsContainer.appendChild(tagElement);
        
        // Add event listener to remove button
        const removeBtn = tagElement.querySelector('.remove-tag');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                tagElement.remove();
            });
        }
    }

    // Toggle modal visibility
    function toggleModal(show) {
        if (!elements.noteEditorModal) return;
        
        if (show) {
            elements.noteEditorModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (elements.noteTitleInput) elements.noteTitleInput.focus();
        } else {
            elements.noteEditorModal.classList.remove('active');
            document.body.style.overflow = '';
            state.activeNote = null;
        }
    }

    // Close modal
    function closeModal() {
        toggleModal(false);
    }

    // Toggle notification center
    function toggleNotificationCenter(show) {
        if (!elements.notificationCenter) return;
        
        if (show) {
            elements.notificationCenter.classList.add('active');
        } else {
            elements.notificationCenter.classList.remove('active');
        }
    }

    // Add notification
    function addNotification(notification) {
        if (!elements.notificationCenter) return;
        
        state.notificationCount++;
        
        const notificationCount = document.querySelector('.notification-count');
        if (notificationCount) notificationCount.textContent = state.notificationCount;
        
        const notificationList = document.querySelector('.notification-list');
        if (!notificationList) return;
        
        // Remove empty state if present
        const emptyState = notificationList.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        // Create new notification item
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${notification.icon || 'info-circle'} ${notification.type || 'info'}"></i>
            </div>
            <div class="notification-content">
                <p>${notification.message}</p>
                <small>${formatTime(notification.time)}</small>
            </div>
        `;
        
        notificationList.prepend(notificationItem);
    }

    // Clear notifications
    function clearNotifications() {
        if (!elements.notificationCenter) return;
        
        state.notificationCount = 0;
        const notificationCount = document.querySelector('.notification-count');
        if (notificationCount) notificationCount.textContent = '0';
        
        const notificationList = document.querySelector('.notification-list');
        if (notificationList) {
            notificationList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
        }
    }

    // Toggle right sidebar (for mobile)
    function toggleRightSidebar(show) {
        const sidebarRight = document.querySelector('.sidebar-right');
        if (!sidebarRight) return;
        
        if (show) {
            sidebarRight.classList.add('active');
        } else {
            sidebarRight.classList.remove('active');
        }
    }

    // Start real-time updates simulation
    function startRealTimeUpdates() {
        // Update time every second
        setInterval(updateCurrentTime, 1000);
        
        // Simulate note activity every 5-15 seconds
        setInterval(simulateNoteActivity, Math.random() * 10000 + 5000);
        
        // Simulate market index changes every 3 seconds
        setInterval(simulateMarketChanges, 3000);
    }

    // Update current time display
    function updateCurrentTime() {
        if (!elements.currentTimeDisplay) return;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        elements.currentTimeDisplay.textContent = timeStr;
    }

    // Simulate note activity
    function simulateNoteActivity() {
        if (state.notes.length === 0) return;
        
        // Randomly select a note to update
        const randomIndex = Math.floor(Math.random() * state.notes.length);
        const note = state.notes[randomIndex];
        
        // Simulate an update
        note.updatedAt = new Date();
        
        // Randomly change priority (10% chance)
        if (Math.random() < 0.1) {
            const newPriority = state.priorities[Math.floor(Math.random() * state.priorities.length)];
            note.priority = newPriority;
        }
        
        // Randomly mark as completed (5% chance)
        if (!note.completed && Math.random() < 0.05) {
            note.completed = true;
            addNotification({
                type: 'success',
                message: `Note "${note.title}" completed`,
                time: new Date()
            });
        }
        
        // If the active note is the one being updated, refresh details
        if (state.activeNote && state.activeNote.id === note.id) {
            showNoteDetails(note.id);
        }
        
        // Refresh the grid to show updates
        renderNoteGrid();
        
        // Show activity indicator on the note card
        const noteCard = document.querySelector(`.note-card[data-id="${note.id}"]`);
        if (noteCard) {
            const indicator = noteCard.querySelector('.note-activity-indicator');
            if (indicator) {
                indicator.style.borderColor = 'transparent var(--up-color) transparent transparent';
                indicator.style.opacity = '1';
                
                setTimeout(() => {
                    indicator.style.opacity = '0';
                }, 2000);
            }
        }
    }

    // Simulate market index changes
    function simulateMarketChanges() {
        const indexCards = document.querySelectorAll('.index-card');
        if (!indexCards) return;
        
        indexCards.forEach(card => {
            const valueElement = card.querySelector('.index-value');
            const changeElement = card.querySelector('.index-change');
            
            if (!valueElement || !changeElement) return;
            
            let currentValue = parseFloat(valueElement.textContent);
            const change = (Math.random() - 0.5) * 2; // Between -1 and 1
            
            // Apply change
            currentValue += change;
            
            // Ensure value stays within reasonable bounds
            currentValue = Math.max(50, Math.min(100, currentValue));
            
            // Update display
            valueElement.textContent = currentValue.toFixed(2);
            
            // Update change indicator
            if (change > 0) {
                changeElement.textContent = `+${change.toFixed(2)}%`;
                changeElement.className = 'index-change up';
            } else if (change < 0) {
                changeElement.textContent = `${change.toFixed(2)}%`;
                changeElement.className = 'index-change down';
            } else {
                changeElement.textContent = '0.00%';
                changeElement.className = 'index-change flat';
            }
        });
    }

    // Helper function to generate ID
    function generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    // Helper function to format date
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Helper function to format time
    function formatTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { 
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Initialize the app
    init();
});
