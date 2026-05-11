document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const formCadastro = document.getElementById('form-cadastro');
    const formVerification = document.getElementById('form-verification');
    
    const stepSignup = document.getElementById('step-signup');
    const stepVerification = document.getElementById('step-verification');
    
    const feedbackMessage = document.getElementById('feedback-message');
    const emailDisplay = document.getElementById('email-display');

    // Inputs
    const nameInput = document.getElementById('name');
    const userNameInput = document.getElementById('user_name');
    const emailInput = document.getElementById('input-email');
    const passwordInput = document.getElementById('input-password');
    const confirmPassInput = document.getElementById('input-confirm-password');
    const codeInput = document.getElementById('code');

    // URL base da API do seu backend (com o prefixo /api/v1)
    const API_BASE_URL = 'http://localhost:3333/api/v1'; 

    // --- FUNÇÕES UTILITÁRIAS ---
    
    // Exibe mensagens de erro ou sucesso
    const showMessage = (msg, type = 'error') => {
        feedbackMessage.textContent = msg;
        feedbackMessage.style.display = 'block';
        feedbackMessage.style.color = type === 'error' ? '#d32f2f' : '#2e7d32';
        feedbackMessage.style.backgroundColor = type === 'error' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(46, 125, 50, 0.1)';
    };

    const clearMessage = () => {
        feedbackMessage.style.display = 'none';
    };

    // Validador de E-mail com Regex
    const isValidEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).toLowerCase());
    };

    // --- LÓGICA DOS ÍCONES DE SENHA ---
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash'); // Muda para olho cortado
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye'); // Muda para olho normal
            }
        });
    });

    // --- ETAPA 1: ENVIAR DADOS DO CADASTRO ---
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        if (!isValidEmail(emailInput.value)) {
            showMessage('Por favor, insira um endereço de e-mail válido.');
            return;
        }

        if (passwordInput.value !== confirmPassInput.value) {
            showMessage('As senhas não conferem.');
            return;
        }

        if (passwordInput.value.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        const btnCadastrar = document.getElementById('btn-cadastrar');
        btnCadastrar.disabled = true;
        btnCadastrar.textContent = 'Enviando...';

        const payload = {
            name: nameInput.value,
            user_name: userNameInput.value,
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/createuserverify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Código enviado para seu e-mail!', 'success');
                
                emailDisplay.textContent = emailInput.value;
                
                stepSignup.classList.add('hidden');
                stepVerification.classList.remove('hidden');
            } else {
                showMessage(data.error || data.message || 'Erro ao cadastrar.');
            }

        } catch (error) {
            console.error(error);
            showMessage('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        } finally {
            btnCadastrar.disabled = false;
            btnCadastrar.textContent = 'Cadastrar';
        }
    });

    // --- VERIFICAÇÃO DO CÓDIGO ---
    formVerification.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const btnVerificar = document.getElementById('btn-verificar');
        btnVerificar.disabled = true;
        btnVerificar.textContent = 'Verificando...';

        const payload = {
            email: emailInput.value,
            code: codeInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/createuserverifycode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Conta verificada com sucesso! Você será redirecionado para o login.');
                // Redireciona para a tela de login (index.html na raiz public)
                window.location.href = 'login.html';
            } else {
                showMessage(data.error || data.message || 'Código inválido ou expirado.');
            }

        } catch (error) {
            console.error(error);
            showMessage('Erro ao verificar código.');
        } finally {
            btnVerificar.disabled = false;
            btnVerificar.textContent = 'Verificar Código';
        }
    });
});