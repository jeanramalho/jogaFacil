// =====================================================
// Configuração do Supabase (credenciais do projeto)
// =====================================================
const SUPABASE_URL = "https://kmunojpmxnrepmzgxqmo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdW5vanBteG5yZXBtemd4cW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzExOTksImV4cCI6MjA1NzcwNzE5OX0.pXDLJnT4Pgf1eZrThAe_7XpPQ6w5wTYFX_jbb2SltwA";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===========================================
// Seleção de elementos do DOM
// ===========================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');

const cardsView = document.getElementById('cardsView');
const managementView = document.getElementById('managementView');
const cardPlayers = document.getElementById('cardPlayers');
const backBtn = document.getElementById('backBtn');

const toggleFormBtn = document.getElementById('toggleFormBtn');
const formSection = document.getElementById('formSection');

const searchInput = document.getElementById('searchInput');
const filterTerBtn = document.getElementById('filterTer');
const filterQuinBtn = document.getElementById('filterQuin');
const filterDomBtn = document.getElementById('filterDom');

const playersTableBody = document.getElementById('playersTableBody');
const playerForm = document.getElementById('playerForm');
const formTitle = document.getElementById('formTitle');
const cancelForm = document.getElementById('cancelForm');

// Inputs do formulário
const inputPlayerId = document.getElementById('playerId');
const inputJogador = document.getElementById('inputJogador');
const inputUsername = document.getElementById('inputUsername');
const inputCell = document.getElementById('inputCell');
const inputAdm = document.getElementById('inputAdm');
const inputTerca = document.getElementById('inputTerca');
const inputQuinta = document.getElementById('inputQuinta');
const inputDomingo = document.getElementById('inputDomingo');

// ===========================================
// Variáveis para filtros
// ===========================================
let filterTer = false, filterQuin = false, filterDom = false;

// ===========================================
// Navegação entre views
// ===========================================
function showManagementView() {
  cardsView.classList.add('hidden');
  managementView.classList.remove('hidden');
  loadPlayers();
}
function showCardsView() {
  managementView.classList.add('hidden');
  cardsView.classList.remove('hidden');
}
cardPlayers.addEventListener('click', showManagementView);
backBtn.addEventListener('click', showCardsView);

// ===========================================
// Lógica para a sidebar
// ===========================================
function toggleSidebar() {
  sidebar.classList.toggle('-translate-x-full');
}
hamburgerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSidebar();
});
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    sidebar.classList.add('-translate-x-full');
  }
});

// ===========================================
// Toggle do formulário (criar/editar)
// ===========================================
toggleFormBtn.addEventListener('click', () => {
  formSection.classList.toggle('hidden');
  if (!formSection.classList.contains('hidden')) {
    formTitle.textContent = 'Novo Jogador';
  }
});

// ===========================================
// Eventos para filtros
// ===========================================
filterTerBtn.addEventListener('click', () => {
  filterTer = !filterTer;
  filterTerBtn.classList.toggle('bg-blue-600', filterTer);
  loadPlayers();
});
filterQuinBtn.addEventListener('click', () => {
  filterQuin = !filterQuin;
  filterQuinBtn.classList.toggle('bg-blue-600', filterQuin);
  loadPlayers();
});
filterDomBtn.addEventListener('click', () => {
  filterDom = !filterDom;
  filterDomBtn.classList.toggle('bg-blue-600', filterDom);
  loadPlayers();
});

// ===========================================
// Função para carregar jogadores e aplicar filtros
// ===========================================
async function loadPlayers() {
  const search = searchInput.value.trim().toLowerCase();
  const { data: players, error } = await supabaseClient
    .from('jogadores')
    .select('*')
    .order('id', { ascending: true });
  if (error) {
    console.error('Erro ao carregar jogadores:', error);
    return;
  }
  // Filtra os jogadores no client-side
  let filtered = players;
  if (search) {
    filtered = filtered.filter(player => 
      player.jogador.toLowerCase().includes(search) || 
      player.cell.includes(search)
    );
  }
  if (filterTer || filterQuin || filterDom) {
    filtered = filtered.filter(player => {
      return (filterTer ? player.fut_terca : false) || 
             (filterQuin ? player.fut_quinta : false) || 
             (filterDom ? player.fut_domingo : false);
    });
  }
  
  // Preenche a tabela
  playersTableBody.innerHTML = '';
  filtered.forEach(player => {
    let peladasArr = [];
    if (player.fut_terca) peladasArr.push("ter");
    if (player.fut_quinta) peladasArr.push("quin");
    if (player.fut_domingo) peladasArr.push("dom");
    const peladas = peladasArr.join(', ');
    const row = document.createElement('tr');
    row.classList.add('border-b', 'border-gray-700');
    row.innerHTML = `
      <td class="p-2">${player.jogador}</td>
      <td class="p-2">${player.cell}</td>
      <td class="p-2">${peladas}</td>
      <td class="p-2 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
        <button class="bg-blue-600 px-2 py-1 rounded text-xs md:text-sm" onclick="editPlayer(${player.id})">Editar</button>
        <button class="bg-red-600 px-2 py-1 rounded text-xs md:text-sm" onclick="deletePlayer(${player.id})">Deletar</button>
      </td>
    `;
    playersTableBody.appendChild(row);
  });
}

