document.addEventListener('DOMContentLoaded', () => {

    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');

    let is2FAMode = false;
    let currentUserId = null;

    const API_URL = 'http://localhost:3333/api/v1/auth';
    const API_2FA_URL = 'http://localhost:3333/api/v1/auth/verify-2fa';

    const handleLogin = async () => {
        errorMessage.classList.remove('active');
        errorMessage.textContent = '';
        loginButton.disabled = true;
        
        if (is2FAMode) {
            loginButton.textContent = 'Validando Código...';
            const codigo = senhaInput.value; 
            
            try {
                const response = await fetch(API_2FA_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
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
                credentials: 'include',
                body: JSON.stringify({ email: email, password: senha })
            });

            const data = await response.json();

            if (response.status === 200) {
                finalizarLogin(data);

            } else if (response.status === 202) {
                is2FAMode = true;
                currentUserId = data.userId;
                
                emailInput.style.display = 'none';
                senhaInput.value = '';
                senhaInput.type = 'text';
                senhaInput.placeholder = 'Digite o código de 6 dígitos';
                
                document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                
                showError('Código enviado para o e-mail. Digite abaixo:');
                errorMessage.style.color = '#15ADE5'; 
            } else {
                showError(data.error || data.message || 'Credenciais inválidas.');
            }

        } catch (error) {
            console.error('Erro de conexão:', error);
            showError('Não foi possível conectar ao servidor.');
        }
    };

    const finalizarLogin = (data) => {
        if (data.user && data.user.user_name) {
            localStorage.setItem('userName', data.user.user_name);
            localStorage.setItem('tipoUsuario', data.user.tipo_usuario);
        }
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        window.location.href = '/public/pages/home.html';
    }

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
