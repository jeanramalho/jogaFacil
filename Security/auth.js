// security/auth.js

(function() {
    // Verifica se os dados do usuário estão salvos no localStorage
    const userData = localStorage.getItem("user");
  
    // Se não houver dados, redireciona para a página de login
    if (!userData) {
      window.location.href = window.location.origin + "/index.html";
    } else {
      // Armazena os dados do usuário em uma variável global para uso futuro
      window.currentUser = JSON.parse(userData);
    }
  })();
  