// ===========================================
// Processa o envio do formulário para criar/atualizar jogador
// ===========================================
playerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const jogador = inputJogador.value.trim();
  const username = inputUsername.value.trim();
  const cell = inputCell.value.trim();
  const adm = inputAdm.checked;
  const fut_terca = inputTerca.checked;
  const fut_quinta = inputQuinta.checked;
  const fut_domingo = inputDomingo.checked;
  
  if (inputPlayerId.value) {
    const id = parseInt(inputPlayerId.value);
    const { error } = await supabaseClient
      .from('jogadores')
      .update({ jogador, username, cell, adm, fut_terca, fut_quinta, fut_domingo })
      .match({ id });
    if (error) {
      alert('Erro ao atualizar jogador');
      console.error(error);
    }
  } else {
    const { error } = await supabaseClient
      .from('jogadores')
      .insert([{ jogador, username, cell, adm, fut_terca, fut_quinta, fut_domingo }]);
    if (error) {
      alert('Erro ao criar jogador');
      console.error(error);
    }
  }
  resetForm();
  loadPlayers();
});

// ===========================================
// Preenche o formulário para edição
// ===========================================
async function editPlayer(id) {
  formSection.classList.remove('hidden');
  const { data: player, error } = await supabaseClient
    .from('jogadores')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    alert('Erro ao carregar jogador para edição');
    console.error(error);
    return;
  }
  inputPlayerId.value = player.id;
  inputJogador.value = player.jogador;
  inputUsername.value = player.username;
  inputCell.value = player.cell;
  inputAdm.checked = player.adm;
  inputTerca.checked = player.fut_terca;
  inputQuinta.checked = player.fut_quinta;
  inputDomingo.checked = player.fut_domingo;
  formTitle.textContent = 'Editar Jogador';
}

// ===========================================
// Deleta um jogador
// ===========================================
async function deletePlayer(id) {
  if (!confirm('Tem certeza que deseja deletar este jogador?')) return;
  const { error } = await supabaseClient
    .from('jogadores')
    .delete()
    .match({ id });
  if (error) {
    alert('Erro ao deletar jogador');
    console.error(error);
    return;
  }
  loadPlayers();
}

// ===========================================
// Evento para cancelar e resetar o formulário
// ===========================================
cancelForm.addEventListener('click', resetForm);
function resetForm() {
  inputPlayerId.value = '';
  inputJogador.value = '';
  inputUsername.value = '';
  inputCell.value = '';
  inputAdm.checked = false;
  inputTerca.checked = false;
  inputQuinta.checked = false;
  inputDomingo.checked = false;
  formTitle.textContent = 'Novo Jogador';
}

// ===========================================
// Busca de jogadores ao digitar
// ===========================================
searchInput.addEventListener('input', loadPlayers);

// ===========================================
// Atualiza informações do usuário na sidebar
// ===========================================
function updateSidebarUser() {
  const currentUser = window.currentUser || {};
  const userNameSidebar = document.getElementById('userNameSidebar');
  const userAvatarSidebar = document.getElementById('userAvatarSidebar');
  const admOptionSidebar = document.getElementById('admOption');
  if (currentUser.jogador) {
    userNameSidebar.textContent = currentUser.jogador;
  }
  if (currentUser.email) {
    const gravatarUrl = `https://www.gravatar.com/avatar/${md5(currentUser.email.trim().toLowerCase())}?d=mp`;
    userAvatarSidebar.src = gravatarUrl;
  }
  if (currentUser.adm) {
    admOptionSidebar.classList.remove('hidden');
  }
}
updateSidebarUser();

// ===========================================
// Dropdown da sidebar (usuário)
// ===========================================
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
userMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  userDropdown.classList.toggle('hidden');
});
document.addEventListener('click', () => {
  userDropdown.classList.add('hidden');
});

// ===========================================
// Logout
// ===========================================
const logoutOption = document.getElementById('logoutOption');
logoutOption.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = '../../index.html';
});
