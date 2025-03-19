// js/championshipDetail.js
import { supabaseClient } from './index.js';
import { showCardsView } from './index.js';

export function init() {
  const cardChampionship = document.getElementById('cardChampionship');
  const backChampionshipBtn = document.getElementById('backChampionshipBtn');
  const championshipView = document.getElementById('championshipView');
  const championshipFormSection = document.getElementById('championshipFormSection');
  const championshipForm = document.getElementById('championshipForm');
  const championshipFormTitle = document.getElementById('championshipFormTitle');
  const inputChampionshipId = document.getElementById('championshipId');
  const inputChampionshipName = document.getElementById('inputChampionshipName');
  const championshipTableBody = document.getElementById('championshipTableBody');
  
  cardChampionship.addEventListener('click', showChampionshipView);
  backChampionshipBtn.addEventListener('click', showCardsView);

  if (cardChampionship) {
    cardChampionship.addEventListener('click', showChampionshipView);
  } else {
    console.warn("Elemento 'cardChampionship' não encontrado.");
  }

  if (backChampionshipBtn) {
    backChampionshipBtn.addEventListener('click', showCardsView);
  } else {
    console.warn("Elemento 'backChampionshipBtn' não encontrado.");
  }
  
  function showChampionshipView() {
    document.getElementById('cardsView').classList.add('hidden');
    championshipView.classList.remove('hidden');
    loadChampionships();
  }

  document.getElementById('toggleChampionshipFormBtn').addEventListener('click', () => {
    championshipFormSection.classList.toggle('hidden');
    if (!championshipFormSection.classList.contains('hidden')) {
      championshipFormTitle.textContent = 'Novo Campeonato';
    }
  });

  document.getElementById('cancelChampionshipForm').addEventListener('click', resetChampionshipForm);
  
  function resetChampionshipForm() {
    inputChampionshipId.value = '';
    championshipForm.reset();
    championshipFormTitle.textContent = 'Novo Campeonato';
  }
  
  async function loadChampionships() {
    const { data, error } = await supabaseClient.from('championships').select('*');
    if (error) {
      console.error('Erro ao carregar campeonatos:', error);
      return;
    }
    
    championshipTableBody.innerHTML = '';
    data.forEach(record => {
      const row = document.createElement('tr');
      row.classList.add('border-b', 'border-gray-700');
      row.innerHTML = `
        <td class="p-2">${record.name}</td>
        <td class="p-2 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
          <button class="bg-blue-600 px-2 py-1 rounded text-xs md:text-sm" onclick="editChampionship(${record.id})">Editar</button>
          <button class="bg-red-600 px-2 py-1 rounded text-xs md:text-sm" onclick="deleteChampionship(${record.id})">Deletar</button>
        </td>
      `;
      championshipTableBody.appendChild(row);
    });
  }
  
  championshipForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const championshipName = inputChampionshipName.value;
    const championshipId = inputChampionshipId.value;
    
    if (championshipId) {
      // Atualiza campeonato existente
      const { error } = await supabaseClient
        .from('championships')
        .update({ name: championshipName })
        .match({ id: championshipId });

      if (error) {
        alert('Erro ao atualizar campeonato');
        console.error(error);
        return;
      }
    } else {
      // Insere um novo campeonato
      const { error } = await supabaseClient
        .from('championships')
        .insert([{ name: championshipName }]);

      if (error) {
        alert('Erro ao criar campeonato');
        console.error(error);
        return;
      }
    }
    
    resetChampionshipForm();
    loadChampionships();
  });

  async function editChampionship(id) {
    championshipFormSection.classList.remove('hidden');
    
    const { data: championship, error } = await supabaseClient
      .from('championships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      alert('Erro ao carregar campeonato para edição');
      console.error(error);
      return;
    }
    
    inputChampionshipId.value = championship.id;
    inputChampionshipName.value = championship.name;
    championshipFormTitle.textContent = 'Editar Campeonato';
  }

  async function deleteChampionship(id) {
    if (!confirm('Tem certeza que deseja deletar este campeonato?')) return;
    
    const { error } = await supabaseClient
      .from('championships')
      .delete()
      .match({ id });

    if (error) {
      alert('Erro ao deletar campeonato');
      console.error(error);
      return;
    }

    loadChampionships();
  }

  // Expondo as funções para serem chamadas no HTML
  window.editChampionship = editChampionship;
  window.deleteChampionship = deleteChampionship;
}
