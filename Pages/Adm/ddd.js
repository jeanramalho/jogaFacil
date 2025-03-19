// =====================================================
// SUPABASE CONFIGURATION
// =====================================================
const SUPABASE_URL = "https://kmunojpmxnrepmzgxqmo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdW5vanBteG5yZXBtemd4cW1vIiwicm9sI6ImFub24iLCJpYXQiOjE3NDIxMzExOTksImV4cCI6MjA1NzcwNzE5OX0.pXDLJnT4Pgf1eZrThAe_7XpPQ6w5wTYFX_jbb2SltwA";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// COMMON: DOM ELEMENTS & MAIN VIEWS
// =====================================================
// Botão e Sidebar
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');

// Views principais
const cardsView = document.getElementById('cardsView');
const managementView = document.getElementById('managementView');      // Jogadores
const peladaView = document.getElementById('peladaView');              // Peladas
const championshipView = document.getElementById('championshipView');  // Campeonato (criação/lista)
const championshipDetailView = document.getElementById('championshipDetailView'); // Detalhes do campeonato (editar times)

// Global variable for championship selected (definida ao abrir detalhe)
let campeonatoSelecionadoId = null;

// Função para voltar para a view de cards
function showCardsView() {
  managementView.classList.add('hidden');
  peladaView.classList.add('hidden');
  championshipView.classList.add('hidden');
  if (championshipDetailView) championshipDetailView.classList.add('hidden');
  cardsView.classList.remove('hidden');
}

// =====================================================
// SIDEBAR FUNCTIONALITY
// =====================================================
function toggleSidebar() {
  sidebar.classList.toggle('-translate-x-full');
}
hamburgerBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    sidebar.classList.add('-translate-x-full');
  }
});

// =====================================================
// MODULE: JOGADORES (CRUD)
// =====================================================
// Seleção de elementos para jogadores
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
// Inputs do formulário de jogadores
const inputPlayerId = document.getElementById('playerId');
const inputJogador = document.getElementById('inputJogador');
const inputUsername = document.getElementById('inputUsername');
const inputCell = document.getElementById('inputCell');
const inputAdm = document.getElementById('inputAdm');
const inputTerca = document.getElementById('inputTerca');
const inputQuinta = document.getElementById('inputQuinta');
const inputDomingo = document.getElementById('inputDomingo');
// Filtros de jogadores
let filterTer = false, filterQuin = false, filterDom = false;

function showManagementView() {
  cardsView.classList.add('hidden');
  managementView.classList.remove('hidden');
  loadPlayers();
}
cardPlayers.addEventListener('click', showManagementView);
backBtn.addEventListener('click', showCardsView);

toggleFormBtn.addEventListener('click', () => {
  formSection.classList.toggle('hidden');
  if (!formSection.classList.contains('hidden')) {
    formTitle.textContent = 'Novo Jogador';
  }
});
filterTerBtn.addEventListener('click', () => { filterTer = !filterTer; filterTerBtn.classList.toggle('bg-blue-600', filterTer); loadPlayers(); });
filterQuinBtn.addEventListener('click', () => { filterQuin = !filterQuin; filterQuinBtn.classList.toggle('bg-blue-600', filterQuin); loadPlayers(); });
filterDomBtn.addEventListener('click', () => { filterDom = !filterDom; filterDomBtn.classList.toggle('bg-blue-600', filterDom); loadPlayers(); });
searchInput.addEventListener('input', loadPlayers);

async function loadPlayers() {
  const search = searchInput.value.trim().toLowerCase();
  const { data: players, error } = await supabaseClient.from('jogadores').select('*').order('id', { ascending: true });
  if (error) { console.error('Erro ao carregar jogadores:', error); return; }
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
    const { error } = await supabaseClient.from('jogadores').update({ jogador, username, cell, adm, fut_terca, fut_quinta, fut_domingo }).match({ id });
    if (error) { alert('Erro ao atualizar jogador'); console.error(error); }
  } else {
    const { error } = await supabaseClient.from('jogadores').insert([{ jogador, username, cell, adm, fut_terca, fut_quinta, fut_domingo }]);
    if (error) { alert('Erro ao criar jogador'); console.error(error); }
  }
  resetForm();
  loadPlayers();
});

