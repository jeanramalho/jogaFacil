// security/auth.js

(function() {
    // Verifica se há dados do usuário no localStorage
    const userData = localStorage.getItem("user");
  
    if (!userData) {
      // Se não estiver logado, redireciona para a página de login
      window.location.href = window.location.origin + "/index.html";
    } else {
      // Armazena as informações do usuário em uma variável global para uso futuro
      window.currentUser = JSON.parse(userData);
    }
  })();
  