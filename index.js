// index.js

// Supabase credentials
const SUPABASE_URL = "https://kmunojpmxnrepmzgxqmo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdW5vanBteG5yZXBtemd4cW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzExOTksImV4cCI6MjA1NzcwNzE5OX0.pXDLJnT4Pgf1eZrThAe_7XpPQ6w5wTYFX_jbb2SltwA";

// Inicializa o cliente Supabase utilizando outro nome para evitar conflito
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.classList.add("hidden");

    const username = document.getElementById("username").value.trim();
    const cell = document.getElementById("cell").value.trim();

    // Consulta a tabela "jogadores" (assumindo este nome com base nos campos fornecidos)
    const { data, error } = await supabaseClient
      .from('jogadores')
      .select('*')
      .eq('username', username)
      .eq('cell', cell)
      .single(); // Espera somente um registro

    if (error || !data) {
      errorMsg.classList.remove("hidden");
      console.error("Erro no login:", error);
      return;
    }

    // Salva os dados do usuário no localStorage para utilização futura
    localStorage.setItem("user", JSON.stringify(data));

    // Redireciona para a página home
    window.location.href = "./pages/home/index.html";
  });
});
