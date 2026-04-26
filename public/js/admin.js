document.addEventListener('DOMContentLoaded', function() {

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

            // --- LÓGICA DO GRÁFICO (Usuários) ---
            try {
                const ctx = document.getElementById('userChart').getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                gradient.addColorStop(0, 'rgba(0, 123, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 123, 255, 0)');
                const labels = ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
                const data = { labels: labels, datasets: [{ label: 'Acessos Mensais', data: [1800, 1950, 2200, 2100, 2400, 2350, 2600], fill: true, backgroundColor: gradient, borderColor: 'rgba(0, 123, 255, 1)', tension: 0.3, pointBackgroundColor: 'rgba(0, 123, 255, 1)', pointBorderColor: '#fff', pointHoverRadius: 6, pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgba(0, 123, 255, 1)' }] };
                const config = { type: 'line', data: data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function(context) { return `Acessos: ${context.parsed.y}`; } } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: false, grid: { color: '#e9ecef', drawBorder: false } } } } };
                const userChart = new Chart(ctx, config);
            } catch (e) {
                console.warn("Gráfico do Dashboard (Usuários) não encontrado ou falhou ao iniciar.");
            }

            // --- LÓGICA DO GRÁFICO (Destinos) ---
            try {
                const destCtx = document.getElementById('destinationsChart').getContext('2d');
                
                // --- DADOS DO BANCO (Substituir aqui) ---
                // Futuramente, iremos buscar os dados do banco
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
                    type: 'bar', // Gráfico de colunas
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
                        indexAxis: 'x', // 'x' para colunas (vertical)
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                grid: { display: false }
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: '#e9ecef',
                                    drawBorder: false
                                }
                            }
                        }
                    }
                };
                
                const destinationsChart = new Chart(destCtx, destConfig);

            } catch (e) {
                console.warn("Gráfico de Destinos não encontrado ou falhou ao iniciar.", e);
            }
            // --- [NOVO] LÓGICA DO GRÁFICO (Crescimento Relatórios) ---
            try {
                const growthCtx = document.getElementById('growthChart').getContext('2d');
                
                // --- DADOS DO BANCO (Substituir aqui) ---
                const growthLabels = ['Maio', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
                const growthData = [2100, 2200, 2150, 2300, 2450, 2700, 2847];
                // --- Fim dos dados do banco ---

                // Gradiente verde (baseado nas métricas de resumo)
                const growthGradient = growthCtx.createLinearGradient(0, 0, 0, 250);
                growthGradient.addColorStop(0, 'rgba(40, 167, 69, 0.3)'); // --admin-icon-green
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
                                    label: function(context) {
                                        return `Total: ${context.parsed.y}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { grid: { display: false } },
                            y: { 
                                beginAtZero: false,
                                grid: { color: '#e9ecef', drawBorder: false } 
                            }
                        }
                    }
                };
                
                new Chart(growthCtx, growthConfig);

            } catch (e) {
                console.warn("Gráfico de Crescimento (Relatórios) não encontrado ou falhou ao iniciar.", e);
            }


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
                if (!citiesListDiv) return; // Só executa se estivermos na página certa
                
                statusDiv.textContent = 'Carregando cidades...';
                const token = localStorage.getItem('token');
                fetch(rawCitiesApiUrl, { credentials: 'include', headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
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
                citiesListDiv.innerHTML = '';
                if (citiesData.length === 0) {
                    citiesListDiv.innerHTML = '<p>Nenhuma cidade cadastrada.</p>';
                    return;
                }
                citiesData.forEach((city, index) => {
                    const cityDiv = document.createElement('div');
                    cityDiv.className = 'city-list-item'; // Nova classe CSS
                    cityDiv.innerHTML = `
                        <div class="city-info">
                            <h3>${city.name}</h3>
                            <small>${city.touristSpots.length} pontos turísticos</small>
                        </div>
                        <div class="city-actions">
                            <button class="btn-secondary edit-btn" data-id="${index}">Editar</button>
                            <button class="btn-danger delete-btn" data-id="${index}">Excluir</button>
                        </div>
                    `;
                    citiesListDiv.appendChild(cityDiv);
                });
            }

            function openModal(city, index) {
                modalTitle.textContent = city ? 'Editar Cidade' : 'Adicionar Nova Cidade';
                cityIdInput.value = index !== undefined ? index : '';
                cityNameInput.value = city ? city.name : '';
                spotsContainer.innerHTML = '';
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
                spotDiv.innerHTML = `
                    <input type="text" value="${value}" placeholder="Nome do Ponto Turístico" required>
                    <button type="button" class="btn-danger remove-spot-btn">X</button>
                `;
                spotsContainer.appendChild(spotDiv);
            }
            
            function handleClearCache() {
                if (!confirm('Tem certeza que deseja limpar o cache?')) return;
                statusDiv.textContent = 'Limpando cache do servidor...';
                statusDiv.style.color = 'blue';
                const token = localStorage.getItem('token');
                fetch(clearCacheApiUrl, { method: 'POST', credentials: 'include', headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
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
            if(addNewCityBtn) addNewCityBtn.addEventListener('click', () => openModal());
            
            const cancelBtn = document.getElementById('cancel-btn');
            if(cancelBtn) cancelBtn.addEventListener('click', closeModal);

            const addSpotBtn = document.getElementById('add-spot-btn');
            if(addSpotBtn) addSpotBtn.addEventListener('click', () => addSpotInput());
            
            const clearCacheBtn = document.getElementById('clear-cache-btn');
            if(clearCacheBtn) clearCacheBtn.addEventListener('click', handleClearCache);

            if(spotsContainer) {
                spotsContainer.addEventListener('click', (e) => {
                    if (e.target.classList.contains('remove-spot-btn')) {
                        e.target.parentElement.remove();
                    }
                });
            }

            if(cityForm) {
                cityForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const id = cityIdInput.value;
                    const spotInputs = spotsContainer.querySelectorAll('input');
                    const newCityData = {
                        name: cityNameInput.value,
                        touristSpots: Array.from(spotInputs).map(input => input.value).filter(val => val)
                    };

                    if (id) { citiesData[id] = newCityData; } 
                    else { citiesData.push(newCityData); }
                    renderCities();
                    closeModal();
                });
            }

            const saveAllBtn = document.getElementById('save-all-changes-btn');
            if(saveAllBtn) {
                saveAllBtn.addEventListener('click', () => {
                    statusDiv.textContent = 'Salvando alterações no servidor...';
                    statusDiv.style.color = 'blue';
                    const token = localStorage.getItem('token');
                    fetch(updateApiUrl, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ curatedCities: citiesData })
                    })
                    .then(res => { if (!res.ok) throw new Error('Falha ao salvar no servidor.'); return res.json(); })
                    .then(() => { statusDiv.textContent = 'Alterações salvas com sucesso!'; statusDiv.style.color = 'green'; })
                    .catch(err => { statusDiv.textContent = err.message; statusDiv.style.color = 'red'; });
                });
            }
            
            // Carrega as cidades assim que a página é carregada
            fetchCities();
        });