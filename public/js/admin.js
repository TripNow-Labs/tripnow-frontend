document.addEventListener('DOMContentLoaded', function() {
    
            // 🛡️ O ESCUDO DE SEGURANÇA (Impede o carregamento da tela)
            // ------------------------------------------------------------------
            const tipoUsuario = localStorage.getItem('tipoUsuario');
            const token = localStorage.getItem('token');

            // Se o usuário não for admin, ele é expulso imediatamente para a Home
            if (!token || tipoUsuario !== 'admin') {
                console.warn('Tentativa de acesso não autorizada!');
                window.location.href = '/public/pages/home.html';
                return; // O 'return' é essencial para impedir que os gráficos abaixo carreguem
            }

            // --- LÓGICA DAS ABAS DO ADMIN ---
            const adminTabs = document.querySelectorAll('.admin-tab-link');
            const adminContents = document.querySelectorAll('.admin-content-panel');

            adminTabs.forEach(tab => {
                tab.addEventListener('click', function(event) {
                    event.preventDefault();
                    adminTabs.forEach(t => t.classList.remove('active'));
                    adminContents.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    const targetId = this.getAttribute('data-tab');
                    const targetContent = document.getElementById(targetId);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });

    // 🛡️ ESCUDO DE SEGURANÇA (UX Guard — redireciona não-admins imediatamente)
    // IMPORTANTE: Este é um guard de UX, não de segurança real. A segurança real
    // está no servidor, que valida o cookie httpOnly em cada requisição protegida.
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    if (tipoUsuario !== 'admin') {
        console.warn('Tentativa de acesso não autorizada ao painel admin.');
        window.location.href = '/public/pages/home.html';
        return; // Impede que os gráficos e lógica abaixo sejam carregados
    }

    // --- LÓGICA DAS ABAS DO ADMIN ---
    const adminTabs = document.querySelectorAll('.admin-tab-link');
    const adminContents = document.querySelectorAll('.admin-content-panel');

    adminTabs.forEach(tab => {
        tab.addEventListener('click', function (event) {
            event.preventDefault();
            adminTabs.forEach(t => t.classList.remove('active'));
            adminContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // --- LÓGICA DO GRÁFICO (Usuários) ---
    try {
        const ctx = document.getElementById('userChart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, 'rgba(0, 123, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 123, 255, 0)');
        const labels = ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
        const data = { labels: labels, datasets: [{ label: 'Acessos Mensais', data: [1800, 1950, 2200, 2100, 2400, 2350, 2600], fill: true, backgroundColor: gradient, borderColor: 'rgba(0, 123, 255, 1)', tension: 0.3, pointBackgroundColor: 'rgba(0, 123, 255, 1)', pointBorderColor: '#fff', pointHoverRadius: 6, pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgba(0, 123, 255, 1)' }] };
        const config = { type: 'line', data: data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function (context) { return `Acessos: ${context.parsed.y}`; } } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: false, grid: { color: '#e9ecef', drawBorder: false } } } } };
        const userChart = new Chart(ctx, config);
    } catch (e) {
        console.warn("Gráfico do Dashboard (Usuários) não encontrado ou falhou ao iniciar.");
    }

    // --- LÓGICA DO GRÁFICO (Destinos) ---
    try {
        const destCtx = document.getElementById('destinationsChart').getContext('2d');

        // --- DADOS DO BANCO (Substituir aqui) ---
        const destinationLabels = ['Paris', 'Tokyo', 'Nova York', 'Roma', 'Bali'];
        const destinationData = [1200, 950, 835, 351, 256];
        // --- Fim dos dados do banco ---

        const barColors = [
            'rgba(0, 123, 255, 0.7)',
            'rgba(40, 167, 69, 0.7)',
            'rgba(111, 66, 193, 0.7)',
            'rgba(253, 126, 20, 0.7)',
            'rgba(220, 53, 69, 0.7)'
        ];
        const barBorderColors = [
            'rgba(0, 123, 255, 1)',
            'rgba(40, 167, 69, 1)',
            'rgba(111, 66, 193, 1)',
            'rgba(253, 126, 20, 1)',
            'rgba(220, 53, 69, 1)'
        ];

        const destConfig = {
            type: 'bar',
            data: {
                labels: destinationLabels,
                datasets: [{
                    label: 'Popularidade',
                    data: destinationData,
                    backgroundColor: barColors,
                    borderColor: barBorderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, grid: { color: '#e9ecef', drawBorder: false } }
                }
            }
        };

        const destinationsChart = new Chart(destCtx, destConfig);

    } catch (e) {
        console.warn("Gráfico de Destinos não encontrado ou falhou ao iniciar.", e);
    }

    // --- LÓGICA DO GRÁFICO (Crescimento Relatórios) ---
    try {
        const growthCtx = document.getElementById('growthChart').getContext('2d');

        const growthLabels = ['Maio', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
        const growthData = [2100, 2200, 2150, 2300, 2450, 2700, 2847];

        const growthGradient = growthCtx.createLinearGradient(0, 0, 0, 250);
        growthGradient.addColorStop(0, 'rgba(40, 167, 69, 0.3)');
        growthGradient.addColorStop(1, 'rgba(40, 167, 69, 0)');

        const growthConfig = {
            type: 'line',
            data: {
                labels: growthLabels,
                datasets: [{
                    label: 'Total de Usuários',
                    data: growthData,
                    fill: true,
                    backgroundColor: growthGradient,
                    borderColor: 'rgba(40, 167, 69, 1)',
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(40, 167, 69, 1)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(40, 167, 69, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) { return `Total: ${context.parsed.y}`; }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: false, grid: { color: '#e9ecef', drawBorder: false } }
                }
            }
        };

        new Chart(growthCtx, growthConfig);

    } catch (e) {
        console.warn("Gráfico de Crescimento (Relatórios) não encontrado ou falhou ao iniciar.", e);
    }


    // --- ESTATÍSTICAS REAIS DO DASHBOARD ---
    // O cookie httpOnly é enviado automaticamente pelo navegador via credentials: 'include'.
    // Não é necessário (nem seguro) ler o token do localStorage aqui.
    async function carregarEstatisticasDashboard() {
        try {
            const response = await fetch('http://localhost:3333/api/v1/admin/stats', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                const userElement = document.getElementById('total-usuarios-real');
                if (userElement) userElement.textContent = data.total;

                const roteiroElement = document.getElementById('total-roteiros-real');
                if (roteiroElement) roteiroElement.textContent = data.RoteirosSalvos;
            }
        } catch (error) {
            console.error("Erro ao carregar estatísticas reais:", error);
        }
    }

    carregarEstatisticasDashboard();


    // --- LÓGICA DE GERENCIAR CIDADES ---
    const rawCitiesApiUrl = 'http://localhost:3333/api/v1/api/admin/tourist/raw-curated-cities';
    const updateApiUrl = 'http://localhost:3333/api/v1/api/admin/tourist/update-curated-cities';
    const clearCacheApiUrl = 'http://localhost:3333/api/v1/api/admin/tourist/clear-cache';

    const citiesListDiv = document.getElementById('cities-list');
    const statusDiv = document.getElementById('status');
    const modal = document.getElementById('city-modal');
    const modalTitle = document.getElementById('modal-title');
    const cityForm = document.getElementById('city-form');
    const cityIdInput = document.getElementById('city-id');
    const cityNameInput = document.getElementById('city-name');
    const spotsContainer = document.getElementById('tourist-spots-container');

    let citiesData = [];

    function fetchCities() {
        if (!citiesListDiv) return;

        statusDiv.textContent = 'Carregando cidades...';

        // credentials: 'include' envia o cookie httpOnly automaticamente — sem necessidade de Bearer
        fetch(rawCitiesApiUrl, { credentials: 'include' })
            .then(res => res.json())
            .then(response => {
                citiesData = response.data;
                renderCities();
                statusDiv.textContent = '';
            })
            .catch(err => {
                statusDiv.textContent = 'Erro ao carregar cidades.';
                statusDiv.style.color = 'red';
            });
    }

    function renderCities() {
        // replaceChildren() é a forma segura de limpar um elemento (sem innerHTML = '')
        citiesListDiv.replaceChildren();

        if (citiesData.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'Nenhuma cidade cadastrada.'; // textContent nunca interpreta HTML
            citiesListDiv.appendChild(p);
            return;
        }

        citiesData.forEach((city, index) => {
            const cityDiv = document.createElement('div');
            cityDiv.className = 'city-list-item';

            // --- Bloco de informações (dados do banco via textContent — seguro contra XSS) ---
            const cityInfo = document.createElement('div');
            cityInfo.className = 'city-info';

            const h3 = document.createElement('h3');
            h3.textContent = city.name; // textContent escapa qualquer HTML

            const small = document.createElement('small');
            small.textContent = `${city.touristSpots.length} pontos turísticos`;

            cityInfo.appendChild(h3);
            cityInfo.appendChild(small);

            // --- Bloco de ações ---
            const cityActions = document.createElement('div');
            cityActions.className = 'city-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn-secondary edit-btn';
            editBtn.dataset.id = index;
            editBtn.textContent = 'Editar';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-danger delete-btn';
            deleteBtn.dataset.id = index;
            deleteBtn.textContent = 'Excluir';

            cityActions.appendChild(editBtn);
            cityActions.appendChild(deleteBtn);

            cityDiv.appendChild(cityInfo);
            cityDiv.appendChild(cityActions);
            citiesListDiv.appendChild(cityDiv);
        });
    }

    function openModal(city, index) {
        modalTitle.textContent = city ? 'Editar Cidade' : 'Adicionar Nova Cidade';
        cityIdInput.value = index !== undefined ? index : '';
        cityNameInput.value = city ? city.name : '';
        spotsContainer.replaceChildren();
        if (city && city.touristSpots) {
            city.touristSpots.forEach(spot => addSpotInput(spot));
        }
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        cityForm.reset();
    }

    function addSpotInput(value = '') {
        const spotDiv = document.createElement('div');
        spotDiv.className = 'spot-item';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;          // .value nunca interpreta HTML — seguro contra XSS
        input.placeholder = 'Nome do Ponto Turístico';
        input.required = true;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-danger remove-spot-btn';
        removeBtn.textContent = 'X';

        spotDiv.appendChild(input);
        spotDiv.appendChild(removeBtn);
        spotsContainer.appendChild(spotDiv);
    }

    function handleClearCache() {
        if (!confirm('Tem certeza que deseja limpar o cache?')) return;
        statusDiv.textContent = 'Limpando cache do servidor...';
        statusDiv.style.color = 'blue';

        fetch(clearCacheApiUrl, { method: 'POST', credentials: 'include' })
            .then(res => { if (!res.ok) throw new Error('Falha ao limpar o cache.'); return res.json(); })
            .then(data => { statusDiv.textContent = data.message; statusDiv.style.color = 'green'; })
            .catch(err => { statusDiv.textContent = err.message; statusDiv.style.color = 'red'; });
    }

    // Anexar eventos com segurança (verificando se os elementos existem)
    if (citiesListDiv) {
        citiesListDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const index = e.target.dataset.id;
                openModal(citiesData[index], index);
            }
            if (e.target.classList.contains('delete-btn')) {
                if (confirm('Tem certeza que deseja excluir esta cidade?')) {
                    const index = e.target.dataset.id;
                    citiesData.splice(index, 1);
                    renderCities();
                }
            }
        });
    }

    const addNewCityBtn = document.getElementById('add-new-city-btn');
    if (addNewCityBtn) addNewCityBtn.addEventListener('click', () => openModal());

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    const addSpotBtn = document.getElementById('add-spot-btn');
    if (addSpotBtn) addSpotBtn.addEventListener('click', () => addSpotInput());

    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) clearCacheBtn.addEventListener('click', handleClearCache);

    if (spotsContainer) {
        spotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-spot-btn')) {
                e.target.parentElement.remove();
            }
            
            // Carrega as cidades assim que a página é carregada
            fetchCities();

            async function carregarEstatisticasDashboard() {
                try {
                    const token = localStorage.getItem('token');
                    
                    // Chamada para a nova rota que você vai criar no backend
                    const response = await fetch('http://localhost:3333/api/v1/admin/stats', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log("Dados recebidos do banco:", data); // Para você ver no console
                        
                        // 1. Atualiza os Usuários (Usando o ID que você colocou no HTML)
                        const userElement = document.getElementById('total-usuarios-real');
                        if (userElement) {
                            userElement.textContent = data.total; 
                        }

                        // 2. Atualiza os Roteiros (O que estava faltando!)
                        const roteiroElement = document.getElementById('total-roteiros-real');
                        if (roteiroElement) {
                            roteiroElement.textContent = data.RoteirosSalvos; 
                        }
                    }
                } catch (error) {
                    console.error("Erro ao carregar estatísticas reais:", error);
                }
            }

            // 3. Não esqueça de chamar a função para ela rodar!
            carregarEstatisticasDashboard();
        });
