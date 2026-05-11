document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. CONFIGURAÇÕES E ESTADO GLOBAL
    // ==========================================
    const userNameLocal = localStorage.getItem('userName');
    if (!userNameLocal) {
        window.location.href = '/public/index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const roteiroId = urlParams.get('id');

    if (!roteiroId) {
        alert('Roteiro não encontrado.');
        window.location.href = '/public/pages/Dashboard.html';
        return;
    }

    const API_BASE = 'http://localhost:3333/api/v1';
    let roteiroData = null; // Guardará o JSON completo do roteiro
    let diaAtualSelecionado = 1; // Controla a aba atual

    // ==========================================
    // 2. MAPEAMENTO DE ELEMENTOS DO DOM
    // ==========================================
    // Tela Principal
    const tripTitle = document.getElementById('trip-title');
    const tripDates = document.getElementById('trip-dates');
    const daysNav = document.getElementById('days-nav');
    const currentDayTitle = document.getElementById('current-day-title');
    const activitiesList = document.getElementById('activities-list');
    // Modal e Busca
    const modal = document.getElementById('search-modal');
    const openModalBtn = document.getElementById('add-activity-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const attractionsGrid = document.getElementById('attractions-grid');
    const modalTitle = document.getElementById('search-modal-title');
    const resultsCount = document.getElementById('search-results-count');
    // Detalhes da Atração
    const detailsModal = document.getElementById('details-modal');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const detailHero = document.getElementById('detail-hero');
    const detailTitle = document.getElementById('detail-title');
    const detailCategory = document.getElementById('detail-category');
    const detailDescription = document.getElementById('detail-description');
    const addFromDetailsBtn = document.getElementById('add-from-details-btn');
    const btnAbrirRotas = document.getElementById('btn-abrir-rotas');
    const mapModal = document.getElementById('map-modal');
    const mapIframe = document.getElementById('map-iframe');
    const closeMapBtn = document.getElementById('close-map-btn');
    const mapTargetName = document.getElementById('map-target-name');
    const externalMapsBtn = document.getElementById('external-maps-btn');

    let atracaoEmDestaque = null;

    // ==========================================
    // 3. INICIALIZAÇÃO E EVENTOS PRINCIPAIS
    // ==========================================

    function init() {
        attachEventListeners();
        loadRoteiro();
    }

    function attachEventListeners() {
        // Abrir Modal de Busca
        openModalBtn.addEventListener('click', async () => {
            const r = roteiroData.roteiro;
            const nomeCidade = r.cidade ? r.cidade.nome : 'Destino';
            modalTitle.textContent = `Sugestões em ${nomeCidade}`;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Trava o scroll do fundo
            await fetchAttractionsForModal(nomeCidade);
        });

        // Fechar Modal
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('open');
            document.body.style.overflow = ''; // Destrava o scroll
        });
    }

    // ==========================================
    // 4. COMUNICAÇÃO COM A API (BACK-END)
    // ==========================================

    async function loadRoteiro() {
        try {
            const response = await fetch(`${API_BASE}/roteiros/${roteiroId}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Falha ao carregar roteiro');
            roteiroData = await response.json();
            renderHeader();
            renderDayPills();
            selectDay(1); // Seleciona o primeiro dia por padrão
        } catch (error) {
            console.error(error);
            tripTitle.textContent = "Erro ao carregar roteiro";
            tripDates.textContent = "Verifique sua conexão ou tente novamente.";
        }
    }

    async function fetchAttractionsForModal(cidade) {
        attractionsGrid.innerHTML = '<p style="grid-column: span 2; text-align:center;">Buscando atrações...</p>';
        try {
            const response = await fetch(`${API_BASE}/api/tourist/search?q=${encodeURIComponent(cidade)}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Erro ao buscar atrações');
            const data = await response.json();
            const arrayData = Array.isArray(data) ? data : [data];
            const destino = arrayData[0] || {};
            const atraveis = destino.pontos_turisticos || destino.touristSpots || [];
            resultsCount.textContent = `${atraveis.length} resultados`;
            renderAttractionsGrid(atraveis);

        } catch (error) {
            attractionsGrid.innerHTML = '<p style="grid-column: span 2; text-align:center; color: red;">Erro ao carregar atrações.</p>';
        }
    }
    // ==========================================
    // 5. RENDERIZAÇÃO DA TELA PRINCIPAL
    // ==========================================
    function renderHeader() {
        const r = roteiroData.roteiro;
        const nomeCidade = r.cidade ? r.cidade.nome : 'Destino';
        tripTitle.textContent = `Roteiro: ${nomeCidade}`;
        const dataInicio = parseDate(r.data_inicio);
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataFim.getDate() + (r.duracao_dias - 1));
        const inicioFormatado = formatShortDate(dataInicio);
        const fimFormatado = formatShortDate(dataFim);
        tripDates.textContent = `${r.duracao_dias} dias • ${inicioFormatado} - ${fimFormatado}`;
    }

    function renderDayPills() {
        daysNav.innerHTML = '';
        const duracao = roteiroData.roteiro.duracao_dias;

        for (let i = 1; i <= duracao; i++) {
            const btn = document.createElement('button');
            btn.className = `day-pill ${i === 1 ? 'active' : ''}`;
            btn.textContent = `Dia ${i}`;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.day-pill').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                selectDay(i);
            });

            daysNav.appendChild(btn);
        }
    }

    function selectDay(dia) {
        diaAtualSelecionado = dia;

        const r = roteiroData.roteiro;
        const dataDiaAtual = parseDate(r.data_inicio);
        dataDiaAtual.setDate(dataDiaAtual.getDate() + (dia - 1));

        currentDayTitle.textContent = formatFullDayDate(dataDiaAtual);
        renderActivities(dia);
    }

    function renderActivities(dia) {
        activitiesList.innerHTML = '';

        const atividadesDoDia = roteiroData.dias[dia] || [];

        if (atividadesDoDia.length === 0) {
            activitiesList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <i class="fas fa-map-marked-alt" style="font-size: 48px; color: #E5E7EB; margin-bottom: 16px;"></i>
                    <p style="margin: 0; font-size: 14px;">Você ainda não tem atividades planejadas para este dia.</p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: var(--primary-cyan);">Clique no botão + abaixo para começar!</p>
                </div>
            `;
            return;
        }

        atividadesDoDia.forEach((item, index) => {
            const atracao = item.atracao || {};
            // Garante um ID único para manipulação do DOM caso o item.id venha indefinido do back-end
            const itemID = item.id || `idx-${index}`;
            const idUnico = `${dia}-${itemID}`;

            // Fotos enviadas para esta atividade específica
            const fotosAtividade = item.fotos || []; 
            const temFotos = fotosAtividade.length > 0;

            const imgUrl = atracao.url_imagem || 'https://images.unsplash.com/photo-1488085061387-422e15b40b18?q=80&w=400&auto=format&fit=crop';
            const categoria = atracao.categoria || 'Lazer';
            const descricao = atracao.descricao ? atracao.descricao.substring(0, 60) + '...' : 'Uma atração imperdível.';

            // Verifica se é o último item (para não renderizar a setinha no final)
            const isLastItem = index === atividadesDoDia.length - 1;
            const card = document.createElement('div');
            card.className = 'timeline-item';
            card.innerHTML = `
                <div class="timeline-time">
                    <span class="time-text">${item.horario || '08:30'}</span>
                    <span class="duration-text"><i class="far fa-clock"></i> ${item.duracao || '2h'}</span>
                </div>

                <div class="timeline-content">
                    <div class="activity-card" style="background-image: url('${imgUrl}');">
                        <div class="activity-overlay"></div>
                        <div class="activity-header">
                            <span class="activity-tag">${categoria}</span>
                            <h4 class="activity-name">${atracao.nome || 'Atividade'}</h4>
                        </div>
                        <p class="activity-desc">${descricao}</p>
                        <div class="activity-actions">
                            <button class="action-btn" title="Editar horário"><i class="fas fa-pen"></i></button>
                            <button class="action-btn" title="Excluir"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>

                    <!-- BOTÃO DE EXPANSÃO (Seta isolada) -->
                    <div class="activity-expand-trigger" style="display: flex; justify-content: flex-end; padding: 10px 5px;">
                        <i class="fas fa-chevron-down" id="chevron-${idUnico}" style="cursor: pointer; font-size: 16px; transition: 0.3s; color: var(--text-light-muted);" onclick="window.toggleGaleria('${idUnico}', this)"></i>
                    </div>

                    <!-- Mini-sessão da Galeria (Acordeão) -->
                    <div id="gallery-container-${idUnico}" class="activity-gallery-wrapper" style="display: none; background: #f9fafb; border-radius: 12px; padding: 15px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                        <input type="file" id="file-input-${idUnico}" style="display:none" onchange="window.executarUploadFoto(this, '${idUnico}')">
                        
                        <div class="gallery-info-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: var(--text-muted); font-size: 14px;">
                            <span id="photo-count-text-${idUnico}" style="font-weight: 500;">${temFotos ? `${fotosAtividade.length} fotos nesse local` : 'Fotos nesse local'}</span>
                            <i class="fas fa-image" style="cursor: pointer; font-size: 18px;" title="Adicionar Foto" onclick="document.getElementById('file-input-${idUnico}').click()"></i>
                        </div>
                        
                        <div id="grid-${idUnico}" class="activity-photos-grid" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                            ${temFotos ? fotosAtividade.map(url => `<img src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`).join('') : '<p style="font-size: 12px; color: #9ca3af; margin: 0;">Nenhuma foto adicionada ainda.</p>'}
                        </div>
                    </div>

                </div>
            `;
            activitiesList.appendChild(card);
        });
    }

    // ==========================================
    // 6. LÓGICA DO MODAL DE BUSCA E DETALHES
    // ==========================================

    /**
     * Renderiza o grid de atrações no modal de busca
     */
    function renderAttractionsGrid(atraveis) {
        attractionsGrid.innerHTML = '';
        atraveis.forEach(atracao => {
            const card = document.createElement('div');
            card.className = 'attraction-card';
            const categoria = atracao.categoria || 'Lazer';
            const imgUrl = atracao.url_imagem || atracao.image || 'https://images.unsplash.com/photo-1488085061387-422e15b40b18?q=80&w=400&auto=format&fit=crop';
            const desc = atracao.descricao || atracao.description || 'Descrição não disponível.';

            card.innerHTML = `
                <div class="attraction-img-wrapper" style="cursor: pointer;">
                    <img src="${imgUrl}" alt="${atracao.nome}">
                    <span class="attraction-tag">${categoria}</span>
                </div>
                <div class="attraction-info">
                    <h4>${atracao.nome}</h4>
                    <button class="add-attraction-btn"
                            data-nome="${atracao.nome}"
                            data-imagem="${imgUrl}"
                            data-categoria="${categoria}"
                            data-descricao="${desc}">
                        <i class="fas fa-check-circle" style="display:none;"></i> Adicionar
                    </button>
                </div>
            `;
            attractionsGrid.appendChild(card);
            // 1. EVENTO: Abrir tela de detalhes ao clicar na imagem
            const imgWrapper = card.querySelector('.attraction-img-wrapper');
            imgWrapper.addEventListener('click', () => {
                abrirTelaDeDetalhes({
                    nome: atracao.nome,
                    url_imagem: imgUrl,
                    categoria: categoria,
                    descricao: desc
                });
            });
        });

        // 2. EVENTO: Adicionar rápido pelo botão do card
        document.querySelectorAll('.add-attraction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnElement = e.currentTarget;
                const dados = {
                    nome: btnElement.getAttribute('data-nome'),
                    url_imagem: btnElement.getAttribute('data-imagem'),
                    categoria: btnElement.getAttribute('data-categoria'),
                    descricao: btnElement.getAttribute('data-descricao')
                };
                adicionarAtracaoNoRoteiro(dados, btnElement);
            });
        });
    }

    /**
     * Preenche e abre o modal de detalhes (Tela lateral)
     */
    function abrirTelaDeDetalhes(atracao) {
        atracaoEmDestaque = atracao;
        // 1. Imagem, Título e Categoria
        detailHero.style.backgroundImage = `url('${atracao.url_imagem || ''}')`;
        detailTitle.textContent = atracao.nome;
        detailCategory.textContent = atracao.categoria || 'Turismo';
        detailDescription.textContent = atracao.descricao || 'Sem descrição disponível.';

        // 2. Avaliação (Estrelas) - Usando o campo 'avaliacao' do backend
        const nota = parseFloat(atracao.avaliacao) || 0;
        const starsContainer = document.getElementById('detail-stars');
        const ratingText = document.getElementById('detail-rating-text');

        starsContainer.innerHTML = generateStarsHTML(nota);
        ratingText.textContent = `(${nota.toFixed(1)})`;
    
        // 3. Endereço Real
        document.getElementById('detail-address').textContent = atracao.endereco || 'Endereço não informado';

        // 4. Duração (Vem do campo 'duracao_horas')
        const duracao = atracao.duracao_horas ? `${atracao.duracao_horas}h recomendadas` : 'Tempo livre';
        document.getElementById('detail-duration').textContent = duracao;

        // 5. Preço e Gratuidade
        const priceElement = document.getElementById('detail-price');

        if (atracao.e_gratuito) {
            priceElement.innerHTML = '<span style="color: #10B981; font-weight: bold;">Gratuito</span>';
        } else if (atracao.preco) {
            const moeda = atracao.moeda || 'R$';
            priceElement.textContent = `${moeda} ${atracao.preco}`;
        } else {
            priceElement.textContent = 'Preço sob consulta';
        }

        // Reseta o botão de adicionar
        addFromDetailsBtn.textContent = 'Adicionar ao Roteiro';
        addFromDetailsBtn.style.backgroundColor = 'var(--primary-cyan)';
        detailsModal.classList.add('open');
    }

    function generateStarsHTML(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let html = '';
        // Estrelas cheias
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="fas fa-star"></i>';
        }
        // Meia estrela
        if (hasHalfStar) {
            html += '<i class="fas fa-star-half-alt"></i>';
        }
        // Estrelas vazias
        for (let i = 0; i < emptyStars; i++) {
            html += '<i class="far fa-star"></i>';
        }
        return html;
    }

    /**
     * Evento para FECHAR a tela de detalhes (Botão voltar no canto superior esquerdo)
     */

    closeDetailsBtn.addEventListener('click', () => {
        detailsModal.classList.remove('open');
        atracaoEmDestaque = null;
    });

    /**
     * Evento do botão "Adicionar ao Roteiro" dentro da tela de detalhes
     */
    addFromDetailsBtn.addEventListener('click', () => {
        if (!atracaoEmDestaque) return;
        // Feedback visual no botão gigante
        addFromDetailsBtn.textContent = '✓ Adicionado';
        addFromDetailsBtn.disabled = true;
        addFromDetailsBtn.style.backgroundColor = '#10B981';
        adicionarAtracaoNoRoteiro(atracaoEmDestaque, null);

        // Fecha a tela de detalhes após um pequeno delay
        setTimeout(() => {
            detailsModal.classList.remove('open');
        }, 800);
    });

    /**
     * Evento para abrir o Google Maps traçando a rota do local atual até a atração
     */

    btnAbrirRotas.addEventListener('click', () => {
        if (!atracaoEmDestaque) return;

        const destino = (atracaoEmDestaque.latitude && atracaoEmDestaque.longitude)
            ? `${atracaoEmDestaque.latitude},${atracaoEmDestaque.longitude}`
            : encodeURIComponent(atracaoEmDestaque.nome);
        mapTargetName.textContent = `Rota para ${atracaoEmDestaque.nome}`;
        mapIframe.style.opacity = '0';
        mapModal.classList.add('active');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=SUA_CHAVE_AQUI&origin=${lat},${lng}&destination=${destino}`;
                const fallbackUrl = `https://maps.google.com/maps?saddr=${lat},${lng}&daddr=${destino}&output=embed`;
                mapIframe.src = fallbackUrl;
                setTimeout(() => { mapIframe.style.opacity = '1'; }, 500);
            });
        }
    });



    // Função de contingência caso o usuário negue a localização
    function mostrarMapaFallback(encodedDestino) {
        // Mostra só o ponto turístico no mapa, sem tentar traçar rota
        const embedUrl = `https://maps.google.com/maps?q=${encodedDestino}&output=embed`;
        mapIframe.src = embedUrl;
        setTimeout(() => { mapIframe.style.opacity = '1'; }, 500);
    }

    // Fechar o modal do mapa
    closeMapBtn.addEventListener('click', () => {
        mapModal.classList.remove('active');
        mapIframe.src = ''; // Limpa o iframe para parar de carregar
    });

    // Botão de contingência caso o usuário queira ir para o app real
    externalMapsBtn.addEventListener('click', () => {
        const r = roteiroData.roteiro;
        const termoBusca = `${atracaoEmDestaque.nome}, ${r.cidade?.nome || ''}`;
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(termoBusca)}`, '_blank');
    });

    /**
     * Função centralizada para salvar atração no roteiro (Local + Banco)
     * @param {Object} dados - Objeto com nome, imagem, categoria e descricao
     * @param {HTMLElement|null} btnElement - O botão do card (para feedback visual), se existir
     */

    async function adicionarAtracaoNoRoteiro(dados, btnElement) {

        // 1. GARANTIR O TOKEN DIRETO DA FONTE (Sem usar variáveis externas)
        const currentToken = localStorage.getItem('token');

        if (!currentToken) {
            alert("Sua sessão expirou. Por favor, faça login novamente.");
            window.location.href = '/public/index.html';
            return;
        }

        // 2. FEEDBACK VISUAL INSTANTÂNEO
        if (btnElement) {
            btnElement.classList.add('added');
            btnElement.innerHTML = '<i class="fas fa-check"></i> Adicionado';
        }

        // 3. SIMULAÇÃO OTIMISTA (Interface)
        const novaAtividade = {
            id: 'temp-' + Date.now() + '-' + Math.floor(Math.random() * 1000), // ID único para evitar erros de Accordion
            horario: "08:30",
            duracao: "2h",
            atracao: {
                nome: dados.nome,
                url_imagem: dados.url_imagem,
                categoria: dados.categoria,
                descricao: dados.descricao
            }
        };

        if (!roteiroData.dias[diaAtualSelecionado]) {
            roteiroData.dias[diaAtualSelecionado] = [];
        }

        roteiroData.dias[diaAtualSelecionado].push(novaAtividade);
        renderActivities(diaAtualSelecionado);

        // Fecha o modal se necessário
        if (btnElement || detailsModal.classList.contains('open')) {
            setTimeout(() => {
                modal.classList.remove('open');
                detailsModal.classList.remove('open');
                document.body.style.overflow = '';
            }, 600);
        }

        // 4. SALVAR NO BANCO DE DADOS
        try {
            const payload = {
                numero_dia: diaAtualSelecionado,
                horario: "08:30",
                duracao: "2h",
                nova_atracao: {
                    nome: dados.nome,
                    descricao: dados.descricao,
                    categoria: dados.categoria,
                    url_imagem: dados.url_imagem
                }
            };

            const response = await fetch(`${API_BASE}/roteiros/${roteiroId}/atracoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}` // 👈 Usando a variável garantida
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const erro = await response.json().catch(() => ({}));
                console.error("🕵️‍♂️ RESPOSTA DO BACK-END:", erro);
                throw new Error(erro.error || erro.message || `Erro HTTP: ${response.status}`);
            }
            
            console.log(`✅ ${dados.nome} salvo com sucesso!`);
        } catch (error) {

            console.error("🕵️‍♂️ FALHA AO SALVAR NO BANCO:", error.message);

            alert(`Erro ao sincronizar: "${dados.nome}" pode não ser salvo.`);
        }
    }

    // ==========================================
    // 7. FUNÇÕES UTILITÁRIAS
    // ==========================================
    function parseDate(dateString) {
        if (!dateString) return new Date();
        return new Date(dateString + 'T12:00:00');
    }

    function formatShortDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date).replace(' de ', ' ').replace('.', '');
    }

    function formatFullDayDate(date) {
        let formatado = new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(date);
        return formatado.charAt(0).toUpperCase() + formatado.slice(1);
    }

    // ==========================================
    // 8. LÓGICA DE GALERIA E UPLOAD (Global)
    // ==========================================

    window.toggleGaleria = function(idUnico, elementoSeta) {
        const panel = document.getElementById(`gallery-container-${idUnico}`);
        if (!panel) return;

        const isHidden = panel.style.display === 'none';
        
        panel.style.display = isHidden ? 'block' : 'none';
        
        if (elementoSeta) {
            if (isHidden) {
                elementoSeta.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                elementoSeta.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        }
    };

    window.executarUploadFoto = async function(input, atividadeId) {
        const file = input.files[0];
        if (!file) return;

        // Validação básica do arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem válido.');
            input.value = '';
            return;
        }

        // Extrai o ID real do banco (parte após o traço do dia se for o ID composto)
        const realId = atividadeId.includes('-') ? atividadeId.split('-').pop() : atividadeId;
        
        // Se for um item temporário (não salvo no banco ainda), avisa o usuário
        if (realId.toString().startsWith('temp') || realId.toString().startsWith('idx')) {
            alert("Por favor, aguarde a sincronização do roteiro antes de adicionar fotos.");
            input.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('foto', file);

        try {
            const response = await fetch(`${API_BASE}/roteiros/atividades/${realId}/fotos`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const grid = document.getElementById(`grid-${atividadeId}`);
                
                if (grid && data.url) {
                    if (grid.querySelector('p')) {
                        grid.innerHTML = '';
                    }

                    const img = document.createElement('img');
                    img.src = data.url;
                    img.style = "width: 60px; height: 60px; object-fit: cover; border-radius: 8px;";
                    grid.appendChild(img);

                    const countText = document.getElementById(`photo-count-text-${atividadeId}`);
                    if (countText) {
                        const total = grid.querySelectorAll('img').length;
                        countText.textContent = `${total} fotos nesse local`;
                    }
                    alert("Foto adicionada com sucesso!");
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Erro ao enviar foto: ${errorData.message || 'Falha no servidor'}`);
            }
        } catch (error) {
            console.error("Erro no upload da foto:", error);
            alert("Erro de conexão ao tentar enviar a foto.");
        } finally {
            input.value = '';
        }
    };

    // Inicia o app
    init();
});