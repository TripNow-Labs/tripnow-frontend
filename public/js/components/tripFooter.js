class TripFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
        <style>
            :host { display: block; margin-top: auto; }
            .footer { padding: 40px 0; background-color: #FFFFFF; border-top: 1px solid #E5E7EB; font-family: 'Roboto', sans-serif; }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
            .footer-links { display: flex; gap: 40px; }
            .footer-link { text-decoration: none; color: #1A1A1A; font-weight: 500; font-size: 0.9rem; }
            .footer-text { color: #6B7280; font-size: 0.9rem; }
            @media (max-width: 768px) {
                .container { flex-direction: column; gap: 20px; text-align: center; }
                .footer-links { flex-direction: row; gap: 20px; }
            }
        </style>
        <footer class="footer">
            <div class="container">
                <div class="footer-links">
                    <a href="#" class="footer-link">Sobre nós</a>
                    <a href="#" class="footer-link">Termos</a>
                    <a href="#" class="footer-link">Contato</a>
                    <a href="#" class="footer-link">Privacidade</a>
                </div>
                <div class="footer-text">&copy; 2025 Trip Now. Todos os direitos reservados.</div>
            </div>
        </footer>
        `;
    }
}
customElements.define('trip-footer', TripFooter);