async function editPlayer(id) {
  formSection.classList.remove('hidden');
  const { data: player, error } = await supabaseClient.from('jogadores').select('*').eq('id', id).single();
  if (error) { alert('Erro ao carregar jogador para edição'); console.error(error); return; }
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

async function deletePlayer(id) {
  if (!confirm('Tem certeza que deseja deletar este jogador?')) return;
  const { error } = await supabaseClient.from('jogadores').delete().match({ id });
  if (error) { alert('Erro ao deletar jogador'); console.error(error); return; }
  loadPlayers();
}

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
searchInput.addEventListener('input', loadPlayers);

// =====================================================
// MODULE: Atualizar Sidebar (Usuário)
// =====================================================
function updateSidebarUser() {
  const currentUser = window.currentUser || {};
  const userNameSidebar = document.getElementById('userNameSidebar');
  const userAvatarSidebar = document.getElementById('userAvatarSidebar');
  const admOptionSidebar = document.getElementById('admOption');
  if (currentUser.jogador) { userNameSidebar.textContent = currentUser.jogador; }
  if (currentUser.email) { const gravatarUrl = `https://www.gravatar.com/avatar/${md5(currentUser.email.trim().toLowerCase())}?d=mp`; userAvatarSidebar.src = gravatarUrl; }
  if (currentUser.adm) { admOptionSidebar.classList.remove('hidden'); }
}
updateSidebarUser();
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
userMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); userDropdown.classList.toggle('hidden'); });
document.addEventListener('click', () => { userDropdown.classList.add('hidden'); });
const logoutOption = document.getElementById('logoutOption');
logoutOption.addEventListener('click', () => { localStorage.removeItem('user'); window.location.href = '../../index.html'; });

