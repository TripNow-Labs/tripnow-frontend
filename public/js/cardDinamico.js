document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DE AUTH E HEADER ---
    const userName = localStorage.getItem('userName');
    if (!userName) {
        window.location.href = '/public/index.html';
        return;
    }
    if (userName) {
        const greetingElement = document.getElementById('user-greeting');
        if (greetingElement) {
            const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
            greetingElement.textContent = `Olá, ${formattedName}!`;
        }
    }
    const profileTrigger = document.getElementById('profile-menu-trigger');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (profileTrigger) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }
    document.addEventListener('click', (e) => {
        if (profileDropdown && profileDropdown.classList.contains('show')) {
            if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        }
    });
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            window.location.href = '/public/index.html';
        });
    }


    // --- 2. ELEMENTOS DA TELA ---
    const containerCards = document.querySelector('.city-cards-grid');
    const searchInput = document.querySelector('.city-search-input');
    const sectionTitle = document.querySelector('.popular-cities-section h2');
    let searchTimeout;


    // --- REMOVER DUPLICATAS ---
    function removeDuplicates(list) {
        const seen = new Set();
        return list.filter(item => {
            if (!item) return false;

            const cName = item.cidade?.nome || item.nome || item.name;
            const pName = item.pais?.nome || item.pais?.name || (typeof item.pais === 'string' ? item.pais : '');

            if (!cName) return false;

            const uniqueKey = `${cName.trim()}-${pName.trim()}`.toLowerCase();

            if (seen.has(uniqueKey)) {
                return false; // Já vimos essa cidade, ignora (é duplicata)
            }

            seen.add(uniqueKey); // Marca como vista
            return true; // É nova, mantém na lista
        });
    }


    // --- CARREGAR CIDADES POPULARES ---
    async function loadCuratedCities() {
        try {
            containerCards.innerHTML = '<p class="loading-text">Carregando destinos incríveis...</p>';

            const response = await fetch('http://localhost:3333/api/v1/api/tourist/curated-cities', {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Erro ao buscar cidades curadas');

            let responseData = await response.json();
            let cities = [];
            if (Array.isArray(responseData)) { cities = responseData; }
            else if (responseData && typeof responseData === 'object') {
                if (Array.isArray(responseData.data)) cities = responseData.data;
                else if (responseData.cidade || responseData.nome || responseData.name) cities = [responseData];
                else { for (let key in responseData) { if (Array.isArray(responseData[key])) { cities = responseData[key]; break; } } }
            }

            // [FILTRO] Aplica a regra de não repetir
            cities = removeDuplicates(cities);

            renderCards(cities, false);

        } catch (error) {
            console.error(error);
            containerCards.innerHTML = '<p class="error-text">Não foi possível carregar as sugestões.</p>';
        }
    }


    // --- 4. FUNÇÃO DE BUSCA ---
    async function searchCity(query) {
        if (!query) {
            sectionTitle.textContent = "Cidades Populares";
            loadCuratedCities();
            return;
        }

        try {
            sectionTitle.textContent = `Resultados para "${query}"`;
            containerCards.innerHTML = '<p class="loading-text">Buscando seu destino...</p>';

            const response = await fetch(`http://localhost:3333/api/v1/api/tourist/search?q=${encodeURIComponent(query)}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    containerCards.innerHTML = '<p class="error-text">Cidade não encontrada. Tente outro nome.</p>';
                    return;
                }
                throw new Error('Erro na busca');
            }
            const result = await response.json();
            let resultsArray = [];
            if (Array.isArray(result)) { resultsArray = result; }
            else if (result && typeof result === 'object') {
                if (Array.isArray(result.data)) resultsArray = result.data;
                else if (result.cidade || result.nome || result.name) resultsArray = [result];
                else { for (let key in result) { if (Array.isArray(result[key])) { resultsArray = result[key]; break; } } }
            }
            resultsArray = removeDuplicates(resultsArray);
            renderCards(resultsArray, true);

        } catch (error) {
            console.error(error);
            containerCards.innerHTML = '<p class="error-text">Erro ao buscar.</p>';
        }
    }


    // --- RENDERIZAÇÃO DOS CARDS (Otimizada) ---
    function renderCards(dataList, isSearchResult) {
        containerCards.innerHTML = '';

        if (dataList.length === 0) {
            containerCards.innerHTML = '<p class="error-text">Nenhum local encontrado.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        dataList.forEach(item => {
            let cityName, countryName, imageUrl, description, fullObject;
            cityName = item.cidade?.nome || item.nome || item.name || 'Destino Desconhecido';
            countryName = item.pais?.nome || item.pais?.name || (typeof item.pais === 'string' ? item.pais : '');
            imageUrl = item.cidade?.url_imagem || item.url_imagem || item.imagem || 'https://via.placeholder.com/400x250?text=Sem+Imagem';
            description = item.cidade?.descricao || item.descricao || '';
            fullObject = item;

            const card = document.createElement('div');
            card.className = 'city-card';

            const objectString = encodeURIComponent(JSON.stringify(fullObject));

            card.innerHTML = `
                <div class="card-image">
                    <img src="${imageUrl || 'https://via.placeholder.com/400x250?text=Sem+Imagem'}" alt="${cityName}">
                    <div class="card-overlay">
                        <span class="country-tag">${countryName}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${cityName}</h3>
                    <p>${description ? description.substring(0, 100) + '...' : 'Uma cidade incrível para descobrir.'}</p>
                    <button class="btn-select-dest" data-city-object="${objectString}">
                        Selecionar este Destino <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;

            fragment.appendChild(card);
        });

        containerCards.appendChild(fragment);

        document.querySelectorAll('.btn-select-dest').forEach(btn => {
            btn.addEventListener('click', function () {
                const data = JSON.parse(decodeURIComponent(this.dataset.cityObject));
                selectDestination(data);
            });
        });
    }


    // --- SELEÇÃO DO DESTINO ---
    function selectDestination(cityData) {
        // Limpa roteiro antigo
        sessionStorage.removeItem('novoRoteiro');

        const novoRoteiro = {
            roteiro: {
                data_inicio: null,
                duracao_dias: null,
                numero_pessoas: null,
                orcamento_total: null,
                horario_preferencial: null
            },
            pais: cityData.pais,
            cidade: cityData.cidade,
            dias: []
        };

        sessionStorage.setItem('novoRoteiro', JSON.stringify(novoRoteiro));
        sessionStorage.setItem('pontosTuristicosDisponiveis', JSON.stringify(cityData.pontos_turisticos));

        console.log("Destino salvo:", cityData.cidade.nome);
        window.location.href = '/public/pages/EscolherDestino.html';
    }


    // --- EVENTOS ---
    loadCuratedCities();

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        searchTimeout = setTimeout(() => {
            searchCity(query);
        }, 800);
    });

});