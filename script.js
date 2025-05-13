document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const itemsLeftSpan = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.querySelector('header').appendChild(themeToggle);
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTodos();
        updateItemsLeft();
        
        // Event Listeners
        addBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTodo();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', filterTodos);
        });
        
        clearCompletedBtn.addEventListener('click', clearCompleted);
        themeToggle.addEventListener('click', toggleTheme);
        
        // Set initial theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    // Add a new todo
    function addTodo() {
        const text = todoInput.value.trim();
        if (text !== '') {
            const newTodo = {
                id: Date.now(),
                text,
                completed: false,
                timestamp: new Date().toISOString()
            };
            
            todos.unshift(newTodo); // Add new items at the beginning
            saveTodos();
            renderTodos();
            updateItemsLeft();
            todoInput.value = '';
        }
    }
    
    // Render todos based on current filter
    function renderTodos() {
        todoList.innerHTML = '';
        
        let filteredTodos = [];
        
        switch (currentFilter) {
            case 'active':
                filteredTodos = todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filteredTodos = todos.filter(todo => todo.completed);
                break;
            default:
                filteredTodos = [...todos]; // Create a copy
        }
        
        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.classList.add('empty-message');
            
            if (currentFilter === 'all') {
                emptyMessage.textContent = '✨ Your todo list is empty!';
            } else if (currentFilter === 'active') {
                emptyMessage.textContent = '🎉 No active tasks!';
            } else {
                emptyMessage.textContent = '📝 No completed tasks yet!';
            }
            
            todoList.appendChild(emptyMessage);
        } else {
            filteredTodos.forEach(todo => {
                const todoItem = createTodoElement(todo);
                todoList.appendChild(todoItem);
            });
        }
    }
    
    // Create todo element
    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        if (todo.completed) li.classList.add('completed');
        li.setAttribute('data-id', todo.id);
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" aria-label="Delete task"><i class="fas fa-trash"></i></button>
        `;
        
        const checkbox = li.querySelector('.todo-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');
        const todoText = li.querySelector('.todo-text');
        
        checkbox.addEventListener('change', function() {
            toggleTodoComplete(todo.id);
        });
        
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteTodo(todo.id);
        });
        
        // Add double-click to edit
        todoText.addEventListener('dblclick', function() {
            editTodo(todo.id, todoText);
        });
        
        return li;
    }
    
    // Toggle todo completion status
    function toggleTodoComplete(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return {...todo, completed: !todo.completed};
            }
            return todo;
        });
        
        saveTodos();
        renderTodos();
        updateItemsLeft();
    }
    
    // Delete todo
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateItemsLeft();
    }
    
    // Edit todo
    function editTodo(id, element) {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.classList.add('edit-input');
        
        element.parentNode.replaceChild(input, element);
        input.focus();
        
        const handleBlur = () => {
            const newText = input.value.trim();
            if (newText && newText !== todo.text) {
                todo.text = newText;
                saveTodos();
                renderTodos();
            } else {
                renderTodos();
            }
        };
        
        input.addEventListener('blur', handleBlur);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleBlur();
            }
        });
    }
    
    // Filter todos
    function filterTodos(e) {
        currentFilter = e.target.dataset.filter;
        
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        e.target.classList.add('active');
        renderTodos();
    }
    
    // Clear completed todos
    function clearCompleted() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            todos = todos.filter(todo => !todo.completed);
            saveTodos();
            renderTodos();
            updateItemsLeft();
        }
    }
    
    // Update items left counter
    function updateItemsLeft() {
        const activeTodos = todos.filter(todo => !todo.completed).length;
        itemsLeftSpan.textContent = `${activeTodos} ${activeTodos === 1 ? 'item' : 'items'} left`;
    }
    
    // Toggle dark/light theme
    function toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Check for saved theme preference
    function checkSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    // Initialize the app
    checkSavedTheme();
    init();
});