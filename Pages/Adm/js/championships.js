// js/championships.js
import { supabaseClient } from './index.js';
import { showCardsView } from './index.js';

export function init() {
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
    document.getElementById('cardsView').classList.add('hidden');
    document.getElementById('championshipView').classList.remove('hidden');
    loadChampionships();
  });
  backChampBtn.addEventListener('click', showCardsView);
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
    const { data, error } = await supabaseClient.from('campeonatos')
      .insert([{ nome: champName, num_teams: numTeams, teams: teams, created_at: new Date().toISOString() }])
      .single();
    if (error) { alert('Erro ao criar campeonato'); console.error(error); return; }
    alert('Campeonato criado com sucesso!');
    loadChampionships();
    champFormSection.classList.add('hidden');
  });
  async function loadChampionships() {
    const { data: champs, error } = await supabaseClient.from('campeonatos').select('*').order('created_at', { ascending: false });
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
  async function openChampionshipDetail(champ) {
    document.getElementById('championshipView').classList.add('hidden');
    document.getElementById('championshipDetailView').classList.remove('hidden');
    window.currentChampionship = champ;
    window.campeonatoSelecionadoId = champ.id;
    // Chama função do módulo de detalhes para carregar os times
    if (typeof window.loadTeamsForChampionshipDetail === 'function') {
      window.loadTeamsForChampionshipDetail();
    }
  }
  window.openChampionshipDetail = openChampionshipDetail;
}

export function initChampionships() {
  init();
}
