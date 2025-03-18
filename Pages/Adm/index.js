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
  peladaView.classList.add('hidden'); // Adicionado para esconder a view de peladas
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

// ======= Módulo de Peladas =======
// Seleção de elementos para a view de peladas
const cardPelada = document.getElementById('cardPelada');
const peladaView = document.getElementById('peladaView');
const backPeladaBtn = document.getElementById('backPeladaBtn');
const togglePeladaFormBtn = document.getElementById('togglePeladaFormBtn');
const peladaFormSection = document.getElementById('peladaFormSection');
const peladaForm = document.getElementById('peladaForm');
const peladaFormTitle = document.getElementById('peladaFormTitle');
const inputPeladaId = document.getElementById('peladaId');
const inputDataPelada = document.getElementById('inputDataPelada');
const inputHoraPelada = document.getElementById('inputHoraPelada');
const peladaTableBody = document.getElementById('peladaTableBody');
const filterDomPelada = document.getElementById('filterDomPelada');
const filterTerPelada = document.getElementById('filterTerPelada');
const filterQuinPelada = document.getElementById('filterQuinPelada');

// Variáveis para os filtros de peladas (renomeadas para evitar conflito)
let peladaFilterDom = false, peladaFilterTer = false, peladaFilterQuin = false;

// Evento: clique no card "Criar Pelada"
cardPelada.addEventListener('click', showPeladaView);

// Evento: botão de voltar na view de peladas
backPeladaBtn.addEventListener('click', showCardsView);

// Função para exibir a view de peladas
function showPeladaView() {
  cardsView.classList.add('hidden');
  peladaView.classList.remove('hidden');
  loadPeladas();
}

// Toggle do formulário de pelada
togglePeladaFormBtn.addEventListener('click', () => {
  peladaFormSection.classList.toggle('hidden');
  if (!peladaFormSection.classList.contains('hidden')) {
    peladaFormTitle.textContent = 'Nova Pelada';
  }
});

// Evento para cancelar e resetar o formulário de pelada
const cancelPeladaForm = document.getElementById('cancelPeladaForm');
cancelPeladaForm.addEventListener('click', resetPeladaForm);
function resetPeladaForm() {
  inputPeladaId.value = '';
  peladaForm.reset();
  peladaFormTitle.textContent = 'Nova Pelada';
}

// Eventos para filtros de peladas
filterDomPelada.addEventListener('click', () => {
  peladaFilterDom = !peladaFilterDom;
  filterDomPelada.classList.toggle('bg-blue-600', peladaFilterDom);
  loadPeladas();
});
filterTerPelada.addEventListener('click', () => {
  peladaFilterTer = !peladaFilterTer;
  filterTerPelada.classList.toggle('bg-blue-600', peladaFilterTer);
  loadPeladas();
});
filterQuinPelada.addEventListener('click', () => {
  peladaFilterQuin = !peladaFilterQuin;
  filterQuinPelada.classList.toggle('bg-blue-600', peladaFilterQuin);
  loadPeladas();
});

