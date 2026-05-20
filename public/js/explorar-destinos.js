document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:3333/api/v1';
    const popularCarousel = document.querySelector('.popular-carousel');
    const nearbyList = document.querySelector('.nearby-list');

    // Interatividade dos botões de expandir (Delegação de eventos para itens dinâmicos)
    nearbyList.addEventListener('click', (e) => {
        const attractionCard = e.target.closest('.attraction-card');
        if (attractionCard) {
            e.stopPropagation();
            const atracaoStr = attractionCard.getAttribute('data-atracao');
            if (atracaoStr) {
                const atracao = JSON.parse(decodeURIComponent(atracaoStr));
                const detailsModal = document.querySelector('details-modal');
                if (detailsModal) {
                    detailsModal.open(atracao);
                }
            }
            return;
        }

        const quickBtn = e.target.closest('.quick-create-btn');
        if (quickBtn) {
            e.stopPropagation();
            criarRoteiroRapido(quickBtn);
            return;
        }

        const btn = e.target.closest('.expand-btn');
        if (btn) {
            const card = btn.closest('.nearby-card');
            const icon = btn.querySelector('i');
            
            // Altera a classe expandida
            card.classList.toggle('expanded');
            
            // Troca o ícone (seta cima/baixo)
            if (card.classList.contains('expanded')) {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        }
    });

    // Escuta o evento de tentar adicionar atração do modal
    document.addEventListener('add-to-route', (e) => {
        alert('Para adicionar atrações, primeiro crie um roteiro clicando em "Criar Roteiro" no card da cidade desejada!');
        const modal = document.querySelector('details-modal');
        if (modal) modal.close();
    });

    async function criarRoteiroRapido(btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // Cria o roteiro para começar amanhã com 3 dias de duração como padrão
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() + 1);
        const dataFormatada = dataInicio.toISOString().split('T')[0];

        const payload = {
            roteiro: { data_inicio: dataFormatada, duracao_dias: 3, numero_pessoas: 1, orcamento_total: 0 },
            pais: { nome: btn.getAttribute('data-pais') },
            cidade: { nome: btn.getAttribute('data-nome'), descricao: btn.getAttribute('data-desc'), url_imagem: btn.getAttribute('data-img') },
            dias: []
        };

        try {
            const response = await fetch(`${API_BASE}/roteiros`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Erro ao criar roteiro');
            const result = await response.json();

            // Redireciona para o roteiro diário
            window.location.href = `/public/pages/roteiro-diario.html?id=${result.roteiroId || result.id}`;

        } catch (error) {
            console.error(error);
            alert('Falha ao criar o roteiro rápido.');
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    async function loadDestinations() {
        try {
            // Realiza a chamada para a rota de cidades curadas (tourist.js)
            const response = await fetch(`${API_BASE}/api/tourist/curated-cities`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Erro ao carregar cidades da API');
            
            const data = await response.json();
            
            renderPopularCities(data);
            renderNearbyCities(data);

        } catch (error) {
            console.error(error);
            popularCarousel.innerHTML = '<p style="padding: 20px; font-size: 14px; color: red;">Erro ao carregar destinos populares.</p>';
            nearbyList.innerHTML = '<p style="padding: 20px; font-size: 14px; text-align: center; color: red;">Não foi possível buscar destinos no momento.</p>';
        }
    }

    function renderPopularCities(cities) {
        popularCarousel.innerHTML = '';
        
        // Pega as primeiras cidades para usar como "Cidades Populares"
        const popularCities = cities.slice(0, 5);

        popularCities.forEach(item => {
            const infoCidade = item.cidade || item;
            const nome = infoCidade.nome || infoCidade.name || 'Destino';
            const atracoes = item.pontos_turisticos || item.touristSpots || [];
            
            const primeiraAtracao = atracoes.length > 0 ? atracoes[0] : {};
            const urlImagem = infoCidade.url_imagem || infoCidade.image || primeiraAtracao.url_imagem || primeiraAtracao.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400';

            const card = document.createElement('div');
            card.className = 'popular-card';
            card.style.backgroundImage = `url('${urlImagem}')`;
            
            card.innerHTML = `
                <div class="popular-overlay"></div>
                <div class="popular-info">
                    <h3>${nome}</h3>
                    <p>Alta demanda</p>
                </div>
            `;
            popularCarousel.appendChild(card);
        });
    }

    function renderNearbyCities(cities) {
        nearbyList.innerHTML = '';

        cities.forEach((item, index) => {
            const infoCidade = item.cidade || item;
            const infoPais = item.pais || {};
            const nomeCidade = infoCidade.nome || infoCidade.name || 'Destino';
            const nomePais = infoPais.nome || infoPais.country || 'Desconhecido';
            const descricao = infoCidade.descricao || infoCidade.description || `Explore as maravilhas de ${nomeCidade}.`;
            const atracoes = item.pontos_turisticos || item.touristSpots || [];
            
            const primeiraAtracao = atracoes.length > 0 ? atracoes[0] : {};
            const urlImagemCidade = infoCidade.url_imagem || infoCidade.image || primeiraAtracao.url_imagem || primeiraAtracao.image || 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&q=80&w=150';

            // Deixa o primeiro card já aberto para o usuário ver como funciona
            const isExpanded = index === 0 ? 'expanded' : '';
            const iconClass = index === 0 ? 'fa-chevron-up' : 'fa-chevron-down';

            const descSafe = descricao.replace(/"/g, '&quot;');

            const card = document.createElement('div');
            card.className = `nearby-card ${isExpanded}`;
            
            // Mapeia até 6 pontos turísticos de cada cidade para colocar dentro do acordeão
            const atracoesHtml = atracoes.slice(0, 6).map(atracao => {
                const nomeAtracao = atracao.nome || atracao.name || 'Atração';
                const categoria = atracao.categoria || atracao.tipo || 'Lazer';
                const imgAtracao = atracao.url_imagem || atracao.image || 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=200';
                
                // Prepara os dados da atração para enviar ao modal
                const atracaoModal = {
                    nome: nomeAtracao,
                    url_imagem: imgAtracao,
                    categoria: categoria,
                    descricao: atracao.descricao || atracao.description || 'Sem descrição disponível.',
                    avaliacao: atracao.avaliacao || 0,
                    endereco: atracao.endereco || 'Endereço não informado',
                    e_gratuito: atracao.e_gratuito !== undefined ? atracao.e_gratuito : true,
                    preco: atracao.preco || null,
                    moeda: atracao.moeda || 'R$',
                    duracao_horas: atracao.duracao_horas || null,
                    latitude: atracao.latitude || null,
                    longitude: atracao.longitude || null
                };
                const dataAtracao = encodeURIComponent(JSON.stringify(atracaoModal));

                return `
                    <div class="attraction-card" data-atracao="${dataAtracao}" style="cursor: pointer;" title="Ver detalhes">
                        <div class="attraction-img-wrapper">
                            <span class="tag">${categoria}</span>
                            <img src="${imgAtracao}" alt="${nomeAtracao}">
                        </div>
                        <p>${nomeAtracao}</p>
                    </div>
                `;
            }).join('');

            card.innerHTML = `
                <div class="nearby-header">
                    <img src="${urlImagemCidade}" alt="${nomeCidade}" class="nearby-img">
                    <div class="nearby-info-main">
                        <h3>${nomeCidade}</h3>
                        <p class="location"><i class="fas fa-map-marker-alt"></i> ${nomePais}</p>
                        <p class="desc" title="${descricao}">${descricao}</p>
                        <div class="stats">
                            <span><i class="fas fa-star"></i> 4.8</span>
                            <span><i class="fas fa-map"></i> ${atracoes.length} locais</span>
                        </div>
                        <button class="quick-create-btn" data-nome="${nomeCidade}" data-pais="${nomePais}" data-desc="${descSafe}" data-img="${urlImagemCidade}" style="margin-top: 8px; background: var(--primary-cyan); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; width: fit-content; transition: opacity 0.2s;"><i class="fas fa-plus"></i> Criar Roteiro</button>
                    </div>
                    <button class="expand-btn"><i class="fas ${iconClass}"></i></button>
                </div>
                ${atracoes.length > 0 ? `
                <div class="nearby-content">
                    <div class="attractions-header">
                        <h4>PRINCIPAIS ATRAÇÕES</h4>
                    </div>
                    <div class="carousel attractions-carousel">
                        ${atracoesHtml}
                    </div>
                </div>
                ` : ''}
            `;
            
            nearbyList.appendChild(card);
        });
    }

    // Dispara a requisição ao carregar a página
    loadDestinations();
});
