document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DE AUTH (Mantida) ---
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/index.html';
        return;
    }

    // --- 2. ELEMENTOS DA TELA ---
    const step1 = document.getElementById('step-1-selection');
    const step2 = document.getElementById('step-2-details');
    const containerCards = document.getElementById('containerCards');
    const searchInput = document.querySelector('.city-search-input');
    const sectionTitle = document.querySelector('.subsection-title');
    
    // Elementos da Etapa 2 para preenchimento dinâmico
    const heroTitle = document.getElementById('dest-city-name');
    const heroDesc = document.getElementById('dest-description');
    const heroImage = document.getElementById('dest-hero-image');
    const spanCityName = document.getElementById('dest-city-name-span');
    const attractionsList = document.getElementById('attractions-list');

    let searchTimeout;

    // --- 3. REMOVER DUPLICATAS (Mantida) ---
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

    // --- 4. RENDERIZAÇÃO DOS CARDS (Estilo Novo Layout) ---
    function renderCards(dataList) {
        containerCards.innerHTML = '';

        if (dataList.length === 0) {
            containerCards.innerHTML = '<p class="error-text">Nenhum local encontrado.</p>';
            return;
        }

        dataList.forEach(item => {
            const card = document.createElement('div');
            card.className = 'city-card';
            
            // Simulação de custo (ajuste conforme seu retorno da API)
            const custo = item.cidade.custo_medio || "Médio";

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${item.cidade.url_imagem || 'https://via.placeholder.com/400x250'}" class="card-image" alt="${item.cidade.nome}">
                    <span class="country-tag">${item.pais.nome}</span>
                    <div class="cost-info">
                        <i class="fas fa-map-marker-alt"></i> Custo: ${custo}
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-city-name">${item.cidade.nome}</h3>
                    <p class="card-city-description">
                        ${item.cidade.descricao ? item.cidade.descricao.substring(0, 90) + '...' : 'Explore as belezas deste destino incrível.'}
                    </p>
                    <button class="select-destination-btn" data-city='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
                        Selecionar este Destino <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
            containerCards.appendChild(card);
        });

        // Evento de clique para selecionar
        document.querySelectorAll('.select-destination-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const cityData = JSON.parse(this.getAttribute('data-city'));
                goToStep2(cityData);
            });
        });
    }

    // --- 5. TRANSIÇÃO PARA ETAPA 2 ---
    function goToStep2(data) {
        // 1. Esconde etapa 1, mostra etapa 2
        step1.classList.add('hidden-step');
        step1.classList.remove('active-step');
        step2.classList.add('active-step');
        step2.classList.remove('hidden-step');

        // 2. Preenche o Hero e textos
        heroTitle.textContent = data.cidade.nome;
        heroDesc.textContent = data.cidade.descricao;
        spanCityName.textContent = data.cidade.nome;
        heroImage.style.backgroundImage = `url('${data.cidade.url_imagem}')`;
        
        // 3. Renderiza as atrações (pontos turísticos)
        renderAttractions(data.pontos_turisticos);

        // 4. Salva no SessionStorage (opcional, para persistência)
        sessionStorage.setItem('selectedCity', JSON.stringify(data));
        
        // Scroll para o topo
        window.scrollTo(0, 0);
    }

    // --- 6. RENDERIZAR ATRAÇÕES (ETAPA 2) ---
    function renderAttractions(attractions) {
        attractionsList.innerHTML = '';
        if (!attractions || attractions.length === 0) {
            attractionsList.innerHTML = '<p>Nenhuma atração disponível para este destino.</p>';
            return;
        }

        attractions.forEach(attr => {
            const attrCard = document.createElement('div');
            attrCard.className = 'attraction-item'; // Crie esse estilo no CSS se desejar
            attrCard.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 8px;">
                    <img src="${attr.url_imagem || 'https://via.placeholder.com/80'}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div>
                        <h4 style="margin: 0; font-size: 14px;">${attr.nome}</h4>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #757575;">${attr.tipo || 'Ponto Turístico'}</p>
                    </div>
                    <input type="checkbox" checked style="margin-left: auto;">
                </div>
            `;
            attractionsList.appendChild(attrCard);
        });
    }

    // --- 7. BUSCA E CARREGAMENTO INICIAL ---
    async function loadCities() {
        try {
            const response = await fetch('http://localhost:3333/api/tourist/curated-cities', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let cities = await response.json();
            renderCards(removeDuplicates(cities));
        } catch (error) {
            containerCards.innerHTML = '<p class="error-text">Erro ao carregar cidades.</p>';
        }
    }

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        searchTimeout = setTimeout(async () => {
            if (!query) { loadCities(); return; }
            const response = await fetch(`http://localhost:3333/api/tourist/search?q=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const results = await response.json();
            renderCards(removeDuplicates(Array.isArray(results) ? results : [results]));
        }, 800);
    });

    // Início
    loadCities();
});