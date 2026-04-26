const btsVerDetalhes = document.querySelectorAll('.card-button');

btsVerDetalhes.forEach(botao => {
    botao.addEventListener('click', () => {
        // 1. Pega o ID do destino que foi setado no atributo 'data-id'
        const id = botao.getAttribute('data-id'); // Ex: 'paris_franca'

        if (id) {
            // 2. Cria a URL incluindo o Parâmetro de Consulta (Query Parameter)
            // O formato é: ?CHAVE=VALOR
            const urlDestino = `EscolherDestino.html?cidadeID=${id}`;
            
            // 3. Redireciona o navegador para a URL completa
            window.location.href = urlDestino; // Ex: EscolherDestino.html?cidadeID=paris_franca
        } else {
            console.error('ID do destino não encontrado no botão.');
            // Tratar erro ou continuar o redirecionamento sem ID, se necessário.
            window.location.href = 'EscolherDestino.html';
        }
    });
});