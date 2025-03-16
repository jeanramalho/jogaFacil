// Seleção de elementos
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const playerName = document.getElementById('playerName');
const userAvatar = document.getElementById('userAvatar');
const userDropdown = document.getElementById('userDropdown');
const userMenuBtn = document.getElementById('userMenuBtn');
const logoutOption = document.getElementById('logoutOption');
const admOption = document.getElementById('admOption');

// Recupera usuário do auth.js
const currentUser = window.currentUser || {};

// Define nome do jogador
playerName.textContent = currentUser.jogador || 'Jogador';

// Exibe opção "Gerenciar" se for admin
if (currentUser.adm) {
  admOption.classList.remove('hidden');
}

// Define avatar do usuário com Gravatar
if (currentUser.email) {
  const gravatarUrl = `https://www.gravatar.com/avatar/${md5(currentUser.email.trim().toLowerCase())}?d=mp`;
  userAvatar.src = gravatarUrl;
}

// Alterna sidebar
function toggleSidebar() {
  sidebar.classList.toggle('-translate-x-full');
}

// Fecha sidebar ao clicar fora
document.addEventListener('click', (event) => {
  if (!sidebar.contains(event.target) && !hamburgerBtn.contains(event.target)) {
    sidebar.classList.add('-translate-x-full');
  }
});

// Clique no botão do menu hamburguer
hamburgerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSidebar();
});

// Alternar dropdown do usuário
userMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
});

// Fecha dropdown ao clicar fora
document.addEventListener('click', () => {
  userDropdown.style.display = 'none';
});

// Logout
logoutOption.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = '../../index.html';
});

// Redirecionar admin
admOption.addEventListener('click', () => {
  window.location.href = '../../Pages/Adm/index.html';
});
