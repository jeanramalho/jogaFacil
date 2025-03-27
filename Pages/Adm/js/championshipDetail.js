// js/championshipDetail.js
import { supabaseClient } from './index.js';
import { showCardsView } from './index.js';

export function init() {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("[ChampDetail] init() iniciado");

    const detailView = document.getElementById('championshipDetailView');
    if (!detailView) {
      console.warn("[ChampDetail] Elemento 'championshipDetailView' não encontrado.");
      return;
    } else {
      console.log("[ChampDetail] 'championshipDetailView' encontrado.");
    }
    
    // Seleciona os elementos necessários
    const editTeamsBtnChamp = document.getElementById('editTeamsBtnChamp');
    const teamsContainerChamp = document.getElementById('teamsContainerChamp');
    const playerSearchSectionChamp = document.getElementById('playerSearchSectionChamp');
    const playerSearchChamp = document.getElementById('playerSearchChamp');
    const filterTerBtnChamp = document.getElementById('filterTerBtnChamp');
    const filterQuinBtnChamp = document.getElementById('filterQuinBtnChamp');
    const filterDomBtnChamp = document.getElementById('filterDomBtnChamp');
    const playersListContainerChamp = document.getElementById('playersListContainerChamp');
    const finalizeTeamsBtnChamp = document.getElementById('finalizeTeamsBtnChamp');

    // Verifica se todos os elementos essenciais foram encontrados
    if (!editTeamsBtnChamp || !teamsContainerChamp || !playerSearchSectionChamp ||
        !playerSearchChamp || !filterTerBtnChamp || !filterQuinBtnChamp ||
        !filterDomBtnChamp || !playersListContainerChamp || !finalizeTeamsBtnChamp) {
      console.error("[ChampDetail] ERRO: Falta algum elemento essencial. Verifique os IDs no HTML.");
      return;
    }
    console.log("[ChampDetail] Todos os elementos essenciais encontrados.");

    let champFilterTer = false, champFilterQuin = false, champFilterDom = false;

    // Listener para o botão "Editar Times"
    editTeamsBtnChamp.addEventListener('click', () => {
      console.log("[ChampDetail] Botão 'Editar Times' clicado");
      loadTeamsForChampionshipDetail();
      playerSearchSectionChamp.classList.remove('hidden');
    });

    // Função para carregar os times do campeonato selecionado
    async function loadTeamsForChampionshipDetail() {
      console.log("[ChampDetail] Carregando times...");
      if (!window.campeonatoSelecionadoId) {
        console.warn("[ChampDetail] window.campeonatoSelecionadoId não está definido.");
        return;
      }
      const { data: teams, error } = await supabaseClient
        .from('times')
        .select('*')
        .eq('campeonato_id', window.campeonatoSelecionadoId);
      if (error) {
        console.error("[ChampDetail] Erro ao carregar times:", error);
        return;
      }
      let teamsToShow = teams;
      if (!teamsToShow || teamsToShow.length === 0) {
        console.warn("[ChampDetail] Tabela 'times' vazia. Utilizando times do objeto do campeonato (fallback).");
        // Se não há dados na tabela "times", use o array "teams" do objeto do campeonato
        if (window.currentChampionship && window.currentChampionship.teams) {
          teamsToShow = window.currentChampionship.teams.map((nome, index) => {
            return { id: index + 1, nome: nome, players: [] };
          });
        } else {
          console.warn("[ChampDetail] Nenhum time disponível para fallback.");
          teamsToShow = [];
        }
      }
      console.log("[ChampDetail] Times a exibir:", teamsToShow);
      teamsContainerChamp.innerHTML = '';
      teamsToShow.forEach(team => {
        const teamDiv = document.createElement('div');
        teamDiv.className = "bg-gray-700 p-4 rounded mb-4";
        teamDiv.innerHTML = `
          <h3 class="text-lg font-semibold">${team.nome}</h3>
          <div id="teamPlayersChamp-${team.id}" class="mb-2">Jogadores: ${team.players && team.players.length ? team.players.join(', ') : 'Nenhum'}</div>
          <button class="bg-blue-600 px-2 py-1 rounded text-sm" onclick="openAddPlayerModalChamp(${team.id})">Adicionar Jogador</button>
        `;
        teamsContainerChamp.appendChild(teamDiv);
      });
    }

    // Abre a área para adicionar jogadores a um time – função global para ser chamada via onclick
    function openAddPlayerModalChamp(teamId) {
      console.log("[ChampDetail] Abrindo modal para adicionar jogador ao time:", teamId);
      window.currentTeamIdChamp = teamId;
      loadAvailablePlayersChamp(teamId);
      playersListContainerChamp.classList.remove('hidden');
    }
    window.openAddPlayerModalChamp = openAddPlayerModalChamp;

    // Carrega os jogadores disponíveis para adicionar a um time
    async function loadAvailablePlayersChamp(teamId) {
      console.log("[ChampDetail] Carregando jogadores disponíveis para o time:", teamId);
      const { data: jogadores, error } = await supabaseClient.from('jogadores').select('*');
      if (error) {
        console.error("[ChampDetail] Erro ao carregar jogadores:", error);
        return;
      }
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
      const { data: jogadoresTimes, error: errorJT } = await supabaseClient.from('jogadores_times')
        .select('jogador_id')
        .eq('campeonato_id', window.campeonatoSelecionadoId);
      if (errorJT) {
        console.error("[ChampDetail] Erro ao carregar jogadores_times:", errorJT);
        return;
      }
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
      console.log("[ChampDetail] Jogadores disponíveis filtrados:", filtered);
    }
    window.addPlayerToTeamChamp = async function(jogadorId, teamId) {
      console.log("[ChampDetail] Adicionando jogador", jogadorId, "ao time", teamId);
      const { error } = await supabaseClient.from('jogadores_times').insert([{ campeonato_id: window.campeonatoSelecionadoId, time_id: teamId, jogador_id: jogadorId }]);
      if (error) {
        alert('Erro ao adicionar jogador ao time');
        console.error(error);
      } else {
        alert('Jogador adicionado com sucesso');
        loadTeamsForChampionshipDetail();
        playersListContainerChamp.innerHTML = '';
      }
    };

    filterTerBtnChamp.addEventListener('click', () => {
      champFilterTer = !champFilterTer;
      filterTerBtnChamp.classList.toggle('bg-blue-600', champFilterTer);
      if (window.currentTeamIdChamp) loadAvailablePlayersChamp(window.currentTeamIdChamp);
    });
    filterQuinBtnChamp.addEventListener('click', () => {
      champFilterQuin = !champFilterQuin;
      filterQuinBtnChamp.classList.toggle('bg-blue-600', champFilterQuin);
      if (window.currentTeamIdChamp) loadAvailablePlayersChamp(window.currentTeamIdChamp);
    });
    filterDomBtnChamp.addEventListener('click', () => {
      champFilterDom = !champFilterDom;
      filterDomBtnChamp.classList.toggle('bg-blue-600', champFilterDom);
      if (window.currentTeamIdChamp) loadAvailablePlayersChamp(window.currentTeamIdChamp);
    });
    playerSearchChamp.addEventListener('input', () => {
      if (window.currentTeamIdChamp) loadAvailablePlayersChamp(window.currentTeamIdChamp);
    });
    
    finalizeTeamsBtnChamp.addEventListener('click', async () => {
      alert('Edição de times finalizada e alterações salvas!');
      playersListContainerChamp.innerHTML = '';
    });
    
    console.log("[ChampDetail] Módulo championshipDetail inicializado com sucesso.");
  });
}
