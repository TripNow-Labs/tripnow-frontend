class TripHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupDropdown();
    }

    render() {
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
        <style>
            :host { display: block; font-family: 'Roboto', sans-serif; }
            .main-header { 
                background-color: #FFFFFF; 
                padding: 10px 0; 
                border-bottom: 1px solid #E5E7EB; 
            }
            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 0 20px; 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
            }
            .logo img { height: 40px; }
            .profile-dropdown-container { position: relative; }
            .menuhbg {
                background: none; border: none; cursor: pointer; padding: 8px;
                display: flex; align-items: center; color: #1A1A1A;
            }
            .dropdown-menu {
                display: none; position: absolute; top: 100%; right: 0;
                width: 200px; background: white; border: 1px solid #E5E7EB;
                border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                z-index: 1000; margin-top: 10px; overflow: hidden;
            }
            .dropdown-menu.show { display: block; animation: fadeIn 0.2s ease-out; }
            .dropdown-header { padding: 12px 20px; background: #f9fafb; border-bottom: 1px solid #eee; font-weight: bold; }
            .dropdown-item {
                display: flex; align-items: center; gap: 12px; padding: 12px 20px;
                color: #333; text-decoration: none; font-size: 0.9rem; transition: background 0.2s;
            }
            .dropdown-item:hover { background: #f3f4f6; color: #15ADE5; }
            
            /* Destaque visual para o botão de admin */
            .admin-item { color: #d32f2f !important; font-weight: 500; }
            .admin-item:hover { background: #ffebee !important; color: #b71c1c !important; }

            .dropdown-divider { height: 1px; background: #E5E7EB; margin: 5px 0; }
            .logout { color: #e63946 !important; }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
        <header class="main-header">
            <div class="container">
                <div class="logo">
                    <a href="/public/pages/home.html"><img src="/public/logos/logo.jpeg" alt="Trip Now Logo"></a>
                </div>
                <div class="profile-dropdown-container">
                    <button class="menuhbg" id="trigger">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <div class="dropdown-menu" id="dropdown">
                        <div class="dropdown-header" id="user-greeting">Olá, Viajante!</div>
                        <a href="/public/pages/home.html" class="dropdown-item"><i class="fas fa-home"></i> Início</a>
                        <a href="/public/pages/EscolherDestino.html" class="dropdown-item"><i class="fas fa-plus-circle"></i> Criar Roteiro</a>
                        <a href="/public/pages/perfil.html" class="dropdown-item"><i class="fas fa-user-circle"></i> Meu Perfil</a>
                        <a href="/public/pages/meusRoteiros.html" class="dropdown-item"><i class="fas fa-map-marked-alt"></i> Meus Roteiros</a>
                        <div class="dropdown-divider" id="menu-divider"></div>
                        <a href="#" class="dropdown-item logout" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Sair</a>
                    </div>
                </div>
            </div>
        </header>
        `;
    }

    setupDropdown() {
        const trigger = this.shadowRoot.getElementById('trigger');
        const dropdown = this.shadowRoot.getElementById('dropdown');
        const logoutBtn = this.shadowRoot.getElementById('logout-btn');
        const greetingElement = this.shadowRoot.getElementById('user-greeting');
        const divider = this.shadowRoot.getElementById('menu-divider');

        // --- MÁGICA 1: Personalizar o nome no menu ---
        const userName = localStorage.getItem('userName');
        if (userName) {
            greetingElement.textContent = `Olá, ${userName.split(' ')[0]}!`; // Pega só o primeiro nome
        }

        // --- MÁGICA 2: Injetar o Painel Admin se for administrador ---
        const tipoUsuario = localStorage.getItem('tipoUsuario');
        if (tipoUsuario === 'admin') {
            const adminItem = document.createElement('a');
            adminItem.href = '/public/pages/admin.html'; // Confirme se o caminho do seu admin.html é este ou /public/pages/admin.html
            adminItem.className = 'dropdown-item admin-item';
            adminItem.innerHTML = '<i class="fas fa-user-shield"></i> Painel Admin';
            
            // Insere o botão de admin logo acima da linha divisória do botão "Sair"
            dropdown.insertBefore(adminItem, divider);
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) dropdown.classList.remove('show');
        });

        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('http://localhost:3333/api/v1/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (err) {
                console.error('Erro ao fazer logout na API', err);
            }
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('tipoUsuario'); // Importante limpar o cargo ao sair!
            window.location.href = '/public/pages/login.html';
        });
    }
}
customElements.define('trip-header', TripHeader);