// js/peladas.js
import { supabaseClient } from './index.js';
import { showCardsView } from './index.js';

export function init() {
  const cardPelada = document.getElementById('cardPelada');
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
  
  // Variáveis de filtro locais
  let peladaFilterDom = false, peladaFilterTer = false, peladaFilterQuin = false;
  
  // Configura os listeners
  cardPelada.addEventListener('click', showPeladaView);
  backPeladaBtn.addEventListener('click', showCardsView);
  
  function showPeladaView() {
    document.getElementById('cardsView').classList.add('hidden');
    document.getElementById('peladaView').classList.remove('hidden');
    loadPeladas();
  }
  
  togglePeladaFormBtn.addEventListener('click', () => {
    peladaFormSection.classList.toggle('hidden');
    if (!peladaFormSection.classList.contains('hidden')) {
      peladaFormTitle.textContent = 'Nova Pelada';
    }
  });
  
  const cancelPeladaForm = document.getElementById('cancelPeladaForm');
  cancelPeladaForm.addEventListener('click', resetPeladaForm);
  function resetPeladaForm() {
    inputPeladaId.value = '';
    peladaForm.reset();
    peladaFormTitle.textContent = 'Nova Pelada';
  }
  
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
  
  async function loadPeladas() {
    let results = [];
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
  
  window.editPelada = editPelada;
  window.deletePelada = deletePelada;
}
