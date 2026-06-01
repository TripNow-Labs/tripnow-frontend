document.addEventListener('DOMContentLoaded', () => {

    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');

    const API_URL = 'http://localhost:3333/api/v1/auth';

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
            credentials: 'include', // Permite que o navegador salve o cookie httpById
                body: JSON.stringify({
                    email: email,
                    password: senha
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user && data.user.user_name) {
                    localStorage.setItem('userName', data.user.user_name);
                }
            if (data.token) {
                localStorage.setItem('token', data.token);
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

    // ===== RECUPERAÇÃO DE SENHA =====

    const modal           = document.getElementById('reset-modal');
    const modalClose      = document.getElementById('reset-modal-close');
    const forgotLink      = document.getElementById('forgot-password-link');

    // Etapas
    const step1 = document.getElementById('reset-step-1');
    const step2 = document.getElementById('reset-step-2');
    const step3 = document.getElementById('reset-step-3');
    const step4 = document.getElementById('reset-step-4');

    // Botões
    const sendCodeBtn    = document.getElementById('reset-send-code-btn');
    const verifyCodeBtn  = document.getElementById('reset-verify-code-btn');
    const resendBtn      = document.getElementById('reset-resend-btn');
    const saveBtn        = document.getElementById('reset-save-btn');
    const doneBtn        = document.getElementById('reset-done-btn');

    // Campos
    const resetEmailInput    = document.getElementById('reset-email');
    const resetCodeInput     = document.getElementById('reset-code');
    const resetNewPwInput    = document.getElementById('reset-new-password');
    const resetConfirmPwInput= document.getElementById('reset-confirm-password');

    // Erros
    const err1 = document.getElementById('reset-error-1');
    const err2 = document.getElementById('reset-error-2');
    const err3 = document.getElementById('reset-error-3');

    let resetEmail = '';

    const showStep = (stepEl) => {
        [step1, step2, step3, step4].forEach(s => s.style.display = 'none');
        stepEl.style.display = 'block';
    };

    const showResetError = (el, msg) => {
        el.textContent = msg;
        el.classList.add('active');
    };

    const clearResetError = (el) => {
        el.textContent = '';
        el.classList.remove('active');
    };

    const setLoading = (btn, loading, text, loadingText) => {
        btn.disabled = loading;
        btn.textContent = loading ? loadingText : text;
    };

    // Abre o modal
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        showStep(step1);
        clearResetError(err1);
        resetEmailInput.value = '';
        modal.style.display = 'flex';
    });

    // Fecha o modal
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Etapa 1: Enviar código
    sendCodeBtn.addEventListener('click', async () => {
        clearResetError(err1);
        const email = resetEmailInput.value.trim();

        if (!email) {
            showResetError(err1, 'Por favor, informe o seu e-mail.');
            return;
        }

        setLoading(sendCodeBtn, true, 'Enviar código', 'Enviando...');

        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                resetEmail = email;
                resetCodeInput.value = '';
                clearResetError(err2);
                showStep(step2);
            } else {
                showResetError(err1, data.message || 'Erro ao enviar o código.');
            }
        } catch (error) {
            showResetError(err1, 'Não foi possível conectar ao servidor.');
        }

        setLoading(sendCodeBtn, false, 'Enviar código', 'Enviando...');
    });

    // Etapa 1 → Enter
    resetEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendCodeBtn.click();
    });

    // Etapa 2: Reenviar código
    resendBtn.addEventListener('click', async () => {
        clearResetError(err2);
        setLoading(resendBtn, true, 'Reenviar código', 'Reenviando...');

        try {
            await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            });
            showResetError(err2, 'Um novo código foi enviado para o seu e-mail.');
            err2.style.color = '#28a745';
            err2.style.background = 'rgba(40,167,69,0.08)';
            err2.style.borderColor = 'rgba(40,167,69,0.3)';
        } catch {
            showResetError(err2, 'Não foi possível reenviar o código.');
        }

        setLoading(resendBtn, false, 'Reenviar código', 'Reenviando...');
    });

    // Etapa 2: Verificar código
    verifyCodeBtn.addEventListener('click', () => {
        clearResetError(err2);
        err2.style.color = '';
        err2.style.background = '';
        err2.style.borderColor = '';

        const code = resetCodeInput.value.trim();

        if (!code || code.length !== 6) {
            showResetError(err2, 'Informe o código de 6 dígitos recebido no e-mail.');
            return;
        }

        // Guardamos o código para usar na etapa 3
        resetCodeInput.dataset.verified = code;
        resetNewPwInput.value = '';
        resetConfirmPwInput.value = '';
        clearResetError(err3);
        showStep(step3);
    });

    resetCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyCodeBtn.click();
    });

    // Etapa 3: Salvar nova senha
    saveBtn.addEventListener('click', async () => {
        clearResetError(err3);

        const newPassword    = resetNewPwInput.value;
        const confirmPassword= resetConfirmPwInput.value;
        const code           = resetCodeInput.dataset.verified;

        if (!newPassword || !confirmPassword) {
            showResetError(err3, 'Por favor, preencha os dois campos de senha.');
            return;
        }

        if (newPassword.length < 6) {
            showResetError(err3, 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showResetError(err3, 'As senhas não coincidem.');
            return;
        }

        setLoading(saveBtn, true, 'Salvar nova senha', 'Salvando...');

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, code, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showStep(step4);
            } else {
                showResetError(err3, data.message || 'Erro ao redefinir a senha.');
                // Se o código era inválido, volta para a etapa 2
                if (response.status === 400 && data.message && data.message.toLowerCase().includes('código')) {
                    setTimeout(() => showStep(step2), 1500);
                }
            }
        } catch {
            showResetError(err3, 'Não foi possível conectar ao servidor.');
        }

        setLoading(saveBtn, false, 'Salvar nova senha', 'Salvando...');
    });

    // Etapa 4: Fechar e ir para o login
    doneBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        emailInput.focus();
    });

});