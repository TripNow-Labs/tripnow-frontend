/// <reference types="cypress" />

describe('Fluxo de Login - TripNow', () => {
  beforeEach(() => {
    // Acessando o servidor Node.js/Express local rodando na porta 3000
    cy.visit('http://localhost:3000/pages/login.html'); 
  });

  it('Deve preencher o formulário, simular o envio e realizar o login com sucesso', () => {
    // Intercepta a requisição para a API
    cy.intercept('POST', 'http://localhost:3333/api/v1/auth', {
      statusCode: 200,
      body: { 
        user: { user_name: 'cypress_tester', tipo_usuario: 'turista' },
        token: 'mock-token-123'
      }
    }).as('postLogin');

    // Intercepta a requisição feita pela Home logo após o login, 
    // evitando o erro 401 que aciona o forceLogout() no layout.js
    cy.intercept('GET', '**/api/v1/roteiros*', {
      statusCode: 200,
      body: []
    }).as('getRoteiros');

    // Preenche os campos usando os IDs declarados no login.html/login.js
    cy.get('#email').type('teste.cypress@exemplo.com');
    cy.get('#senha').type('senhaForte123');

    // Clica no botão de entrar
    cy.get('#login-button').click();

    // Aguarda a chamada da API que nós interceptamos
    cy.wait('@postLogin');

    // --- VALIDAÇÕES DE INTERFACE (Asserções) ---
    // Após o login com sucesso, deve redirecionar para a home
    cy.url().should('include', '/pages/home.html');

    // Verifica se os dados foram salvos no localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('userName')).to.eq('cypress_tester');
      expect(win.localStorage.getItem('token')).to.eq('mock-token-123');
    });
  });

  it('Deve exibir erro ao tentar logar com credenciais inválidas', () => {
    // Intercepta a requisição para simular erro
    cy.intercept('POST', 'http://localhost:3333/api/v1/auth', {
      statusCode: 401,
      body: { error: 'Credenciais inválidas.' }
    }).as('postLoginError');

    // Preenche os campos com senha errada
    cy.get('#email').type('teste.cypress@exemplo.com');
    cy.get('#senha').type('senhaErrada'); 

    cy.get('#login-button').click();
    cy.wait('@postLoginError');

    // Validação: Verificar se a mensagem de erro aparece na tela
    cy.get('#error-message').should('have.class', 'active').and('contain', 'Credenciais inválidas.');
  });
});