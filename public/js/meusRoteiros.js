document.addEventListener('DOMContentLoaded', () => {
    const API_ROTEIROS = 'http://localhost:3333/api/v1/roteiros';

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
            <span class="card-days-badge">${roteiro.duracao_dias} dias</span>
            <div class="card-overlay">
                <div class="card-content-minimal">
                    <p class="card-location-line">${nomeCidade}, ${nomePais}</p>
                    <h3 class="card-city-highlight" ${titleColor}>${titlePrefix}${nomeCidade}</h3>
                </div>
            </div>
        `;
        return card;
    }

    fetchMyRoutes();
});