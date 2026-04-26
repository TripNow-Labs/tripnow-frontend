document.addEventListener('DOMContentLoaded', () => {

    // --- 🚨 INTERCEPTADOR GLOBAL DE FETCH ---
    // Adiciona credentials a todas as requisições e gerencia a rotação de tokens (Refresh Token silencioso)
    let isRefreshing = false;
    let refreshSubscribers = [];

    function onRefreshed(isSuccess) {
        refreshSubscribers.forEach(cb => cb(isSuccess));
        refreshSubscribers = [];
    }

    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        // Automatically add credentials: 'include' for HttpOnly cookies to work
        if (args.length === 1) {
            args.push({ credentials: 'include' });
        } else if (args.length === 2) {
            args[1] = args[1] || {};
            args[1].credentials = 'include';
            
            // Remove Authorization header if it exists, as we now use HttpOnly cookies
            if (args[1].headers) {
                if (args[1].headers instanceof Headers) {
                    args[1].headers.delete('Authorization');
                } else if (typeof args[1].headers === 'object') {
                    delete args[1].headers['Authorization'];
                }
            }
        }

        try {
            const response = await originalFetch.apply(this, args);
            
            // Se retornar 401 e não for uma rota de login/auth (para evitar loop infinito)
            const requestUrl = typeof args[0] === 'string' ? args[0] : (args[0].url || '');
            const isAuthEndpoint = requestUrl.includes('/auth') || requestUrl.includes('/login');
            
            if (response.status === 401 && !isAuthEndpoint) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    // Tenta atualizar o token usando o cookie HttpOnly refreshToken
                    originalFetch('http://localhost:3333/api/v1/auth/refresh', {
                        method: 'POST',
                        credentials: 'include' // Envia o cookie refreshToken
                    }).then(res => {
                        isRefreshing = false;
                        if (res.ok) {
                            onRefreshed(true); // Sucesso! Notifica as chamadas paradas.
                        } else {
                            onRefreshed(false);
                            forceLogout();
                        }
                    }).catch(err => {
                        isRefreshing = false;
                        onRefreshed(false);
                        forceLogout();
                    });
                }

                // Aguarda o resultado do refresh e TENTA A REQUISIÇÃO ORIGINAL NOVAMENTE
                return new Promise((resolve) => {
                    refreshSubscribers.push((isSuccess) => {
                        if (isSuccess) {
                            // Sucesso no refresh, tenta o fetch original que tinha dado 401
                            resolve(originalFetch.apply(window, args));
                        } else {
                            resolve(response); // Retorna o 401 original para a UI tratar
                        }
                    });
                });
            }

            return response;
        } catch (error) {
            throw error;
        }
    };

    function forceLogout() {
        const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('cadastro');
        if (!isAuthPage) {
            alert("Sessão expirada ou não autorizada pela API (Erro 401). Faça login novamente.");
            localStorage.removeItem('userName');
            window.location.href = '/public/pages/login.html'; 
        }
    }

    // --- AUTH CHECK ---
    // Como a segurança está no cookie, usamos o userName como indicativo de sessão no frontend
    const isLoggedLocally = localStorage.getItem('userName');

    // Lista de páginas que NÃO precisam de auth (se houver alguma dentro de /pages que seja pública, adicione aqui)
    // Por padrão, assumimos que tudo em /pages precisa de login, exceto login.html e cadastro.html que estão fora ou tratados

    // Verifica se não estamos na página de login ou cadastro para evitar loop
    const isPublicPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('cadastro.html');

    if (!isLoggedLocally && !isPublicPage) {
        // Redireciona para o login se não tiver token
        // Ajuste o caminho conforme a estrutura de pastas. 
        // Se estiver em /public/pages/..., voltar para /public/index.html ou /public/pages/login.html
        window.location.href = '/public/index.html';
        return;
    }

    // --- USER GREETING ---
    const userName = localStorage.getItem('userName');
    if (userName) {
        const greetingElement = document.getElementById('user-greeting');
        if (greetingElement) {
            const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
            greetingElement.textContent = `Olá, ${formattedName}!`;
        }
    }

    // --- MENU DROPDOWN ---
    const profileTrigger = document.getElementById('profile-menu-trigger');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (profileDropdown.classList.contains('show')) {
                if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
                    profileDropdown.classList.remove('show');
                }
            }
        });
    }

    // --- LOGOUT ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                // Chama a rota de logout no backend para limpar os cookies HttpOnly
                await window.fetch('http://localhost:3333/api/v1/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (err) {
                console.error("Erro ao fazer logout na API", err);
            }
            
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            window.location.href = '/public/pages/login.html';
        });
    }
});
