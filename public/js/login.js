document.addEventListener('DOMContentLoaded', () => {
    
    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');

    const API_URL = 'http://localhost:3333/auth';

    const handleLogin = async () => {
        
        errorMessage.classList.remove('active');
        errorMessage.textContent = '';
        loginButton.disabled = true;
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email, 
                    password: senha 
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                if (data.user && data.user.user_name) {
                    localStorage.setItem('userName', data.user.user_name);
                }
                window.location.href = '/public/pages/home.html';            
            } else {
                showError(data.error || data.message || 'E-mail ou senha incorretos.');
            }

        } catch (error) {
            console.error('Erro de conexão:', error);
            showError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        loginButton.disabled = false;
        loginButton.textContent = 'Entrar';
    };

    loginButton.addEventListener('click', handleLogin);
    
    senhaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

});