// =====================================================
// MODULE: PELADAS
// =====================================================
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
let peladaFilterDom = false, peladaFilterTer = false, peladaFilterQuin = false;
cardPelada.addEventListener('click', showPeladaView);
backPeladaBtn.addEventListener('click', showCardsView);
function showPeladaView() {
  cardsView.classList.add('hidden');
  peladaView.classList.remove('hidden');
  loadPeladas();
}
togglePeladaFormBtn.addEventListener('click', () => {
  peladaFormSection.classList.toggle('hidden');
  if (!peladaFormSection.classList.contains('hidden')) { peladaFormTitle.textContent = 'Nova Pelada'; }
});
const cancelPeladaForm = document.getElementById('cancelPeladaForm');
cancelPeladaForm.addEventListener('click', resetPeladaForm);
function resetPeladaForm() {
  inputPeladaId.value = '';
  peladaForm.reset();
  peladaFormTitle.textContent = 'Nova Pelada';
}
filterDomPelada.addEventListener('click', () => { peladaFilterDom = !peladaFilterDom; filterDomPelada.classList.toggle('bg-blue-600', peladaFilterDom); loadPeladas(); });
filterTerPelada.addEventListener('click', () => { peladaFilterTer = !peladaFilterTer; filterTerPelada.classList.toggle('bg-blue-600', peladaFilterTer); loadPeladas(); });
filterQuinPelada.addEventListener('click', () => { peladaFilterQuin = !peladaFilterQuin; filterQuinPelada.classList.toggle('bg-blue-600', peladaFilterQuin); loadPeladas(); });
async function loadPeladas() {
  let results = [];
  async function loadFromTable(tableName, diaLabel) {
    const { data, error } = await supabaseClient.from(tableName).select('*');
    if (!error && data) { data.forEach(record => record.dia = diaLabel); return data; } else { console.error('Erro ao carregar', tableName, error); return []; }
  }
  if (peladaFilterDom || peladaFilterTer || peladaFilterQuin) {
    if (peladaFilterDom) results = results.concat(await loadFromTable('fut_domingo', 'Domingo'));
    if (peladaFilterTer) results = results.concat(await loadFromTable('fut_terca', 'Terça-Feira'));
    if (peladaFilterQuin) results = results.concat(await loadFromTable('fut_quinta', 'Quinta-Feira'));
  } else {
    results = results.concat(await loadFromTable('fut_domingo', 'Domingo'));
    results = results.concat(await loadFromTable('fut_terca', 'Terça-Feira'));
    results = results.concat(await loadFromTable('fut_quinta', 'Quinta-Feira'));
  }
  results.sort((a, b) => new Date(a.data_pelada) - new Date(b.data_pelada));
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
peladaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const peladaDay = document.querySelector('input[name="peladaDay"]:checked').value;
  const dataPelada = document.getElementById('inputDataPelada').value;
  const horaPelada = document.getElementById('inputHoraPelada').value;
  let tableName;
  if (peladaDay === 'dom') tableName = 'fut_domingo';
  else if (peladaDay === 'ter') tableName = 'fut_terca';
  else if (peladaDay === 'quin') tableName = 'fut_quinta';
  if (document.getElementById('peladaId').value) {
    const id = parseInt(document.getElementById('peladaId').value);
    const { error } = await supabaseClient.from(tableName).update({ data_pelada: dataPelada, hora: horaPelada }).match({ id });
    if (error) { alert('Erro ao atualizar pelada'); console.error(error); }
  } else {
    const { error } = await supabaseClient.from(tableName).insert([{ data_pelada: dataPelada, hora: horaPelada }]);
    if (error) { alert('Erro ao criar pelada'); console.error(error); }
  }
  resetPeladaForm();
  loadPeladas();
});
async function editPelada(id, dia) {
  peladaFormSection.classList.remove('hidden');
  let tableName;
  if (dia === 'Domingo') tableName = 'fut_domingo';
  else if (dia === 'Terça-Feira') tableName = 'fut_terca';
  else if (dia === 'Quinta-Feira') tableName = 'fut_quinta';
  const { data: pelada, error } = await supabaseClient.from(tableName).select('*').eq('id', id).single();
  if (error) { alert('Erro ao carregar pelada para edição'); console.error(error); return; }
  document.getElementById('peladaId').value = pelada.id;
  const radioValue = tableName === 'fut_domingo' ? 'dom' : tableName === 'fut_terca' ? 'ter' : 'quin';
  document.querySelector(`input[name="peladaDay"][value="${radioValue}"]`).checked = true;
  document.getElementById('inputDataPelada').value = pelada.data_pelada;
  document.getElementById('inputHoraPelada').value = pelada.hora.slice(0,5);
  peladaFormTitle.textContent = 'Editar Pelada';
}
async function deletePelada(id, dia) {
  if (!confirm('Tem certeza que deseja deletar esta pelada?')) return;
  let tableName;
  if (dia === 'Domingo') tableName = 'fut_domingo';
  else if (dia === 'Terça-Feira') tableName = 'fut_terca';
  else if (dia === 'Quinta-Feira') tableName = 'fut_quinta';
  const { error } = await supabaseClient.from(tableName).delete().match({ id });
  if (error) { alert('Erro ao deletar pelada'); console.error(error); return; }
  loadPeladas();
}
async function cleanupOldPeladas() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 2);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const tables = ['fut_domingo', 'fut_terca', 'fut_quinta'];
  for (const table of tables) {
    const { error } = await supabaseClient.from(table).delete().lt('data_pelada', cutoffStr);
    if (error) { console.error(`Erro ao apagar registros antigos da tabela ${table}:`, error); }
  }
}
cleanupOldPeladas();

// =====================================================
// MODULE: Campeonato (Criar e Listar)
// =====================================================
const cardChampionship = document.getElementById('cardChampionship');
const backChampBtn = document.getElementById('backChampBtn');
const toggleChampFormBtn = document.getElementById('toggleChampFormBtn');
const champFormSection = document.getElementById('champFormSection');
const champFormTitle = document.getElementById('champFormTitle');
const champForm = document.getElementById('champForm');
const inputChampName = document.getElementById('inputChampName');
const inputNumTeams = document.getElementById('inputNumTeams');
const teamsContainer = document.getElementById('teamsContainer');
const championshipListContainer = document.getElementById('championshipListContainer');

