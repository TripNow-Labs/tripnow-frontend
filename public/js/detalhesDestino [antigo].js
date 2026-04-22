document.addEventListener('DOMContentLoaded', () => {

    // --- 1. AUTH E HEADER ---
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/index.html';
        return;
    }

    // --- 2. ELEMENTOS DA TELA ---
    const containerCards = document.getElementById('containerCards');
    const searchInput = document.querySelector('.city-search-input');
    const sectionTitle = document.querySelector('.subsection-title');
    let searchTimeout;

    // --- 3. REMOVER DUPLICATAS (Lógica herdada do antigo) ---
    function removeDuplicates(list) {
        const seen = new Set();
        return list.filter(item => {
            if (!item || !item.cidade || !item.pais) return false;
            const uniqueKey = `${item.cidade.nome.trim()}-${item.pais.nome.trim()}`.toLowerCase();
            if (seen.has(uniqueKey)) return false;
            seen.add(uniqueKey);
            return true;
        });
    }

    // --- 4. RENDERIZAÇÃO DOS CARDS (Novo Layout Mobile-First) ---
    function renderCards(dataList) {
        containerCards.innerHTML = '';

        if (dataList.length === 0) {
            containerCards.innerHTML = '<p class="error-text">Nenhum local encontrado.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        dataList.forEach(item => {
            const cityDataString = encodeURIComponent(JSON.stringify(item));
            const card = document.createElement('div');
            card.className = 'city-card';

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${item.cidade.url_imagem || 'https://via.placeholder.com/400x250'}" class="card-image" alt="${item.cidade.nome}">
                    <span class="country-tag">${item.pais.nome}</span>
                    <div class="cost-info">
                        <i class="fas fa-map-marker-alt"></i> Custo: ${item.cidade.custo_medio || 'Médio'}
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-city-name">${item.cidade.nome}</h3>
                    <p class="card-city-description">
                        ${item.cidade.descricao ? item.cidade.descricao.substring(0, 90) + '...' : 'Explore este destino incrível.'}
                    </p>
                    <button type="button" class="btn-select-dest" data-city-object="${cityDataString}">
                        Selecionar este Destino <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
            fragment.appendChild(card);
        });

        containerCards.appendChild(fragment);

        // Evento de Clique para salvar no Banco e Redirecionar
        document.querySelectorAll('.btn-select-dest').forEach(btn => {
            btn.addEventListener('click', async function (e) {
                e.preventDefault();
                const data = JSON.parse(decodeURIComponent(this.dataset.cityObject));
                await selecionarESalvarDestino(data);
            });
        });
    }

    // --- 5. SALVAMENTO (Integração com RoteiroController.js) ---
    async function selecionarESalvarDestino(cityData) {
        const dataInicioRaw = document.getElementById('data-inicio').value;
        const dataTerminoRaw = document.getElementById('data-termino').value;

        if (!dataInicioRaw || !dataTerminoRaw) {
            alert("Por favor, preencha as datas de início e término.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // --- CÁLCULO DA DURAÇÃO (Essencial para o seu Banco de Dados) ---
        const d1 = new Date(dataInicioRaw);
        const d2 = new Date(dataTerminoRaw);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia de início

        // ESTRUTURA ATUALIZADA com duracao_dias
        const payload = {
            roteiro: {
                nome: cityData.cidade.nome,
                data_inicio: dataInicioRaw,
                data_fim: dataTerminoRaw,
                duracao_dias: diffDays, // Enviando o valor que o banco exige
                numero_pessoas: 1,      // Valor padrão para evitar outros erros de null
                orcamento_total: 0      // Valor padrão
            },
            cidade: {
                nome: cityData.cidade.nome,
                latitude: cityData.cidade.latitude,
                longitude: cityData.cidade.longitude
            },
            pais: {
                nome: cityData.pais.nome
            }
        };

        try {
            console.log("Payload com duracao_dias:", payload);

            const response = await fetch('http://localhost:3333/roteiros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Erro do servidor:", result);
                throw new Error(result.error || 'Erro ao salvar');
            }

            // Sucesso: Guardamos os dados e redirecionamos
            sessionStorage.setItem('roteiroAtivoId', result.id || result.roteiroId);
            sessionStorage.setItem('cidadeSelecionada', JSON.stringify(cityData));

            window.location.href = 'roteiro-diario2.html';

        } catch (error) {
            console.error("Erro no fluxo:", error);
            alert(`Não foi possível criar o roteiro: ${error.message}`);
        }
    }

    // --- 6. CARREGAMENTO E BUSCA ---
    async function loadCities(url = 'http://localhost:3333/api/tourist/curated-cities') {
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            renderCards(removeDuplicates(Array.isArray(data) ? data : [data]));
        } catch (error) {
            containerCards.innerHTML = '<p class="error-text">Erro ao carregar cidades.</p>';
        }
    }

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        searchTimeout = setTimeout(() => {
            const url = query
                ? `http://localhost:3333/api/tourist/search?q=${encodeURIComponent(query)}`
                : 'http://localhost:3333/api/tourist/curated-cities';

            if (sectionTitle) sectionTitle.textContent = query ? `Resultados para "${query}"` : "Cidades Populares";
            loadCities(url);
        }, 800);
    });

    loadCities();
});