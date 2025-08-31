// Todo List Application JavaScript - Fixed Version
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'dateAdded';
        this.currentTheme = 'light';
        this.editingTaskId = null;
        
        this.init();
    }

    init() {
        this.loadTheme();
        this.loadTasks();
        this.bindEvents();
        this.updateUI();
        this.showLoadingAnimation();
        
        // Load sample data if no tasks exist
        if (this.tasks.length === 0) {
            this.loadSampleData();
        }
    }

    showLoadingAnimation() {
        const loading = document.getElementById('loadingOverlay');
        loading.classList.remove('hidden');
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 1000);
    }

    loadSampleData() {
        const sampleTasks = [
           
        ];

        this.tasks = sampleTasks;
        this.saveTasks();
    }

    bindEvents() {
        // Task input events
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && taskInput.value.trim()) {
                this.addTask();
            }
        });
        
        addBtn.addEventListener('click', () => {
            if (taskInput.value.trim()) {
                this.addTask();
            }
        });

        // Filter events
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Sort events
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.setSort(e.target.value);
        });

        // Search events - Fixed
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTasks(e.target.value);
        });

        // Theme toggle - Fixed
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Clear completed
        document.getElementById('clearCompleted').addEventListener('click', () => {
            this.clearCompleted();
        });

        // Modal events
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('saveEdit').addEventListener('click', () => {
            this.saveEditedTask();
        });

        // Close modal when clicking overlay
        document.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });

        // Edit task input enter key
        document.getElementById('editTaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEditedTask();
            }
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskDate = document.getElementById('taskDate');
        const taskTime = document.getElementById('taskTime');
        const taskPriority = document.getElementById('taskPriority');

        const task = {
            id: Date.now(),
            text: taskInput.value.trim(),
            completed: false,
            priority: taskPriority.value,
            dueDate: taskDate.value,
            dueTime: taskTime.value,
            createdAt: new Date().toISOString()
        };

        // Add task with animation
        this.tasks.unshift(task);
        this.saveTasks();
        
        // Clear inputs
        taskInput.value = '';
        taskDate.value = '';
        taskTime.value = '';
        taskPriority.value = 'medium';

        // Add bounce animation to add button
        const addBtn = document.getElementById('addBtn');
        addBtn.style.animation = 'bounceIn 0.4s ease-out';
        setTimeout(() => {
            addBtn.style.animation = '';
        }, 400);

        this.updateUI();
    }

    // Fixed delete function
    deleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        
        if (taskElement) {
            // Add removing animation
            taskElement.classList.add('removing');
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => task.id !== id);
                this.saveTasks();
                this.updateUI();
            }, 400);
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            
            // Add completion animation
            const taskElement = document.querySelector(`[data-task-id="${id}"]`);
            if (task.completed) {
                taskElement.style.animation = 'bounceIn 0.5s ease-out';
            }
            
            setTimeout(() => {
                if (taskElement) {
                    taskElement.style.animation = '';
                }
                this.updateUI();
            }, 100);
        }
    }

    // Fixed edit function
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            
            // Populate modal
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editTaskDate').value = task.dueDate || '';
            document.getElementById('editTaskTime').value = task.dueTime || '';
            document.getElementById('editTaskPriority').value = task.priority;
            
            // Show modal
            const modal = document.getElementById('editModal');
            modal.classList.remove('hidden');
            document.getElementById('editTaskInput').focus();
        }
    }

    saveEditedTask() {
        if (!this.editingTaskId) return;

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            const newText = document.getElementById('editTaskInput').value.trim();
            if (newText) {
                task.text = newText;
                task.dueDate = document.getElementById('editTaskDate').value;
                task.dueTime = document.getElementById('editTaskTime').value;
                task.priority = document.getElementById('editTaskPriority').value;
                
                this.saveTasks();
                this.closeModal();
                this.updateUI();
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('editModal');
        modal.style.animation = 'slideOutUp 0.3s ease-out';
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.style.animation = '';
            this.editingTaskId = null;
        }, 300);
    }

    setFilter(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.currentFilter = filter;
        this.applyFilters();
    }

    setSort(sort) {
        this.currentSort = sort;
        this.updateUI();
    }

    // Fixed search function
    searchTasks(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase();
        this.applyFilters();
    }

    // Unified filter function
    applyFilters() {
        const searchTerm = this.currentSearchTerm || '';
        const taskElements = document.querySelectorAll('.task-item');
        
        taskElements.forEach(element => {
            const taskId = parseInt(element.dataset.taskId);
            const task = this.tasks.find(t => t.id === taskId);
            
            if (!task) return;
            
            let shouldShow = true;
            
            // Filter by completion status
            if (this.currentFilter === 'active' && task.completed) {
                shouldShow = false;
            } else if (this.currentFilter === 'completed' && !task.completed) {
                shouldShow = false;
            }
            
            // Filter by search term
            if (searchTerm && !task.text.toLowerCase().includes(searchTerm)) {
                shouldShow = false;
            }
            
            // Apply filter animation
            if (shouldShow) {
                if (element.classList.contains('filter-out')) {
                    element.classList.remove('filter-out');
                    element.classList.add('filter-in');
                }
                element.style.display = 'block';
            } else {
                element.classList.add('filter-out');
                setTimeout(() => {
                    element.style.display = 'none';
                }, 200);
            }
        });
        
        this.updateStats();
        this.updateEmptyState();
    }

    sortTasks(tasks) {
        switch (this.currentSort) {
            case 'dueDate':
                return tasks.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    
                    const dateA = new Date(`${a.dueDate} ${a.dueTime || '00:00'}`);
                    const dateB = new Date(`${b.dueDate} ${b.dueTime || '00:00'}`);
                    return dateA - dateB;
                });
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            case 'alphabetical':
                return tasks.sort((a, b) => a.text.localeCompare(b.text));
            default: // dateAdded
                return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }

    clearCompleted() {
        const completedTasks = document.querySelectorAll('.task-item.completed');
        
        completedTasks.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('removing');
            }, index * 100);
        });
        
        setTimeout(() => {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.updateUI();
        }, completedTasks.length * 100 + 400);
    }

    // Fixed theme toggle
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        
        // Save theme preference
        localStorage.setItem('todoTheme', this.currentTheme);
        
        // Add theme transition animation
        document.body.style.transition = 'all 0.3s ease-in-out';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('todoTheme') || 'light';
        this.currentTheme = savedTheme;
        document.body.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
        }
    }

    updateUI() {
        this.renderTasks();
        this.updateStats();
        this.updateEmptyState();
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const sortedTasks = this.sortTasks([...this.tasks]);
        
        taskList.innerHTML = '';
        
        sortedTasks.forEach((task, index) => {
            const taskElement = this.createTaskElement(task);
            taskElement.style.animationDelay = `${index * 0.1}s`;
            taskList.appendChild(taskElement);
        });
        
        // Apply current filters after rendering
        setTimeout(() => {
            this.applyFilters();
        }, 100);
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.setAttribute('data-task-id', task.id);
        
        const dueDateStatus = this.getDueDateStatus(task);
        const dueDateClass = dueDateStatus.isOverdue ? 'overdue' : dueDateStatus.isDueSoon ? 'due-soon' : '';
        
        taskDiv.innerHTML = `
            <div class="task-content">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                    <span class="checkmark">✓</span>
                </div>
                <div class="task-main">
                    <p class="task-text" data-task-id="${task.id}">${this.escapeHtml(task.text)}</p>
                    <div class="task-meta">
                        <div class="priority-indicator ${task.priority}"></div>
                        <span class="priority-text">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                        ${task.dueDate ? `
                            <div class="task-due-date ${dueDateClass}">
                                <span>📅</span>
                                <span>${this.formatDate(task.dueDate)}${task.dueTime ? ` at ${this.formatTime(task.dueTime)}` : ''}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" data-task-id="${task.id}" title="Edit task">
                        ✏️
                    </button>
                    <button class="task-action-btn delete-btn" data-task-id="${task.id}" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to the created elements
        this.addTaskEventListeners(taskDiv, task.id);
        
        return taskDiv;
    }

    // Fixed event binding for dynamically created elements
    addTaskEventListeners(taskElement, taskId) {
        // Checkbox toggle
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('click', () => {
            this.toggleTask(taskId);
        });

        // Task text click for editing
        const taskText = taskElement.querySelector('.task-text');
        taskText.addEventListener('click', () => {
            this.editTask(taskId);
        });

        // Edit button
        const editBtn = taskElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editTask(taskId);
        });

        // Delete button
        const deleteBtn = taskElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(taskId);
        });
    }

    getDueDateStatus(task) {
        if (!task.dueDate) return { isOverdue: false, isDueSoon: false };
        
        const now = new Date();
        const dueDate = new Date(`${task.dueDate} ${task.dueTime || '23:59'}`);
        const diffHours = (dueDate - now) / (1000 * 60 * 60);
        
        return {
            isOverdue: diffHours < 0,
            isDueSoon: diffHours > 0 && diffHours <= 24
        };
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('activeTasks').textContent = active;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('taskCounter').textContent = `${active} ${active === 1 ? 'item' : 'items'} left`;
        
        // Update clear completed button
        const clearBtn = document.getElementById('clearCompleted');
        clearBtn.disabled = completed === 0;
        clearBtn.textContent = completed > 0 ? `Clear Completed (${completed})` : 'Clear Completed';
    }

    updateEmptyState() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const visibleTasks = taskList.querySelectorAll('.task-item:not([style*="display: none"])');
        
        if (visibleTasks.length === 0) {
            emptyState.style.display = 'block';
            
            // Update empty state message based on filter
            const emptyIcon = emptyState.querySelector('.empty-icon');
            const emptyTitle = emptyState.querySelector('h3');
            const emptyText = emptyState.querySelector('p');
            
            if (this.currentFilter === 'active') {
                emptyIcon.textContent = '🎉';
                emptyTitle.textContent = 'All caught up!';
                emptyText.textContent = 'No active tasks remaining.';
            } else if (this.currentFilter === 'completed') {
                emptyIcon.textContent = '📋';
                emptyTitle.textContent = 'No completed tasks';
                emptyText.textContent = 'Complete some tasks to see them here.';
            } else {
                emptyIcon.textContent = '📝';
                emptyTitle.textContent = 'No tasks yet';
                emptyText.textContent = 'Add your first task to get started!';
            }
        } else {
            emptyState.style.display = 'none';
        }
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('todoTasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const app = new TodoApp();

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add ripple effect to buttons
    function addRippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.className = 'ripple';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Add ripple CSS
    const style = document.createElement('style');
    style.textContent = `
        .btn, .task-action-btn, .filter-btn, .add-btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* Fix selection highlighting issue */
        *::selection {
            background-color: rgba(102, 126, 234, 0.3);
        }
        
        *::-moz-selection {
            background-color: rgba(102, 126, 234, 0.3);
        }
    `;
    document.head.appendChild(style);
    
    // Apply ripple effect to buttons
    document.addEventListener('click', function(event) {
        if (event.target.matches('.btn, .task-action-btn, .filter-btn, .add-btn')) {
            addRippleEffect(event);
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Escape to close modal
        if (event.key === 'Escape') {
            app.closeModal();
        }
        
        // Ctrl/Cmd + / to focus search
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Ctrl/Cmd + N to focus new task input
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            document.getElementById('taskInput').focus();
        }
    });
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
});