document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.close');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const exploreBtn = document.getElementById('exploreBtn');
    
    // Dados de usuários (simulando um banco de dados)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let events = JSON.parse(localStorage.getItem('events')) || [];
    
    // Função para exibir modal
    function showModal(modal) {
        modal.style.display = 'block';
    }
    
    // Função para fechar modal
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    // Event Listeners
    if (loginBtn) loginBtn.addEventListener('click', () => showModal(loginModal));
    if (registerBtn) registerBtn.addEventListener('click', () => showModal(registerModal));
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            document.querySelector('#eventos').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (closeButtons) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
    }
    
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(loginModal);
            showModal(registerModal);
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(registerModal);
            showModal(loginModal);
        });
    }
    
    // Fechar modal ao clicar fora dele
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeModal(loginModal);
        }
        if (e.target === registerModal) {
            closeModal(registerModal);
        }
    });
    
    // Cadastro de usuário
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // Validações
            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }
            
            if (password.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres!');
                return;
            }
            
            // Verificar se o usuário já existe
            const userExists = users.some(user => user.email === email);
            
            if (userExists) {
                alert('Este email já está cadastrado!');
                return;
            }
            
            // Criar novo usuário
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password // Em uma aplicação real, a senha seria hasheada
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            registerForm.reset();
            closeModal(registerModal);
            showModal(loginModal);
        });
    }
    
    // Login de usuário
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Verificar credenciais
            const user = users.find(user => user.email === email && user.password === password);
            
            if (user) {
                alert(`Bem-vindo, ${user.name}!`);
                localStorage.setItem('currentUser', JSON.stringify(user));
                loginForm.reset();
                closeModal(loginModal);
                
                // Atualizar UI para usuário logado
                updateAuthUI(user);
                loadEvents();
            } else {
                alert('Email ou senha incorretos!');
            }
        });
    }
    
    // Verificar se há usuário logado ao carregar a página
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        updateAuthUI(currentUser);
    }
    
    // Função para atualizar a UI quando o usuário está logado
    function updateAuthUI(user) {
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="user-profile">
                    <span>Olá, ${user.name}</span>
                    <button id="createEventBtn" class="btn btn-primary">Criar Evento</button>
                    <button id="logoutBtn" class="btn btn-outline">Sair</button>
                </div>
            `;
            
            document.getElementById('logoutBtn').addEventListener('click', logout);
            document.getElementById('createEventBtn').addEventListener('click', showCreateEventModal);
        }
    }
    
    // Modal de criação de evento
    function showCreateEventModal() {
        const modal = document.createElement('div');
        modal.id = 'createEventModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Criar Novo Evento</h2>
                <form id="eventForm">
                    <div class="form-group">
                        <label for="eventTitle">Título do Evento</label>
                        <input type="text" id="eventTitle" required>
                    </div>
                    <div class="form-group">
                        <label for="eventDescription">Descrição</label>
                        <textarea id="eventDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="eventDate">Data</label>
                        <input type="date" id="eventDate" required>
                    </div>
                    <div class="form-group">
                        <label for="eventLocation">Localização</label>
                        <input type="text" id="eventLocation" required>
                    </div>
                    <div class="form-group">
                        <label for="eventImage">URL da Imagem</label>
                        <input type="url" id="eventImage" placeholder="https://exemplo.com/imagem.jpg">
                    </div>
                    <button type="submit" class="btn btn-primary">Criar Evento</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        showModal(modal);
        
        // Fechar modal
        modal.querySelector('.close').addEventListener('click', () => {
            closeModal(modal);
            modal.remove();
        });
        
        // Formulário de criação de evento
        modal.querySelector('#eventForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Você precisa estar logado para criar um evento!');
                return;
            }
            
            const newEvent = {
                id: Date.now().toString(),
                organizerId: currentUser.id,
                organizerName: currentUser.name,
                title: document.getElementById('eventTitle').value,
                description: document.getElementById('eventDescription').value,
                date: document.getElementById('eventDate').value,
                location: document.getElementById('eventLocation').value,
                image: document.getElementById('eventImage').value || 'https://source.unsplash.com/random/600x400/?event'
            };
            
            // Salvar evento
            events = JSON.parse(localStorage.getItem('events')) || [];
            events.push(newEvent);
            localStorage.setItem('events', JSON.stringify(events));
            
            alert('Evento criado com sucesso!');
            this.reset();
            closeModal(modal);
            modal.remove();
            loadEvents(); // Recarregar a lista de eventos
        });
    }
    
    // Carregar eventos
    function loadEvents() {
        const eventsGrid = document.querySelector('.events-grid');
        if (!eventsGrid) return;
        
        events = JSON.parse(localStorage.getItem('events')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-events">Nenhum evento encontrado. Seja o primeiro a criar um!</p>';
            return;
        }
        
        eventsGrid.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="event-image" style="background-image: url('${event.image}')"></div>
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="event-meta">
                        <div>
                            <span><i class="fas fa-calendar-alt"></i> ${formatDate(event.date)}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                            <span><i class="fas fa-user"></i> ${event.organizerName}</span>
                        </div>
                        ${currentUser && currentUser.id === event.organizerId ? 
                            `<button class="btn btn-danger btn-small delete-event" data-id="${event.id}">Excluir</button>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Adicionar listeners para botões de exclusão
        document.querySelectorAll('.delete-event').forEach(button => {
            button.addEventListener('click', function() {
                if (confirm('Tem certeza que deseja excluir este evento?')) {
                    deleteEvent(this.dataset.id);
                }
            });
        });
    }
    
    // Formatar data
    function formatDate(dateString) {
        if (!dateString) return 'Data não definida';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }
    
    // Excluir evento
    function deleteEvent(eventId) {
        events = events.filter(event => event.id !== eventId);
        localStorage.setItem('events', JSON.stringify(events));
        loadEvents();
    }
    
    // Função de logout
    function logout() {
        localStorage.removeItem('currentUser');
        location.reload();
    }
    
    // Carregar eventos ao iniciar
    loadEvents();
});