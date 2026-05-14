/// <reference types="cypress" />

describe('Fluxo de Cadastro - TripNow', () => {
  beforeEach(() => {
    // Acessando o servidor Node.js/Express local rodando na porta 3000
    cy.visit('http://localhost:3000/pages/cadastro.html'); 
  });

  it('Deve preencher o formulário, simular o envio e exibir a etapa de verificação', () => {
    // Intercepta a requisição para a API (Evita criar lixo no banco de dados real durante os testes)
    cy.intercept('POST', 'http://localhost:3333/api/v1/user/createuserverifycode', {
      statusCode: 200,
      body: { message: 'Código enviado com sucesso' }
    }).as('postCadastro');

    // Preenche os campos usando os IDs exatos declarados no seu cadastro.js
    cy.get('#name').type('Usuário Cypress');
    cy.get('#user_name').type('cypress_tester');
    cy.get('#input-email').type('teste.cypress@exemplo.com');
    cy.get('#input-password').type('senhaForte123');
    cy.get('#input-confirm-password').type('senhaForte123');

    // Clica no botão de cadastrar
    cy.get('#btn-cadastrar').click();

    // Aguarda a chamada da API que nós interceptamos
    cy.wait('@postCadastro');

    // --- VALIDAÇÕES DE INTERFACE (Asserções) ---
    
    // 1. O formulário inicial deve receber a classe 'hidden'
    cy.get('#step-signup').should('have.class', 'hidden');
    
    // 2. A área de verificação do código deve ficar visível
    cy.get('#step-verification').should('not.have.class', 'hidden');
    
    // 3. A mensagem de feedback deve aparecer em verde (sucesso)
    cy.get('#feedback-message').should('be.visible').and('contain', 'Código enviado para seu e-mail!');
  });

  it('Deve exibir erro ao tentar cadastrar com senhas divergentes', () => {
    // Preenche os campos, mas força um erro com senhas que não coincidem
    cy.get('#name').type('Usuário Cypress');
    cy.get('#user_name').type('cypress_tester');
    cy.get('#input-email').type('teste.cypress@exemplo.com');
    cy.get('#input-password').type('senhaForte123');
    cy.get('#input-confirm-password').type('senhaDiferente'); // <- Senha errada de propósito

    cy.get('#btn-cadastrar').click();

    // Validação: Verificar se a mensagem de erro aparece na tela impedindo o avanço
    cy.get('#feedback-message').should('be.visible');
  });
});