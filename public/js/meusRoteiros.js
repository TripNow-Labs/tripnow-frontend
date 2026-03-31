document.addEventListener('DOMContentLoaded', () => {
    const API_ROTEIROS = 'http://localhost:3333/roteiros';
    const token = localStorage.getItem('token');

    async function fetchMyRoutes() {
        try {
            const response = await fetch(API_ROTEIROS, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao buscar roteiros');

            const roteiros = await response.json();
            categorizeAndRender(roteiros);
        } catch (error) {
            console.error(error);
        }
    }

    function categorizeAndRender(roteiros) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera hora para comparar apenas o dia

    // 1. Filtragem baseada APENAS na data_inicio
    const ativos = roteiros.filter(r => {
        const dataInicio = new Date(r.data_inicio);
        dataInicio.setHours(0, 0, 0, 0);
        return dataInicio.getTime() === hoje.getTime(); // Começa hoje?
    });

    const futuros = roteiros.filter(r => {
        const dataInicio = new Date(r.data_inicio);
        dataInicio.setHours(0, 0, 0, 0);
        return dataInicio.getTime() > hoje.getTime(); // Ainda vai começar
    });

    const concluidos = roteiros.filter(r => {
        const dataInicio = new Date(r.data_inicio);
        dataInicio.setHours(0, 0, 0, 0);
        return dataInicio.getTime() < hoje.getTime(); // Já passou da data de início
    });

    // 2. Renderização nos containers (IDs que definimos no passo anterior)
    renderList(ativos, 'container-ativos', 'Nenhum roteiro começando hoje.');
    renderList(futuros, 'container-futuros', 'Você não tem viagens futuras planejadas.');
    renderList(concluidos, 'container-concluidos', 'Histórico de viagens vazio.');
}

    function renderList(lista, containerId, emptyMessage) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (lista.length === 0) {
            container.innerHTML = `<p class="empty-msg">${emptyMessage}</p>`;
            return;
        }

        lista.forEach(roteiro => {
            const card = createRouteCard(roteiro);
            container.appendChild(card);
        });
    }

    // Função auxiliar para criar o HTML do card (reaproveitando seu código)
    function createRouteCard(roteiro) {
        const card = document.createElement('a');
        card.className = 'route-card';
        card.href = `/public/pages/roteiro-diario.html?id=${roteiro.id}`;

        const imagemCidade = roteiro.cidade?.url_imagem || 'https://via.placeholder.com/400x250?text=Viagem';
        const nomeCidade = roteiro.cidade?.nome || 'Cidade';
        const nomePais = roteiro.cidade?.pais?.nome || '';

        card.innerHTML = `
            <img src="${imagemCidade}" alt="${nomeCidade}" class="card-bg-image">
            <span class="card-days-badge">${roteiro.duracao_dias} dias</span>
            <div class="card-overlay">
                <div class="card-content-minimal">
                    <p class="card-location-line">${nomeCidade}, ${nomePais}</p>
                    <h3 class="card-city-highlight">${nomeCidade}</h3>
                </div>
            </div>
        `;
        return card;
    }

    fetchMyRoutes();
});