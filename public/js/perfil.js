document.addEventListener('DOMContentLoaded', function() {
    
    // --- VARIÁVEIS GLOBAIS ---
    let currentUserId = null;

    // 1. Verifica Token
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/index.html';
        return;
    }

    // 2. Configuração da API
    const API_BASE = 'http://localhost:3333';
    const API_PROFILE_URL = `${API_BASE}/user/profile`;

    // 3. Mapeamento: [Nome no HTML (data-field)] : [Nome exato da coluna no Banco]
    const fieldMapping = {
        'nome': 'name',             // HTML: nome -> DB: name
        'email': 'email',           // HTML: email -> DB: email
        'telefone': 'telefone',     // HTML: telefone -> DB: telefone
        'cidade': 'cidade',         // HTML: cidade -> DB: cidade
        'pais': 'pais',             // HTML: pais -> DB: pais
        'bio': 'biografia',         // HTML: bio -> DB: biografia
        'nascimento': 'data_nascimento', // HTML: nascimento -> DB: data_nascimento
        'instagram': 'rede_social'  // HTML: instagram -> DB: rede_social
    };

    // --- LÓGICA DE CARREGAMENTO ---
    async function fetchAndLoadProfile() {
        try {
            const response = await fetch(API_PROFILE_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                // Se der erro 401, o token expirou
                if (response.status === 401) {
                    alert("Sessão expirada. Faça login novamente.");
                    localStorage.removeItem('token');
                    window.location.href = '/public/index.html';
                    return;
                }
                throw new Error('Erro ao buscar perfil');
            }

            // O Backend retorna o objeto User direto (com id, name, biografia, etc.)
            const userData = await response.json();

            console.log("Dados recebidos do Back-end:", userData);
            
            // [IMPORTANTE] Salva o ID que veio do banco para usar no PUT/DELETE
            currentUserId = userData.id;

            loadProfileInfo(userData);
            
            // Busca roteiros (se essa rota existir e estiver funcionando)
            fetchUserRoteiros();

        } catch (error) {
            console.error("Falha:", error);
            const nameEl = document.getElementById('user-profile-name');
            if(nameEl) nameEl.textContent = "Erro ao carregar";
        }
    }

    // --- BUSCAR ROTEIROS (Histórico) ---
    async function fetchUserRoteiros() {
        try {
            const response = await fetch(`${API_BASE}/roteiros`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const roteiros = await response.json();
                // ATUALIZA APENAS O CONTADOR DE ROTEIROS
            const countRoteirosEl = document.getElementById('count-roteiros');
            if (countRoteirosEl) {
                // Pega a quantidade de itens no array retornado pelo banco
                countRoteirosEl.textContent = roteiros.length; 
            }

            // Mantém o carregamento da lista visual no histórico
            loadHistory(roteiros);
        } else {
            loadHistory([]); 
        }
    } catch (error) {
        console.error("Erro ao buscar roteiros:", error);
        loadHistory([]);
    }
}

    function loadProfileInfo(data) {
        const userNameElement = document.getElementById('user-profile-name');
        const userPicElement = document.getElementById('user-profile-pic');

        // Atualiza Header (Nome e Foto)
        if (userNameElement) userNameElement.textContent = data.name || "Usuário";
        
        if (userPicElement && data.url_foto_perfil) {
             userPicElement.src = data.url_foto_perfil;
        }

        // Atualiza Formulário "Dados Pessoais"
        for (const [htmlField, dbField] of Object.entries(fieldMapping)) {
            const dbValue = data[dbField]; // Acessa usando a chave do banco (ex: data['biografia'])

            // Atualiza Texto (View Mode)
            const pElement = document.querySelector(`.view-mode[data-field="${htmlField}"]`);
            if (pElement) {
                // Formatação especial para Data
                if (htmlField === 'nascimento' && dbValue) {
                    // Tenta criar data. Se vier ISO string do banco, funciona.
                    const dateObj = new Date(dbValue);
                    if (!isNaN(dateObj)) {
                        // Ajuste de fuso horário simples para exibição correta
                        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
                        pElement.textContent = dateObj.toLocaleDateString('pt-BR');
                    } else {
                        pElement.textContent = dbValue;
                    }
                } else {
                    pElement.textContent = dbValue || ''; 
                }
            }
            
            // Atualiza Input (Edit Mode)
            const inputElement = document.querySelector(`.edit-mode[data-field="${htmlField}"]`);
            if (inputElement) {
                if (inputElement.type === 'date' && dbValue) {
                    const dateObj = new Date(dbValue);
                    if (!isNaN(dateObj)) {
                         dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
                         inputElement.value = dateObj.toISOString().split('T')[0];
                    }
                } else {
                    inputElement.value = dbValue || '';
                }
            }
        }
    }

    function loadHistory(roteiros) {
        const historyListContainer = document.getElementById('history-list-container');
        if (!historyListContainer) return;
        
        historyListContainer.innerHTML = '';
        
        if (!roteiros || roteiros.length === 0) {
            historyListContainer.innerHTML = '<p style="color: var(--cor-subtitulo); padding: 20px;">Você ainda não tem roteiros criados.</p>';
            return;
        }

        roteiros.forEach(roteiro => {
            let statusClass = 'status-planejado';
            let statusText = 'Planejado';
            
            // Lógica simples de status baseada na data
            if (roteiro.data_inicio) {
                const dataFim = new Date(roteiro.data_inicio);
                dataFim.setDate(dataFim.getDate() + (roteiro.duracao_dias || 0));
                if (new Date() > dataFim) {
                    statusClass = 'status-concluido';
                    statusText = 'Concluído';
                }
            }

            const dataFormatada = roteiro.data_inicio ? new Date(roteiro.data_inicio).toLocaleDateString('pt-BR') : 'Data a definir';
            const imgUrl = roteiro.cidade?.url_imagem || 'https://via.placeholder.com/60x60?text=Roteiro';

            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <img src="${imgUrl}" alt="Thumbnail" class="history-item-img">
                <div class="history-item-info">
                    <h3>${roteiro.titulo || 'Roteiro sem nome'}</h3>
                    <p>${dataFormatada} • ${roteiro.duracao_dias || '?'} dias</p>
                </div>
                <div class="history-item-status">
                    <span class="status-tag ${statusClass}">${statusText}</span>
                    <a href="/public/pages/roteiro-diario.html?id=${roteiro.id}" class="view-link">Ver</a>
                </div>
            `;
            historyListContainer.appendChild(li);
        });
    }

    // Inicializa
    fetchAndLoadProfile();


    // =========================================================
    // --- LÓGICA DE INTERFACE ---
    // =========================================================
    
    // 1. Abas
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.details-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(event) {
            event.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const targetContent = document.getElementById(this.getAttribute('data-tab'));
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // 2. Botão Editar/Salvar/Cancelar
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    const profileForm = document.getElementById('dados-pessoais');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (editProfileBtn) editProfileBtn.addEventListener('click', () => profileForm.classList.add('is-editing'));
    
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        profileForm.classList.remove('is-editing');
        fetchAndLoadProfile(); // Reseta os campos para o valor original
    });
    
    // --- LÓGICA DE SALVAR (PUT) ---
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            
            if (!currentUserId) {
                alert("Erro: ID de usuário não encontrado. Recarregue a página.");
                return;
            }

            const originalText = saveChangesBtn.innerHTML;
            saveChangesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            saveChangesBtn.disabled = true;

            // 1. Monta o Payload com as chaves corretas do Banco
            const payload = {};
            
            // Itera sobre o mapa para pegar os valores dos inputs
            for (const [htmlField, dbField] of Object.entries(fieldMapping)) {
                const input = profileForm.querySelector(`.edit-mode[data-field="${htmlField}"]`);
                if (input) {
                    payload[dbField] = input.value; // ex: payload.biografia = valor do input 'bio'
                }
            }    
                if (base64Photo) {
                    payload.url_foto_perfil = base64Photo; // Nome da coluna no seu UserController.js
                }
            

            try {
                // 2. Envia para a API
                const response = await fetch(`${API_BASE}/user/${currentUserId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("Perfil atualizado com sucesso!");
                    fetchAndLoadProfile(); // Recarrega para garantir sincronia
                    profileForm.classList.remove('is-editing');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || "Erro ao atualizar");
                }

            } catch (error) {
                console.error(error);
                alert("Erro ao salvar: " + error.message);
            } finally {
                saveChangesBtn.innerHTML = originalText;
                saveChangesBtn.disabled = false;
            }
        });
    }

    // 3. Upload Foto
    const cameraIcon = document.querySelector('.camera-icon');
    const fileUploadInput = document.getElementById('file-upload-input');
    const profilePicImg = document.getElementById('user-profile-pic');
    let base64Photo = null; // Variável global para guardar a nova foto

    if (cameraIcon && fileUploadInput) {
        cameraIcon.addEventListener('click', () => fileUploadInput.click());
        
        fileUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Pré-visualização imediata
            const reader = new FileReader();
        reader.onload = (ev) => { 
            if(profilePicImg) profilePicImg.src = ev.target.result; 
            base64Photo = ev.target.result; // Salva o código da imagem
            alert("Clique em 'Salvar Alterações' para confirmar a nova foto.");
        };

        reader.readAsDataURL(file);

            // [TODO] Implementar upload real da imagem para o servidor aqui
            // Por enquanto, como a API espera URL de texto, não podemos enviar o arquivo binário direto no PUT JSON.
            // Seria necessário uma rota de upload separada ou conversão Base64.
            //alert("Imagem selecionada visualmente. Implementar rota de upload de arquivos no backend para persistir.");
        });
    }

    // 4. Modal de Configurações (Excluir Conta)
    const settingsBtn = document.getElementById('open-settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    if (settingsBtn && settingsModal) settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
    if (cancelSettingsBtn && settingsModal) cancelSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'none');

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (!currentUserId) { alert("Erro: ID não encontrado."); return; }
            if (confirm("Tem certeza ABSOLUTA? Todos os seus dados serão apagados.")) {
                try {
                    const response = await fetch(`${API_BASE}/user/${currentUserId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        alert("Conta excluída.");
                        localStorage.clear();
                        window.location.href = '/public/index.html';
                    } else {
                        alert("Erro ao excluir.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("Erro de conexão.");
                }
            }
        });
    }

    window.onclick = function(event) {
        if (settingsModal && event.target == settingsModal) settingsModal.style.display = "none";
        const mapModal = document.getElementById('map-modal');
        if (mapModal && event.target == mapModal) mapModal.style.display = "none";
    }

    // 5. Modal do Mapa
    const mapModal = document.getElementById('map-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const googleMapIframe = document.getElementById('google-map-iframe');
    if (closeModalBtn && mapModal) {
        closeModalBtn.addEventListener('click', () => {
            mapModal.style.display = 'none';
            if(googleMapIframe) googleMapIframe.src = '';
        });
    }
});