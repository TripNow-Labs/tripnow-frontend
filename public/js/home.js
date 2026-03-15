document.addEventListener('DOMContentLoaded', () => {
    // --- 3. CARREGAR ROTEIROS (NOVO) ---
    const routesContainer = document.getElementById('my-routes-container');
    const API_ROTEIROS = 'http://localhost:3333/roteiros';
    const token = localStorage.getItem('token'); // Ainda precisa do token para o fetch

    async function fetchMyRoutes() {
        try {
            const response = await fetch(API_ROTEIROS, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erro ao buscar roteiros');

            const roteiros = await response.json();
            renderRoutes(roteiros);

        } catch (error) {
            console.error(error);
            routesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f;">Erro ao carregar roteiros. Tente novamente.</p>';
        }
    }

    function renderRoutes(roteiros) {
        routesContainer.innerHTML = '';

        if (roteiros.length === 0) {
            routesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; width: 100%; grid-column: 1/-1;">
                    <p style="color: #666; margin-bottom: 15px;">Você ainda não tem roteiros criados.</p>
                    <a href="/public/pages/escolherdest.html" class="btn btn-primary">Criar meu primeiro roteiro</a>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        roteiros.forEach(roteiro => {
    const card = document.createElement('a');
    card.className = 'route-card';
    card.href = `/public/pages/roteiro-diario.html?id=${roteiro.id}`;

    const imagemCidade = roteiro.cidade?.url_imagem || 'https://via.placeholder.com/400x250?text=Viagem';
    const nomeCidade = roteiro.cidade?.nome || 'Cidade';
    const nomePais = roteiro.cidade?.pais?.nome || '';
    const duracao = roteiro.duracao_dias;

    card.innerHTML = `
        <img src="${imagemCidade}" alt="${nomeCidade}" class="card-bg-image">
        
        <span class="card-days-badge">${duracao} dias</span>

        <div class="card-overlay">
            <div class="card-content-minimal">
                <p class="card-location-line">${nomeCidade}, ${nomePais}</p>
                <h3 class="card-city-highlight">${nomeCidade}</h3>
            </div>
        </div>
    `;
    fragment.appendChild(card);
});

        routesContainer.appendChild(fragment);
    }

    // Inicia o carregamento
    fetchMyRoutes();
});