cardChampionship.addEventListener('click', () => {
  cardsView.classList.add('hidden');
  championshipView.classList.remove('hidden');
  loadChampionships();
});
backChampBtn.addEventListener('click', () => {
  championshipView.classList.add('hidden');
  cardsView.classList.remove('hidden');
});
toggleChampFormBtn.addEventListener('click', () => {
  champFormSection.classList.toggle('hidden');
  if (!champFormSection.classList.contains('hidden')) {
    champFormTitle.textContent = 'Novo Campeonato';
    teamsContainer.innerHTML = '';
  }
});
inputNumTeams.addEventListener('change', () => {
  const num = parseInt(inputNumTeams.value);
  teamsContainer.innerHTML = '';
  for (let i = 1; i <= num; i++) {
    const div = document.createElement('div');
    div.innerHTML = `<label class="block">Nome do Time ${i}</label>
                     <input type="text" class="w-full p-2 rounded bg-gray-700 teamName" required>`;
    teamsContainer.appendChild(div);
  }
});
champForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const champName = inputChampName.value.trim();
  const numTeams = parseInt(inputNumTeams.value);
  const teamInputs = document.querySelectorAll('.teamName');
  let teams = [];
  teamInputs.forEach(input => { teams.push(input.value.trim()); });
  const { data, error } = await supabaseClient
    .from('campeonatos')
    .insert([{ nome: champName, num_teams: numTeams, teams: teams, created_at: new Date().toISOString() }])
    .single();
  if (error) { alert('Erro ao criar campeonato'); console.error(error); return; }
  alert('Campeonato criado com sucesso!');
  loadChampionships();
  champFormSection.classList.add('hidden');
});
async function loadChampionships() {
  const { data: champs, error } = await supabaseClient
    .from('campeonatos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('Erro ao carregar campeonatos:', error); return; }
  championshipListContainer.innerHTML = '';
  champs.forEach(champ => {
    const div = document.createElement('div');
    div.className = "bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 mb-4";
    div.innerHTML = `
      <h3 class="text-lg font-semibold">${champ.nome}</h3>
      <p class="text-sm">Times: ${champ.teams.join(', ')}</p>
    `;
    div.addEventListener('click', () => { openChampionshipDetail(champ); });
    championshipListContainer.appendChild(div);
  });
}
function openChampionshipDetail(champ) {
  alert('Abrir detalhes do campeonato: ' + champ.nome);
  // Exibe a view de detalhes do campeonato para editar times
  if (championshipDetailView) {\n    championshipDetailView.classList.remove('hidden');\n    championshipView.classList.add('hidden');\n  }\n  window.currentChampionship = champ;\n  campeonatoSelecionadoId = champ.id;\n  loadTeamsForChampionshipDetail();\n}

// =====================================================
// MODULE: Detalhes do Campeonato – Editar Times
// =====================================================
// OBS: Certifique-se de que os seguintes elementos existem no HTML da view de detalhes do campeonato:
// - Botão com id="editTeamsBtnChamp"
// - Container para os times com id="teamsContainerChamp"
// - Seção de busca e filtros com id="playerSearchSectionChamp"
// - Input de busca com id="playerSearchChamp"
// - Botões de filtro com ids "filterTerBtnChamp", "filterQuinBtnChamp", "filterDomBtnChamp"
// - Container para listar jogadores disponíveis com id="playersListContainerChamp"
// - Botão para finalizar edição com id="finalizeTeamsBtnChamp"

const editTeamsBtnChamp = document.getElementById('editTeamsBtnChamp');
const teamsContainerChamp = document.getElementById('teamsContainerChamp');
const playerSearchSectionChamp = document.getElementById('playerSearchSectionChamp');
const playerSearchChamp = document.getElementById('playerSearchChamp');
const filterTerBtnChamp = document.getElementById('filterTerBtnChamp');
const filterQuinBtnChamp = document.getElementById('filterQuinBtnChamp');
const filterDomBtnChamp = document.getElementById('filterDomBtnChamp');
const playersListContainerChamp = document.getElementById('playersListContainerChamp');
const finalizeTeamsBtnChamp = document.getElementById('finalizeTeamsBtnChamp');

// Variáveis para os filtros de jogadores no módulo de campeonato
let champFilterTer = false, champFilterQuin = false, champFilterDom = false;

editTeamsBtnChamp.addEventListener('click', () => {
  loadTeamsForChampionshipDetail();
  playerSearchSectionChamp.classList.remove('hidden');
});

async function loadTeamsForChampionshipDetail() {
  if (!campeonatoSelecionadoId) return;
  const { data: teams, error } = await supabaseClient.from('times').select('*').eq('campeonato_id', campeonatoSelecionadoId);
  if (error) { console.error('Erro ao carregar times do campeonato:', error); return; }
  teamsContainerChamp.innerHTML = '';
  teams.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.className = "bg-gray-700 p-4 rounded mb-4";
    teamDiv.innerHTML = `
      <h3 class="text-lg font-semibold">${team.nome}</h3>
      <div id="teamPlayersChamp-${team.id}" class="mb-2">Jogadores: ${team.players ? team.players.join(', ') : 'Nenhum'}</div>
      <button class="bg-blue-600 px-2 py-1 rounded text-sm" onclick="openAddPlayerModalChamp(${team.id})">Adicionar Jogador</button>
    `;
    teamsContainerChamp.appendChild(teamDiv);
  });
}

