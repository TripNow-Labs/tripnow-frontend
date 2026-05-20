document.addEventListener('DOMContentLoaded', () => {
    const userNameLocal = localStorage.getItem('userName');
    if (!userNameLocal) {
        window.location.href = '/public/index.html';
        return;
    }

    const API_BASE = 'http://localhost:3333/api/v1';
    let cidadesCuradas = []; // Guarda as cidades iniciais (Rio, Paris, etc)
    let debounceTimer;

    const containerCards = document.getElementById('containerCards');
    const dataInicioInput = document.getElementById('data-inicio');
    const dataTerminoInput = document.getElementById('data-termino');
    const searchInput = document.querySelector('.city-search-input');
    const filterPills = document.querySelectorAll('.filter-pill');
    const nomeRoteiroContainer = document.getElementById('roteiro-nome')?.closest('.form-group');

    if (nomeRoteiroContainer) nomeRoteiroContainer.classList.add('hidden-step');

    const hoje = new Date().toISOString().split('T')[0];
    dataInicioInput.setAttribute('min', hoje);
    dataInicioInput.addEventListener('change', () => {
        dataTerminoInput.setAttribute('min', dataInicioInput.value);
    });

    // --- 1. CARREGAR A LISTA INICIAL (Curated Cities) ---
    async function loadCuratedCities() {
        try {
            containerCards.innerHTML = '<p style="text-align:center; width:100%;"><i class="fas fa-spinner fa-spin"></i> Carregando destinos incríveis...</p>';

            const response = await fetch(`${API_BASE}/roteiros/curated-cities`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Erro ao carregar cidades');
            const data = await response.json();

            // Mapeia a lista rica que o seu back-end montou
            cidadesCuradas = data.map((item, index) => {
                const infoCidade = item.cidade || item;
                const infoPais = item.pais || {};
                const atracoes = item.pontos_turisticos || item.touristSpots || [];
                const primeiraAtracao = atracoes.length > 0 ? atracoes[0] : {};

                return {
                    id: `curated-${index}`,
                    nome: infoCidade.nome || infoCidade.name || 'Destino',
                    descricao: infoCidade.descricao || infoCidade.description || 'Destino incrível.',
                    url_imagem: infoCidade.url_imagem || infoCidade.image || primeiraAtracao.url_imagem || primeiraAtracao.image || 'https://images.unsplash.com/photo-1488085061387-422e15b40b18?q=80&w=800&auto=format&fit=crop',
                    pais: infoPais.nome || infoPais.country || 'Desconhecido',
                    continente: infoPais.continente || infoPais.continent || '',
                    moeda: infoPais.moeda || infoPais.currency || 'BRL'
                };
            });

            // Como o botão "Brasil" começa ativo no HTML, já filtramos de cara!
            aplicarFiltro('Brasil');

        } catch (error) {
            console.error(error);
            containerCards.innerHTML = '<p style="text-align:center; width:100%;">Falha ao carregar os destinos.</p>';
        }
    }

    // --- 2. BUSCAR UMA CIDADE ESPECÍFICA (Global Search) ---
    async function searchCityGlobal(termo) {
        try {
            containerCards.innerHTML = '<p style="text-align:center; width:100%;"><i class="fas fa-spinner fa-spin"></i> Buscando no mapa mundial...</p>';

            const response = await fetch(`${API_BASE}/api/tourist/search?q=${encodeURIComponent(termo)}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    containerCards.innerHTML = '<p style="text-align:center; width:100%;">Nenhum destino encontrado com esse nome.</p>';
                    return;
                }
                throw new Error('Erro na busca');
            }

            const data = await response.json();
            if (!data) return;

            const arrayDeResultados = Array.isArray(data) ? data : [data];

            const cidadesBuscadas = arrayDeResultados.map((item, index) => {
                const infoCidade = item.cidade || item;
                const infoPais = item.pais || {};
                const atracoes = item.pontos_turisticos || item.touristSpots || [];
                const primeiraAtracao = atracoes.length > 0 ? atracoes[0] : {};

                return {
                    id: `busca-${index}`,
                    nome: infoCidade.nome || infoCidade.name || termo,
                    descricao: infoCidade.descricao || infoCidade.description || 'Encontrado na busca global.',
                    url_imagem: infoCidade.url_imagem || infoCidade.image || primeiraAtracao.url_imagem || primeiraAtracao.image || 'https://images.unsplash.com/photo-1488085061387-422e15b40b18?q=80&w=800&auto=format&fit=crop',
                    pais: infoPais.nome || infoPais.country || 'Desconhecido',
                    continente: infoPais.continente || infoPais.continent || '',
                    moeda: infoPais.moeda || infoPais.currency || ''
                };
            });

            renderCities(cidadesBuscadas);

        } catch (error) {
            console.error(error);
            containerCards.innerHTML = '<p style="text-align:center; width:100%;">Falha ao buscar este destino.</p>';
        }
    }

    // --- 3. RENDERIZAR CARDS ---
    function renderCities(cidades) {
        containerCards.innerHTML = '';
        if (cidades.length === 0) {
            containerCards.innerHTML = '<p style="text-align:center; width:100%;">Nenhum destino correspondente.</p>';
            return;
        }

        cidades.forEach(cidade => {
            const card = document.createElement('div');
            card.className = 'city-card';
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${cidade.url_imagem}" alt="${cidade.nome}" class="card-image">
                    <span class="country-tag">${cidade.pais}</span>
                </div>
                <div class="card-content">
                    <h4 class="card-city-name">${cidade.nome}</h4>
                    <p class="card-city-description">${cidade.descricao.substring(0, 100)}...</p>
                    <button type="button" class="select-destination-btn" 
                        data-nome="${cidade.nome}" data-pais="${cidade.pais}" 
                        data-descricao="${cidade.descricao}" data-imagem="${cidade.url_imagem}">
                        Selecionar este Destino <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
            containerCards.appendChild(card);
        });
        attachSelectEvents();
    }

    // --- 4. LÓGICA DE FILTROS (PILLS E BARRA DE BUSCA) ---
    function aplicarFiltro(categoria) {
    console.log('Categoria enviada:', categoria);

    categoria = categoria.trim();

    if (categoria.toLowerCase() === 'popular') {
        buscarAtracoesAPI('popular');

    } else if (categoria === 'Brasil' || categoria === 'Europa') {

        const filtradas = cidadesCuradas.filter(c =>
            c.pais.toLowerCase() === categoria.toLowerCase() ||
            c.continente.toLowerCase() === categoria.toLowerCase()
        );

        renderCities(filtradas);

    } else {
        buscarAtracoesAPI(categoria);
    }
}
        

    filterPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            filterPills.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');

            // Limpa a barra de busca se clicar numa Pill
            if (searchInput) searchInput.value = '';

            aplicarFiltro(e.target.getAttribute('data-search') || e.target.textContent);
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (termo.length === 0) {
                // Se apagar tudo, volta a mostrar o filtro que estava ativo
                const activePill = document.querySelector('.filter-pill.active');
                aplicarFiltro(activePill ? activePill.textContent : 'Popular');
                return;
            }

            // Se digitou uma cidade, vai buscar no mundo todo!
            debounceTimer = setTimeout(() => {
                searchCityGlobal(termo);
            }, 800);
        });
    }

    // --- 5. EVENTO DE CRIAÇÃO DO ROTEIRO (POST) ---
    function attachSelectEvents() {
        const selectButtons = document.querySelectorAll('.select-destination-btn');
        selectButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();

                const dataInicio = dataInicioInput.value;
                const dataTermino = dataTerminoInput.value;

                if (!dataInicio || !dataTermino) {
                    alert('Por favor, selecione as datas antes de escolher o destino.');
                    return;
                }

                const diffTime = Math.abs(new Date(dataTermino) - new Date(dataInicio));
                const duracaoDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                const payload = {
                    roteiro: { data_inicio: dataInicio, duracao_dias: duracaoDias, numero_pessoas: 1, orcamento_total: 0 },
                    pais: { nome: button.getAttribute('data-pais') },
                    cidade: { nome: button.getAttribute('data-nome'), descricao: button.getAttribute('data-descricao'), url_imagem: button.getAttribute('data-imagem') },
                    dias: []
                };

                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
                button.disabled = true;

                try {
                    const response = await fetch(`${API_BASE}/roteiros`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) throw new Error('Erro ao criar roteiro');
                    const result = await response.json();

                    window.location.href = `/public/pages/roteiro-diario.html?id=${result.roteiroId}`;

                } catch (error) {
                    alert('Falha ao criar o roteiro.');
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            });
        });
    }
    // 🔥 NOVA FUNÇÃO - BUSCA NA API POR CATEGORIA
    async function buscarAtracoesAPI(categoria) {
    try {
        containerCards.innerHTML = `
            <p style="text-align:center; width:100%;">
                <i class="fas fa-spinner fa-spin"></i> Buscando ${categoria}...
            </p>
        `;

        let listaFinal = [];

        if (categoria.toLowerCase() === 'popular') {

            const categorias = ['museu', 'praia', 'restaurante'];

            const requests = categorias.map(cat =>
                fetch(`${API_BASE}/roteiros/2/sugestoes-atracoes?categoria=${cat}`, {
                    credentials: 'include'
                }).then(res => res.json())
            );

            const resultados = await Promise.all(requests);

            listaFinal = resultados.flat();

        } else {

            const response = await fetch(
                `${API_BASE}/roteiros/2/sugestoes-atracoes?categoria=${categoria.toLowerCase()}`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Erro');

            listaFinal = await response.json();
        }

        // 🔥 embaralha
        listaFinal.sort(() => Math.random() - 0.5);

        const lista = listaFinal.map((item, index) => ({
            id: `api-${index}`,
            nome: item.nome || item.name || 'Atração',
            descricao: item.descricao || item.description || 'Sem descrição',
            url_imagem: item.url_imagem || item.image || 'https://images.unsplash.com/photo-1488085061387-422e15b40b18?q=80&w=800&auto=format&fit=crop',
            pais: item.pais || 'Destino',
            continente: '',
            moeda: ''
        }));

        renderCities(lista);

    } catch (error) {
        console.error(error);
        containerCards.innerHTML = `
            <p style="text-align:center; width:100%;">
                Erro ao buscar ${categoria}.
            </p>
        `;
    }
}

    // Inicia carregando a lista e filtrando 'Brasil'
    loadCuratedCities();
});