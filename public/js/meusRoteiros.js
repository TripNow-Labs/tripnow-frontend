document.addEventListener('DOMContentLoaded', () => {
    const API_ROTEIROS = 'http://localhost:3333/api/v1/roteiros';
    let isEditing = false;

    // --- CONFIGURAÇÃO DA INTERFACE DE EDIÇÃO ---
    function setupEditUI() {
        // Localiza o título principal da página
        const h2Elements = document.querySelectorAll('h2');
        const targetH2 = Array.from(h2Elements).find(h => h.textContent.trim().includes('Meus Roteiros'));

        if (!targetH2) return;

        // Estiliza o H2 para alinhar o ícone ao lado
        targetH2.style.display = 'flex';
        targetH2.style.alignItems = 'center';
        targetH2.style.gap = '12px';

        // Cria o ícone de editar (semi-transparente)
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-edit';
        editIcon.style.opacity = '0.5';
        editIcon.style.cursor = 'pointer';
        editIcon.style.fontSize = '0.7em';
        editIcon.style.transition = 'opacity 0.2s';
        editIcon.title = 'Editar roteiros';

        targetH2.appendChild(editIcon);

        editIcon.addEventListener('click', () => {
            isEditing = !isEditing;
            // Alterna entre ícone de Editar e Salvar
            editIcon.className = isEditing ? 'fas fa-save' : 'fas fa-edit';
            
            // Alterna visibilidade de todos os botões X nos cards
            document.querySelectorAll('.delete-route-btn').forEach(btn => {
                btn.style.display = isEditing ? 'flex' : 'none';
            });
        });
    }

    // --- CONFIGURAÇÃO DO BOTÃO VOLTAR ---
    function setupBackButton() {
        const container = document.querySelector('.container-my-routes-section');
        if (!container) return;

        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-home-btn';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>'; // Ícone alterado para fa-arrow-left
        backBtn.title = 'Voltar para Home';

        // Remove a "caixa" do botão e define o tamanho exato solicitado
        Object.assign(backBtn.style, {
            background: 'none',
            border: 'none',
            padding: '0',
            width: '17.5px',
            height: '20.8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px' // Tamanho aproximado para preencher a altura de 20.8px
        });

        // Insere o botão no início do container
        container.prepend(backBtn);

        backBtn.addEventListener('click', () => {
            window.location.href = '/public/pages/home.html'; // Redirecionamento corrigido para home.html
        });
    }

    // --- CONFIGURAÇÃO DO MODAL DE CONFIRMAÇÃO (Identidade Visual roteiro-diario) ---
    function injectModalStyles() {
        if (document.getElementById('confirm-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'confirm-modal-styles';
        style.textContent = `
            .modal-confirm-overlay {
                display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.6); z-index: 10000; justify-content: center; align-items: center;
                backdrop-filter: blur(2px); transition: opacity 0.3s ease;
            }
            .modal-confirm-overlay.active { display: flex; }
            .modal-confirm-content {
                background: white; padding: 24px; border-radius: 20px; width: 90%; max-width: 340px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); font-family: 'Roboto', sans-serif;
            }
            .modal-confirm-content h3 { margin: 0 0 12px 0; color: #00B4D8; font-size: 18px; font-weight: 800; }
            .modal-confirm-content p { font-size: 14px; color: #6B7280; line-height: 1.5; margin-bottom: 24px; }
            .modal-confirm-actions { display: flex; gap: 12px; }
            .modal-confirm-actions button {
                flex: 1; padding: 12px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; transition: filter 0.2s;
            }
            .btn-cancel-modal { background: #f3f4f6; color: #1A1A1A; }
            .btn-confirm-modal { background: #dc2626; color: white; }
            .modal-confirm-actions button:hover { filter: brightness(0.9); }
        `;
        document.head.appendChild(style);
    }

    function abrirModalConfirmacao(titulo, mensagem, onConfirm) {
        injectModalStyles();
        let modal = document.getElementById('confirm-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirm-modal';
            modal.className = 'modal-confirm-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-confirm-content">
                <h3>${titulo}</h3>
                <p>${mensagem}</p>
                <div class="modal-confirm-actions">
                    <button id="cancel-confirm" class="btn-cancel-modal">Cancelar</button>
                    <button id="execute-confirm" class="btn-confirm-modal">Excluir</button>
                </div>
            </div>
        `;

        modal.classList.add('active');

        // Eventos de Fechamento
        const fechar = () => modal.classList.remove('active');
        
        modal.querySelector('#cancel-confirm').onclick = fechar;
        modal.onclick = (e) => { if (e.target === modal) fechar(); };
        
        modal.querySelector('#execute-confirm').onclick = () => {
            onConfirm();
            fechar();
        };
    }

    async function fetchMyRoutes() {
        try {
            const response = await fetch(API_ROTEIROS, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Erro ao buscar roteiros');

            const responseData = await response.json();
            const roteiros = Array.isArray(responseData) ? responseData : (responseData.data || []);
            categorizeAndRender(roteiros);
        } catch (error) {
            console.error(error);
        }
    }

    function categorizeAndRender(roteiros) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera hora para comparar apenas o dia

        const ativos = [];
        const futuros = [];
        const concluidos = [];

        roteiros.forEach(r => {
            const dataInicio = new Date(r.data_inicio);
            dataInicio.setHours(0, 0, 0, 0);
            
            const dataFim = new Date(dataInicio);
            dataFim.setDate(dataFim.getDate() + (r.duracao_dias || 1) - 1);
            dataFim.setHours(0, 0, 0, 0);

            if (dataFim < hoje) {
                concluidos.push(r);
            } else if (dataInicio > hoje) {
                futuros.push(r);
            } else {
                ativos.push(r);
            }
        });

        // 2. Renderização nos containers (IDs que definimos no passo anterior)
        renderList(ativos, 'container-ativos', 'Nenhum roteiro em andamento no momento.');
        renderList(futuros, 'container-futuros', 'Você não tem viagens futuras planejadas.');
        renderList(concluidos, 'container-concluidos', 'Histórico de viagens vazio.', true);
    }

    function renderList(lista, containerId, emptyMessage, isConcluido = false) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (lista.length === 0) {
            container.innerHTML = `<p class="empty-msg">${emptyMessage}</p>`;
            return;
        }

        lista.forEach(roteiro => {
            const card = createRouteCard(roteiro, isConcluido);
            container.appendChild(card);
        });
    }

    // Função auxiliar para criar o HTML do card (reaproveitando seu código)
    function createRouteCard(roteiro, isConcluido = false) {
        const card = document.createElement('a');
        card.className = 'route-card';
        card.href = `/public/pages/roteiro-diario.html?id=${roteiro.id}`;

        const imagemCidade = roteiro.cidade?.url_imagem || 'https://via.placeholder.com/400x250?text=Viagem';
        const nomeCidade = roteiro.cidade?.nome || 'Cidade';
        const nomePais = roteiro.cidade?.pais?.nome || '';

        const titleColor = 'style="color: #ffffff;"'; // Título do card sempre branco
        const titlePrefix = isConcluido ? 'Concluído: ' : '';

        card.innerHTML = `
            <img src="${imagemCidade}" alt="${nomeCidade}" class="card-bg-image">
            <span class="card-days-badge" style="left: 15px; right: auto;">${roteiro.duracao_dias} dias</span>
            <div class="card-overlay">
                <div class="card-content-minimal">
                    <p class="card-location-line">${nomeCidade}, ${nomePais}</p>
                    <h3 class="card-city-highlight" ${titleColor}>${titlePrefix}${nomeCidade}</h3>
                </div>
            </div>
            <button class="delete-route-btn" data-id="${roteiro.id}" 
                style="display: ${isEditing ? 'flex' : 'none'}; position: absolute; top: 5px; right: 5px; background: rgba(220, 38, 38, 0.9); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; z-index: 20; align-items: center; justify-content: center; font-size: 10px;">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Lógica de exclusão individual
        const delBtn = card.querySelector('.delete-route-btn');
        delBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Impede a navegação do link <a>
            e.stopPropagation(); // Impede que o clique chegue ao card

            abrirModalConfirmacao(
                'Excluir Roteiro',
                `Tem certeza que deseja excluir o roteiro para ${nomeCidade}?`,
                async () => {
                    try {
                        const response = await fetch(`${API_ROTEIROS}/${roteiro.id}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });
                        if (response.ok) {
                            fetchMyRoutes(); // Recarrega a lista
                        } else {
                            alert('Erro ao excluir o roteiro.');
                        }
                    } catch (err) {
                        console.error("Erro na exclusão:", err);
                    }
                }
            );
        });

        return card;
    }

    fetchMyRoutes();
    setupEditUI();
    setupBackButton();
});