// Função para carregar peladas de acordo com filtros
async function loadPeladas() {
  let results = [];
  // Função auxiliar para carregar de uma tabela e atribuir o dia
  async function loadFromTable(tableName, diaLabel) {
    const { data, error } = await supabaseClient.from(tableName).select('*');
    if (!error && data) {
      data.forEach(record => record.dia = diaLabel);
      return data;
    } else {
      console.error('Erro ao carregar', tableName, error);
      return [];
    }
  }
  
  // Se algum filtro estiver ativo, carregar somente das tabelas filtradas
  if (peladaFilterDom || peladaFilterTer || peladaFilterQuin) {
    if (peladaFilterDom) results = results.concat(await loadFromTable('fut_domingo', 'Domingo'));
    if (peladaFilterTer) results = results.concat(await loadFromTable('fut_terca', 'Terça-Feira'));
    if (peladaFilterQuin) results = results.concat(await loadFromTable('fut_quinta', 'Quinta-Feira'));
  } else {
    // Caso contrário, carregar de todas as tabelas
    results = results.concat(await loadFromTable('fut_domingo', 'Domingo'));
    results = results.concat(await loadFromTable('fut_terca', 'Terça-Feira'));
    results = results.concat(await loadFromTable('fut_quinta', 'Quinta-Feira'));
  }
  
  // Ordena os resultados da mais recente para a mais antiga
  results.sort((a, b) => new Date(b.data_pelada) - new Date(a.data_pelada));
  
  // Preenche a tabela
  peladaTableBody.innerHTML = '';
  results.forEach(record => {
    const horaFormatted = record.hora ? record.hora.slice(0,5) : '';
    const row = document.createElement('tr');
    row.classList.add('border-b', 'border-gray-700');
    row.innerHTML = `
      <td class="p-2">${record.dia}</td>
      <td class="p-2">${record.data_pelada}</td>
      <td class="p-2">${horaFormatted}</td>
      <td class="p-2 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
        <button class="bg-blue-600 px-2 py-1 rounded text-xs md:text-sm" onclick="editPelada(${record.id}, '${record.dia}')">Editar</button>
        <button class="bg-red-600 px-2 py-1 rounded text-xs md:text-sm" onclick="deletePelada(${record.id}, '${record.dia}')">Deletar</button>
      </td>
    `;
    peladaTableBody.appendChild(row);
  });
}

// Processa o envio do formulário para criar ou atualizar uma pelada
peladaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const peladaDay = document.querySelector('input[name=\"peladaDay\"]:checked').value;
  const dataPelada = document.getElementById('inputDataPelada').value;
  const horaPelada = document.getElementById('inputHoraPelada').value;
  
  // Determina a tabela com base no dia selecionado
  let tableName;
  if (peladaDay === 'dom') tableName = 'fut_domingo';
  else if (peladaDay === 'ter') tableName = 'fut_terca';
  else if (peladaDay === 'quin') tableName = 'fut_quinta';
  
  if (document.getElementById('peladaId').value) {
    const id = parseInt(document.getElementById('peladaId').value);
    const { error } = await supabaseClient
      .from(tableName)
      .update({ data_pelada: dataPelada, hora: horaPelada })
      .match({ id });
    if (error) {
      alert('Erro ao atualizar pelada');
      console.error(error);
    }
  } else {
    const { error } = await supabaseClient
      .from(tableName)
      .insert([{ data_pelada: dataPelada, hora: horaPelada }]);
    if (error) {
      alert('Erro ao criar pelada');
      console.error(error);
    }
  }
  resetPeladaForm();
  loadPeladas();
});

// Preenche o formulário para edição de pelada
async function editPelada(id, dia) {
  peladaFormSection.classList.remove('hidden');
  let tableName;
  if (dia === 'Domingo') tableName = 'fut_domingo';
  else if (dia === 'Terça-Feira') tableName = 'fut_terca';
  else if (dia === 'Quinta-Feira') tableName = 'fut_quinta';
  
  const { data: pelada, error } = await supabaseClient
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    alert('Erro ao carregar pelada para edição');
    console.error(error);
    return;
  }
  document.getElementById('peladaId').value = pelada.id;
  // Seleciona o rádio correspondente ao dia (converte o tableName para valor de rádio)
  const radioValue = tableName === 'fut_domingo' ? 'dom' : tableName === 'fut_terca' ? 'ter' : 'quin';
  document.querySelector(`input[name="peladaDay"][value="${radioValue}"]`).checked = true;
  document.getElementById('inputDataPelada').value = pelada.data_pelada;
  document.getElementById('inputHoraPelada').value = pelada.hora.slice(0,5);
  peladaFormTitle.textContent = 'Editar Pelada';
}

// Deleta uma pelada
async function deletePelada(id, dia) {
  if (!confirm('Tem certeza que deseja deletar esta pelada?')) return;
  let tableName;
  if (dia === 'Domingo') tableName = 'fut_domingo';
  else if (dia === 'Terça-Feira') tableName = 'fut_terca';
  else if (dia === 'Quinta-Feira') tableName = 'fut_quinta';
  
  const { error } = await supabaseClient
    .from(tableName)
    .delete()
    .match({ id });
  if (error) {
    alert('Erro ao deletar pelada');
    console.error(error);
    return;
  }
  loadPeladas();
}
