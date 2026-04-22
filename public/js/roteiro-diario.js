document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. CONFIGURAÇÕES E ESTADO GLOBAL
    // ==========================================
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para acessar seu roteiro.');
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

    const API_BASE = 'http://localhost:3333';
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                    ${!isLastItem ? '<div class="timeline-line"></div>' : ''}
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
                    
                    ${!isLastItem ? `
                    <div class="timeline-connector">
                        <i class="fas fa-chevron-down"></i>
                    </div>` : ''}
                </div>
            `;
            activitiesList.appendChild(card);
        });
    }

    // ==========================================
    // 6. LÓGICA DO MODAL DE BUSCA
    // ==========================================
    
    function renderAttractionsGrid(atraveis) {
        attractionsGrid.innerHTML = '';

        atraveis.forEach(atracao => {
            const card = document.createElement('div');
            card.className = 'attraction-card';
            
            const categoria = atracao.categoria || 'Lazer';
            const imgUrl = atracao.url_imagem || atracao.image || 'https://images.unsplash.com/photo-1488085061387-422e15b40b18?q=80&w=400&auto=format&fit=crop';
            // Pega a descrição para levar pro card principal
            const desc = atracao.descricao || atracao.description || '';

            card.innerHTML = `
                <div class="attraction-img-wrapper">
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
        });

        document.querySelectorAll('.add-attraction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                adicionarAtracaoNoRoteiro(e.currentTarget);
            });
        });
    }

    async function adicionarAtracaoNoRoteiro(btnElement) {
        // 1. Feedback visual instantâneo
        btnElement.classList.add('added');
        btnElement.innerHTML = '<i class="fas fa-check"></i> Adicionado';
        
        // 2. Extrai os dados que guardamos no botão
        const nome = btnElement.getAttribute('data-nome');
        const imgUrl = btnElement.getAttribute('data-imagem');
        const categoria = btnElement.getAttribute('data-categoria');
        const descricao = btnElement.getAttribute('data-descricao');

        // 3. Cria o objeto local (Simulação Otimista para não travar a tela)
        const novaAtividade = {
            id: Date.now(), // ID temporário até o banco devolver o real
            horario: "08:30",
            duracao: "2h",
            atracao: { 
                nome: nome,
                url_imagem: imgUrl,
                categoria: categoria,
                descricao: descricao
            }
        };

        if (!roteiroData.dias[diaAtualSelecionado]) {
            roteiroData.dias[diaAtualSelecionado] = [];
        }
        
        // Adiciona na tela imediatamente
        roteiroData.dias[diaAtualSelecionado].push(novaAtividade);
        renderActivities(diaAtualSelecionado);

        // Fecha o modal suavemente
        setTimeout(() => {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }, 600);

        // ==========================================
        // 4. SALVAR NO BACK-END (BANCO DE DADOS)
        // ==========================================
       try {
            // Monte o pacote de dados (Payload) conforme o que sua API espera
            const payload = {
                numero_dia: diaAtualSelecionado, // 👈 MUDAMOS AQUI (de 'dia_roteiro' para 'numero_dia')
                horario: "08:30",
                duracao: "2h",
                nova_atracao: {
                    nome: nome,
                    descricao: descricao,
                    categoria: categoria,
                    url_imagem: imgUrl
                }
            };

            const response = await fetch(`${API_BASE}/roteiros/${roteiroId}/atracoes`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const erro = await response.json().catch(() => ({}));
                console.error("🕵️‍♂️ RESPOSTA DO BACK-END:", erro);
                throw new Error(erro.error || erro.message || `Erro HTTP: Status ${response.status}`);
            }

            // Ver o sucesso no console
            // console.log("✅ Atração salva com sucesso no banco!");

        } catch (error) {
            console.error("🕵️‍♂️ FALHA AO SALVAR:", error.message);
            alert(`Atenção: O back-end recusou a atração. Motivo: ${error.message}`);
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

    // Inicia o app
    init();
});