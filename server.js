// server.js
const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const helmet = require('helmet');

const app = express();
const PORT = 3000;
const isDev = process.env.NODE_ENV !== 'production';

// --- Headers de Segurança ---
// CSP, COOP e X-Frame-Options aplicados em todas as respostas HTML.
app.use(
    helmet({
        // 1. CONTENT SECURITY POLICY — bloqueia recursos não autorizados e mitiga XSS
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],

                // Scripts permitidos: próprios + Chart.js + Font Awesome
                // 'unsafe-inline' liberado apenas em dev para o script do LiveReload.
                // Em produção, remover 'unsafe-inline' e usar nonce ou hash.
                scriptSrc: [
                    "'self'",
                    'https://cdn.jsdelivr.net',     // Chart.js
                    'https://cdnjs.cloudflare.com', // Font Awesome JS (se usado)
                    ...(isDev ? ["'unsafe-inline'"] : []),
                ],

                // Estilos: Font Awesome usa inline styles internamente via CSS
                styleSrc: [
                    "'self'",
                    'https://cdnjs.cloudflare.com',
                    "'unsafe-inline'",
                ],

                // Fontes do Font Awesome (woff2, woff)
                fontSrc: [
                    "'self'",
                    'https://cdnjs.cloudflare.com',
                    'data:',
                ],

                // Imagens: próprias, data URIs e HTTPS externo (fotos de perfil etc.)
                imgSrc: ["'self'", 'data:', 'https:'],

                // Conexões XHR/fetch: backend local + WebSocket do LiveReload em dev
                connectSrc: [
                    "'self'",
                    'http://localhost:3333',
                    ...(isDev ? ['ws://localhost:35729'] : []),
                ],

                // Bloqueia iframes completamente (anti-clickjacking via CSP)
                frameSrc: ["'none'"],
                frameAncestors: ["'none'"],

                // Bloqueia plugins Flash/Java (legado)
                objectSrc: ["'none'"],

                // Impede redefinição da base URL da página
                baseUri: ["'self'"],

                // 4. TRUSTED TYPES — obriga uso de APIs seguras de DOM, mitigando XSS via innerHTML.
                // Em dev: report-only para não bloquear Chart.js caso use innerHTML internamente.
                // Em produção: mover para contentSecurityPolicy (acima) após validar com testes.
                ...(isDev
                    ? {}
                    : {
                          requireTrustedTypesFor: ["'script'"],
                          trustedTypes: ['default', '!allow-duplicates'],
                      }),
            },
        },

        // 2. CROSS-ORIGIN OPENER POLICY — isola o contexto de navegação.
        // Impede que páginas abertas via window.open() acessem o objeto window desta página.
        crossOriginOpenerPolicy: { policy: 'same-origin' },

        // 3. X-FRAME-OPTIONS — segunda camada anti-clickjacking (compatibilidade com browsers antigos).
        // 'deny' é mais restritivo que 'sameorigin': bloqueia iframe em qualquer origem.
        frameguard: { action: 'deny' },
    })
);

// --- Configuração do LiveReload (apenas em dev) ---
if (isDev) {
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(__dirname, 'public'));

    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/');
        }, 100);
    });

    app.use(connectLivereload());
}

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- Rotas Específicas ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
    res.status(404).send(`
        <h1>404 - Página não encontrada</h1>
        <p>O arquivo que você tentou acessar não existe.</p>
        <a href="/">Voltar para o Login</a>
    `);
});

app.listen(PORT, () => {
    console.log(`✅ Front-end rodando em: http://localhost:${PORT}`);
    console.log(`📂 Servindo arquivos da pasta: ${path.join(__dirname, 'public')}`);
    console.log(`🛡️  Modo: ${isDev ? 'desenvolvimento (Trusted Types em report-only)' : 'produção (Trusted Types aplicado)'}`);
});