function openAddPlayerModalChamp(teamId) {
  window.currentTeamIdChamp = teamId;
  loadAvailablePlayersChamp(teamId);
  playersListContainerChamp.classList.remove('hidden');
}

async function loadAvailablePlayersChamp(teamId) {
  const { data: jogadores, error } = await supabaseClient.from('jogadores').select('*');
  if (error) { console.error('Erro ao carregar jogadores:', error); return; }
  let filtered = jogadores.filter(j =>
    j.jogador.toLowerCase().includes(playerSearchChamp.value.trim().toLowerCase()) ||
    j.cell.includes(playerSearchChamp.value.trim())
  );
  if (champFilterTer || champFilterQuin || champFilterDom) {
    filtered = filtered.filter(j => {
      return (champFilterTer ? j.fut_terca : false) ||
             (champFilterQuin ? j.fut_quinta : false) ||
             (champFilterDom ? j.fut_domingo : false);
    });
  }
  const { data: jogadoresTimes, error: errorJT } = await supabaseClient.from('jogadores_times').select('jogador_id').eq('campeonato_id', campeonatoSelecionadoId);
  if (errorJT) { console.error('Erro ao carregar jogadores_times:', errorJT); return; }
  const assignedIds = jogadoresTimes.map(jt => jt.jogador_id);
  filtered = filtered.filter(j => !assignedIds.includes(j.id));
  
  playersListContainerChamp.innerHTML = '';
  filtered.forEach(j => {
    const div = document.createElement('div');
    div.className = "bg-gray-800 p-2 rounded mb-2 flex justify-between items-center";
    div.innerHTML = `<span>${j.jogador} (${j.cell})</span>
                     <button class="bg-green-600 px-2 py-1 rounded text-xs" onclick="addPlayerToTeamChamp(${j.id}, ${teamId})">Adicionar</button>`;
    playersListContainerChamp.appendChild(div);
  });
}

async function addPlayerToTeamChamp(jogadorId, teamId) {
  const { error } = await supabaseClient.from('jogadores_times').insert([{ campeonato_id: campeonatoSelecionadoId, time_id: teamId, jogador_id: jogadorId }]);
  if (error) { alert('Erro ao adicionar jogador ao time'); console.error(error); } else {\n    alert('Jogador adicionado com sucesso');\n    loadTeamsForChampionshipDetail();\n    playersListContainerChamp.innerHTML = '';\n  }\n}

filterTerBtnChamp.addEventListener('click', () => {\n  champFilterTer = !champFilterTer;\n  filterTerBtnChamp.classList.toggle('bg-blue-600', champFilterTer);\n  if (window.currentTeamIdChamp) loadAvailablePlayersChamp(window.currentTeamIdChamp);\n});
filterQuinBtnChamp.addEventListener('click', () => {\n  champFilterQuin = !champFilterQuin;\n  filterQuinBtnChamp.classList.toggle('bg-blue-600', champFilterQuin);\n  if (window.currentTeamIdChamp) loadAvailablePlayersChamp(window.currentTeamIdChamp);\n});
filterDomBtnChamp.addEventListener('click', () => {\n  champFilterDom = !champFilterDom;\n  filterDomBtnChamp.classList.toggle('bg-blue-600', champFilterDom);\n  if (window.currentTeamIdChamp) loadAvailablePlayersChamp(window.currentTeamIdChamp);\n});
playerSearchChamp.addEventListener('input', () => {\n  if (window.currentTeamIdChamp) loadAvailablePlayersChamp(window.currentTeamIdChamp);\n});

finalizeTeamsBtnChamp.addEventListener('click', async () => {\n  alert('Edição de times finalizada e alterações salvas!');\n  playersListContainerChamp.innerHTML = '';\n});

function obterCampeonatoSelecionado() {\n  return 1;\n}
