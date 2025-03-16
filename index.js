// index.js

// Supabase credentials (utilize as credenciais do seu projeto)
const SUPABASE_URL = "https://kmunojpmxnrepmzgxqmo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdW5vanBteG5yZXBtemd4cW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzExOTksImV4cCI6MjA1NzcwNzE5OX0.pXDLJnT4Pgf1eZrThAe_7XpPQ6w5wTYFX_jbb2SltwA";

// Inicializa o cliente Supabase e evita conflito com a variável global
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
  // Obtém os elementos do DOM
  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  // Evento de submit do formulário de login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Oculta a mensagem de erro, se estiver visível
    errorMsg.classList.add("hidden");

    // Recupera e processa os valores dos inputs:
    // Converte o username para minúsculas para padronizar
    const username = document.getElementById("username").value.trim().toLowerCase();
    // Remove todos os caracteres não numéricos do telefone
    const cell = document.getElementById("cell").value.replace(/\D/g, '');

    // Debug: exibe no console os valores processados
    console.log("Tentando login com:", username, cell);

    /* 
      Consulta a tabela "jogadores" filtrando pelos campos "username" e "cell".
      Utilizamos o método .match() para filtrar por ambos os campos.
      
      Atenção: Com a política "Allow public read on jogadores" ativa no Supabase, 
      essa consulta retornará os dados necessários para o login.
    */
    const { data, error } = await supabaseClient
      .from('jogadores')
      .select('*')
      .match({ username: username, cell: cell });

    // Exibe no console a resposta da consulta para depuração
    console.log("Resposta da consulta:", data, error);

    // Se houver erro ou nenhum registro for encontrado, exibe a mensagem de erro
    if (error || !data || data.length === 0) {
      errorMsg.classList.remove("hidden");
      console.error("Erro no login:", error);
      return;
    }

    // Considera o primeiro registro (já que esperamos apenas um usuário)
    const userData = data[0];
    console.log("Usuário encontrado:", userData);

    // Armazena os dados do usuário no localStorage para uso em outras páginas
    localStorage.setItem("user", JSON.stringify(userData));

    // Redireciona para a página home após o login bem-sucedido
    window.location.href = "./Pages/Home/index.html";
  });
});
