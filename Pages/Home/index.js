// pages/home/index.js

// Seleciona os elementos do DOM
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarUsername = document.getElementById('sidebarUsername');
const userDropdown = document.getElementById('userDropdown');
const logoutOption = document.getElementById('logoutOption');
const admOption = document.getElementById('admOption');

// Recupera os dados do usuário, definidos no auth.js e armazenados em window.currentUser
const currentUser = window.currentUser || {};
sidebarUsername.textContent = currentUser.username || 'Jogador';

// Se o usuário tiver a permissão de administrador, exibe a opção "Gerenciar"
if (currentUser.adm === true) {
  admOption.classList.remove('hidden');
}

// Função para alternar a exibição do sidebar
function toggleSidebar() {
  sidebar.classList.toggle('-translate-x-full');
}

// Abre/fecha o sidebar ao clicar no botão hambúrguer
hamburgerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSidebar();
});

// Fecha o sidebar e o dropdown ao clicar fora deles
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    sidebar.classList.add('-translate-x-full');
    userDropdown.classList.add('hidden');
  }
});

// Alterna a exibição do dropdown ao clicar no nome do usuário
sidebarUsername.addEventListener('click', (e) => {
  e.stopPropagation();
  userDropdown.classList.toggle('hidden');
});

// Opção "Sair": remove os dados do usuário e redireciona para a página de login
logoutOption.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = '../../index.html';
});

// Opção "Gerenciar": redireciona para a página de gerenciamento (./pages/adm/index.html)
admOption.addEventListener('click', () => {
  window.location.href = '../../pages/adm/index.html';
});
