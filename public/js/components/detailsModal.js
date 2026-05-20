class DetailsModal extends HTMLElement {
    constructor() {
        super();
        this.atracaoEmDestaque = null;
    }

    connectedCallback() {
        this.innerHTML = `
        <div id="details-modal" class="details-modal">
            <div class="details-hero-topbar">
                <button id="close-details-btn" class="icon-btn"><i class="fas fa-chevron-left"></i></button>
                <div class="topbar-actions">
                    <button class="icon-btn"><i class="fas fa-share-alt"></i></button>
                    <button class="icon-btn"><i class="far fa-heart"></i></button>
                </div>
            </div>
            <div id="detail-hero" class="details-hero">
                <div id="detail-hero-bg" class="details-hero-bg"></div>
                <div class="details-hero-overlay"></div>
                <div class="details-hero-info">
                    <div class="hero-title-wrapper">
                        <h1 id="hero-detail-title">Nome da Atração</h1>
                        <span id="hero-detail-category" class="hero-category-tag">Categoria</span>
                    </div>
                    <div class="hero-detail-subtitle">
                        <span class="rating-badge"><i class="fas fa-star"></i> <span id="hero-detail-rating-badge">0.0</span></span>
                        <span id="hero-detail-reviews">Endereço Resumido</span>
                    </div>
                </div>
            </div>

            <div class="details-body">
                <div class="detail-header-info">
                    <div class="detail-title-row" style="margin-bottom: 16px; justify-content: flex-end;">
                        <span id="detail-status" class="status-badge open">Aberto agora</span>
                    </div>
                </div>

                <div class="detail-action-row">
                    <div class="action-item"><div class="action-icon"><i class="far fa-heart"></i></div><span>Favoritar</span></div>
                    <div class="action-item"><div class="action-icon"><i class="fas fa-share-alt"></i></div><span>Partilhar</span></div>
                    <div class="action-item" id="btn-abrir-rotas" style="cursor: pointer;">
                        <div class="action-icon"><i class="far fa-paper-plane"></i></div><span>Rotas</span>
                    </div>
                    <div class="action-item highlight"><div class="action-icon"><i class="fas fa-ticket-alt"></i></div><span>Comprar Ticket</span></div>
                </div>

                <section class="detail-section">
                    <h3>Sobre</h3>
                    <p id="detail-description">Descrição completa da atração vai entrar aqui...</p>
                </section>

                <section class="detail-section practical-info">
                    <h3>Informações Práticas</h3>
                    <ul class="info-list">
                        <li>
                            <div class="info-icon"><i class="fas fa-map-marker-alt"></i></div>
                            <div>
                                <strong>ENDEREÇO</strong>
                                <p id="detail-address">Carregando...</p>
                            </div>
                        </li>
                        <li>
                            <div class="info-icon"><i class="far fa-clock"></i></div>
                            <div>
                                <strong>HORÁRIO</strong>
                                <p id="detail-duration">Consulte o local</p>
                            </div>
                        </li>
                        <li>
                            <div class="info-icon"><i class="fas fa-ticket-alt"></i></div>
                            <div>
                                <strong>PREÇO MÉDIO</strong>
                                <p id="detail-price">Consulte o local</p>
                            </div>
                        </li>
                    </ul>
                </section>

                <section class="detail-section map-section">
                    <!-- Imagem placeholder que simula o mapa do mockup -->
                    <div class="map-preview" id="map-preview-container" style="background-image: url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600');">
                        <i class="fas fa-map-marker-alt map-pin"></i>
                        <div class="map-preview-overlay">
                            <button id="open-map-preview-btn" class="map-open-btn"><i class="fas fa-external-link-alt"></i> Abrir no Google Maps</button>
                        </div>
                    </div>
                </section>

                <section class="detail-section reviews-section" id="detail-reviews-section">
                    <div class="reviews-header">
                        <h3>Avaliações</h3>
                        <a href="#" class="link-see-all">Ver todas</a>
                    </div>
                    <div class="reviews-list" id="detail-reviews-list"></div>
                    <button class="btn-read-more" id="btn-read-more-reviews">Ler mais avaliações <i class="fas fa-chevron-right"></i></button>
                </section>
                
                <div class="policies-info">
                    <p><i class="far fa-info-circle"></i> POLÍTICAS DE VISITAÇÃO</p>
                    <p>Ingressos não reembolsáveis em caso de mau tempo. Verifique a necessidade de agendamento prévio ou regras de vestimenta antes da visita.</p>
                </div>
            </div>

            <div class="details-sticky-footer">
                <button id="add-from-details-btn" class="primary-add-btn">
                    Adicionar ao Roteiro
                </button>
            </div>
        </div>

        <!-- MODAL DO MAPA (Google Maps Integrado) -->
        <div id="map-modal" class="map-modal">
            <div class="map-modal-content">
                <div class="map-header">
                    <h3 id="map-target-name">Localização</h3>
                    <button id="close-map-btn" class="close-map-icon">&times;</button>
                </div>
                <div class="map-body">
                    <iframe id="map-iframe" width="100%" height="100%" style="border:0;" allowfullscreen=""
                        loading="lazy" allow="geolocation" referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
                <div class="map-footer">
                    <button id="external-maps-btn" class="secondary-btn">Abrir no App do Maps</button>
                </div>
            </div>
        </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Efeito de Parallax, Blur e Fade out no Scroll
        const modalScroll = this.querySelector('#details-modal');
        const heroBg = this.querySelector('#detail-hero-bg');
        const heroInfo = this.querySelector('.details-hero-info');

        modalScroll.addEventListener('scroll', () => {
            const scrollY = modalScroll.scrollTop;
            const blurAmount = Math.min(scrollY / 15, 15); // Máximo de 15px de blur
            heroBg.style.filter = `blur(${blurAmount}px)`;
            heroInfo.style.opacity = Math.max(1 - (scrollY / 150), 0); // Desaparece o título suavemente
        });

        this.querySelector('#close-details-btn').addEventListener('click', () => {
            this.close();
        });

        this.querySelector('#add-from-details-btn').addEventListener('click', () => {
            if (!this.atracaoEmDestaque) return;
            
            const addBtn = this.querySelector('#add-from-details-btn');
            addBtn.textContent = '✓ Adicionado';
            addBtn.disabled = true;
            addBtn.style.backgroundColor = '#10B981';

            this.dispatchEvent(new CustomEvent('add-to-route', {
                detail: this.atracaoEmDestaque,
                bubbles: true,
                composed: true
            }));
        });

        // Ouvinte do novo botão de abrir mapa
        this.querySelector('#open-map-preview-btn').addEventListener('click', () => {
            if (!this.atracaoEmDestaque) return;
            this.openRoutes(); // Reusa a função do modal de mapa cheio
        });

        this.querySelector('#btn-abrir-rotas').addEventListener('click', () => {
            if (!this.atracaoEmDestaque) return;
            this.openRoutes();
        });

        this.querySelector('#close-map-btn').addEventListener('click', () => {
            this.closeMap();
        });

        this.querySelector('#external-maps-btn').addEventListener('click', () => {
            if (!this.atracaoEmDestaque) return;
            const termoBusca = this.atracaoEmDestaque.endereco 
                ? `${this.atracaoEmDestaque.nome}, ${this.atracaoEmDestaque.endereco}` 
                : this.atracaoEmDestaque.nome;
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(termoBusca)}`, '_blank');
        });
    }

    open(atracao) {
        this.atracaoEmDestaque = atracao;
        
        // Reseta o scroll e zera os efeitos visuais
        const modalScroll = this.querySelector('#details-modal');
        const heroBg = this.querySelector('#detail-hero-bg');
        const heroInfo = this.querySelector('.details-hero-info');
        modalScroll.scrollTop = 0;
        if (heroBg) heroBg.style.filter = 'blur(0px)';
        if (heroInfo) heroInfo.style.opacity = '1';

        this.querySelector('#detail-hero-bg').style.backgroundImage = `url('${atracao.url_imagem || ''}')`;
        this.querySelector('#hero-detail-category').textContent = atracao.categoria || 'Turismo';
        this.querySelector('#detail-description').textContent = atracao.descricao || 'Sem descrição disponível.';
        this.querySelector('#hero-detail-title').textContent = atracao.nome;

        const nota = parseFloat(atracao.avaliacao) || 0;
        this.querySelector('#hero-detail-rating-badge').textContent = nota.toFixed(1);

        const endereco = atracao.endereco || 'Endereço não informado';
        this.querySelector('#detail-address').textContent = endereco;
        
        // Pega apenas a primeira parte do endereço (antes da vírgula) para exibir no Hero
        const enderecoCurto = endereco.includes(',') ? endereco.split(',')[0] : endereco;
        this.querySelector('#hero-detail-reviews').textContent = `${Math.floor(Math.random() * 500) + 50} avaliações • ${enderecoCurto}`;
        
        // Aproveita o horario_funcionamento caso venha do Geoapify
        const duracao = atracao.horario_funcionamento || (atracao.duracao_horas ? `${atracao.duracao_horas}h recomendadas` : 'Consulte o local');
        this.querySelector('#detail-duration').textContent = duracao;

        const statusBadge = this.querySelector('#detail-status');
        if (atracao.horario_funcionamento) {
            statusBadge.style.display = 'inline-block';
            statusBadge.textContent = 'Ver horários';
            statusBadge.className = 'status-badge open';
        } else {
            statusBadge.style.display = 'none';
        }

        const priceElement = this.querySelector('#detail-price');
        if (atracao.e_gratuito) {
            priceElement.innerHTML = '<span style="color: #10B981; font-weight: bold;">Gratuito</span>';
        } else if (atracao.preco) {
            const moeda = atracao.moeda || 'R$';
            priceElement.textContent = `${moeda} ${atracao.preco}`;
        } else {
            priceElement.textContent = 'Preço sob consulta';
        }

        // Renderização Dinâmica de Avaliações (Suporta integração futura com API do TripAdvisor)
        const avaliacoes = atracao.avaliacoes && atracao.avaliacoes.length > 0 ? atracao.avaliacoes : [
            { autor: "Ricardo Oliveira", tempo: "Há 2 dias", nota: 5.0, texto: '"Experiência inesquecível. Recomendo subir cedo para apreciar a vista da mata atlântica. Chegue cedo para evitar filas!"', foto: "https://randomuser.me/api/portraits/men/32.jpg" },
            { autor: "Ana Beatriz", tempo: "Há 1 semana", nota: 4.5, texto: '"Vista maravilhosa, porém muito lotado no fim de semana. O valor do ingresso compensa cada centavo pela beleza do lugar."', foto: "https://randomuser.me/api/portraits/women/44.jpg" }
        ];

        this.querySelector('#detail-reviews-list').innerHTML = avaliacoes.map(rev => `
            <div class="review-card">
                <div class="review-header">
                    <img src="${rev.foto || 'https://via.placeholder.com/40'}" alt="${rev.autor}" class="reviewer-img">
                    <div class="reviewer-info">
                        <h4>${rev.autor}</h4>
                        <span>${rev.tempo}</span>
                    </div>
                    <div class="review-rating-badge"><i class="far fa-star"></i> ${parseFloat(rev.nota).toFixed(1)}</div>
                </div>
                <p class="review-text">${rev.texto}</p>
            </div>
        `).join('');

        const totalAvaliacoesText = atracao.total_avaliacoes || Math.floor(Math.random() * 15000) + 1000;
        this.querySelector('#btn-read-more-reviews').innerHTML = `Ler mais ${totalAvaliacoesText.toLocaleString('pt-BR')} avaliações <i class="fas fa-chevron-right"></i>`;

        const addBtn = this.querySelector('#add-from-details-btn');
        addBtn.textContent = 'Adicionar ao Roteiro';
        addBtn.style.backgroundColor = 'var(--primary-cyan)';
        addBtn.disabled = false;

        this.querySelector('#details-modal').classList.add('open');
    }

    close() {
        this.querySelector('#details-modal').classList.remove('open');
        this.closeMap();
        this.atracaoEmDestaque = null;
    }

    openRoutes() {
        const atracao = this.atracaoEmDestaque;
        const mapModal = this.querySelector('#map-modal');
        const mapIframe = this.querySelector('#map-iframe');
        const mapTargetName = this.querySelector('#map-target-name');

        const destino = (atracao.latitude && atracao.longitude)
            ? `${atracao.latitude},${atracao.longitude}`
            : encodeURIComponent(atracao.nome);
        
        mapTargetName.textContent = `Rota para ${atracao.nome}`;
        mapIframe.style.opacity = '0';
        mapModal.classList.add('active');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const fallbackUrl = `https://maps.google.com/maps?saddr=${lat},${lng}&daddr=${destino}&output=embed`;
                mapIframe.src = fallbackUrl;
                setTimeout(() => { mapIframe.style.opacity = '1'; }, 500);
            }, () => this.mostrarMapaFallback(destino));
        } else {
            this.mostrarMapaFallback(destino);
        }
    }

    mostrarMapaFallback(encodedDestino) {
        const mapIframe = this.querySelector('#map-iframe');
        const embedUrl = `https://maps.google.com/maps?q=${encodedDestino}&output=embed`;
        mapIframe.src = embedUrl;
        setTimeout(() => { mapIframe.style.opacity = '1'; }, 500);
    }

    closeMap() {
        const mapModal = this.querySelector('#map-modal');
        const mapIframe = this.querySelector('#map-iframe');
        mapModal.classList.remove('active');
        mapIframe.src = '';
    }
}

customElements.define('details-modal', DetailsModal);