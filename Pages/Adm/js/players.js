// js/players.js
import { supabaseClient } from './index.js';
import { showCardsView } from './index.js';

export function init() {
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

  let filterTer = false, filterQuin = false, filterDom = false;

  cardPlayers.addEventListener('click', () => {
    document.getElementById('cardsView').classList.add('hidden');
    document.getElementById('managementView').classList.remove('hidden');
    loadPlayers();
  });
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

  window.editPlayer = editPlayer;
  window.deletePlayer = deletePlayer;
}
