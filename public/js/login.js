document.addEventListener('DOMContentLoaded', () => {

    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');

    // Variáveis de estado para o 2FA
    let is2FAMode = false;
    let currentUserId = null;

    const API_URL = 'http://localhost:3333/api/v1/auth';
    const API_2FA_URL = 'http://localhost:3333/api/v1/auth/verify-2fa';

    const handleLogin = async () => {

        errorMessage.style.color = ''; // Reset da cor antes de qualquer mensagem
        errorMessage.classList.remove('active');
        errorMessage.textContent = '';
        loginButton.disabled = true;

        // SE ESTIVERMOS NO MODO 2FA (Digitando o código do Admin)
        if (is2FAMode) {
            loginButton.textContent = 'Validando Código...';
            const codigo = senhaInput.value;

            try {
                const response = await fetch(API_2FA_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // O cookie httpOnly é gerenciado pelo servidor
                    body: JSON.stringify({ userId: currentUserId, code: codigo })
                });
                const data = await response.json();

                if (response.status === 200) {
                    finalizarLogin(data);
                } else {
                    showError(data.error || 'Código inválido.');
                }
            } catch (error) {
                showError('Erro de conexão ao validar código.');
            }
            return;
        }

        // SE FOR O LOGIN NORMAL (Email e Senha)
        loginButton.textContent = 'Entrando...';
        const email = emailInput.value;
        const senha = senhaInput.value;

        if (!email || !senha) {
            showError('Por favor, preencha o e-mail e a senha.');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Permite que o servidor defina o cookie httpOnly
                body: JSON.stringify({ email: email, password: senha })
            });

            const data = await response.json();

            if (response.status === 200) {
                // Usuário turista: Login aprovado direto
                finalizarLogin(data);
            } else if (response.status === 202) {
                // Admin: Servidor pediu 2FA. Transforma a tela para receber o código
                is2FAMode = true;
                currentUserId = data.userId;

                emailInput.style.display = 'none';
                senhaInput.value = '';
                senhaInput.type = 'text';
                senhaInput.placeholder = 'Digite o código de 6 dígitos';

                // Exibe aviso amigável (azul = informativo, não erro)
                errorMessage.style.color = '#15ADE5';
                showError('Código enviado para o seu e-mail. Digite abaixo:');
            } else {
                showError(data.error || data.message || 'Credenciais inválidas.');
            }

        } catch (error) {
            console.error('Erro de conexão:', error);
            showError('Não foi possível conectar ao servidor.');
        }
    };

    // Salva apenas dados de UI no localStorage — NUNCA o token de autenticação.
    // O token de auth vive exclusivamente no cookie httpOnly gerenciado pelo servidor.
    const finalizarLogin = (data) => {
        if (data.user && data.user.user_name) {
            localStorage.setItem('userName', data.user.user_name);
            localStorage.setItem('tipoUsuario', data.user.tipo_usuario);
        }
        window.location.href = '/public/pages/home.html';
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        loginButton.disabled = false;
        loginButton.textContent = is2FAMode ? 'Validar Código' : 'Entrar';
    };

    loginButton.addEventListener('click', handleLogin);

    senhaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

});
