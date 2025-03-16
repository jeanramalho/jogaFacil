// Configuração do Supabase
const SUPABASE_URL = "https://kmunojpmxnrepmzgxqmo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdW5vanBteG5yZXBtemd4cW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzExOTksImV4cCI6MjA1NzcwNzE5OX0.pXDLJnT4Pgf1eZrThAe_7XpPQ6w5wTYFX_jbb2SltwA";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do DOM
const managePlayers = document.getElementById("managePlayers");
const playerModal = document.getElementById("playerModal");
const closeModal = document.getElementById("closeModal");
const playerList = document.getElementById("playerList");
const addPlayerBtn = document.getElementById("addPlayerBtn");

// Abrir modal ao clicar no card
managePlayers.addEventListener("click", async () => {
    await loadPlayers();
    playerModal.classList.remove("hidden");
});

// Fechar modal
closeModal.addEventListener("click", () => {
    playerModal.classList.add("hidden");
});

// Carregar jogadores do Supabase
async function loadPlayers() {
    const { data: players, error } = await supabase.from("jogadores").select("*");
    if (error) {
        console.error("Erro ao buscar jogadores:", error);
        return;
    }
    playerList.innerHTML = "";
    players.forEach(player => {
        const listItem = document.createElement("li");
        listItem.className = "flex justify-between items-center p-2 bg-gray-800 rounded";
        listItem.innerHTML = `
            <span>${player.jogador} - ${player.cell}</span>
            <div>
                <button onclick="editPlayer(${player.id})" class="text-yellow-400 px-2">Editar</button>
                <button onclick="deletePlayer(${player.id})" class="text-red-400 px-2">Deletar</button>
            </div>
        `;
        playerList.appendChild(listItem);
    });
}

// Criar jogador
addPlayerBtn.addEventListener("click", async () => {
    const jogador = prompt("Nome do jogador:");
    const username = prompt("Nome de usuário:");
    const cell = prompt("Telefone:");
    const adm = confirm("O jogador é administrador?");
    const fut_terca = confirm("Participa da Pelada de Terça?");
    const fut_quinta = confirm("Participa da Pelada de Quinta?");
    const fut_domingo = confirm("Participa da Pelada de Domingo?");
    
    const { error } = await supabase.from("jogadores").insert([
        { jogador, username, cell, adm, fut_terca, fut_quinta, fut_domingo }
    ]);
    
    if (error) {
        alert("Erro ao criar jogador");
    } else {
        await loadPlayers();
    }
});

// Editar jogador
async function editPlayer(id) {
    const jogador = prompt("Novo nome do jogador:");
    const username = prompt("Novo nome de usuário:");
    const cell = prompt("Novo telefone:");
    const adm = confirm("O jogador é administrador?");
    const fut_terca = confirm("Participa da Pelada de Terça?");
    const fut_quinta = confirm("Participa da Pelada de Quinta?");
    const fut_domingo = confirm("Participa da Pelada de Domingo?");
    
    const { error } = await supabase.from("jogadores").update({
        jogador, username, cell, adm, fut_terca, fut_quinta, fut_domingo
    }).match({ id });
    
    if (error) {
        alert("Erro ao atualizar jogador");
    } else {
        await loadPlayers();
    }
}

// Deletar jogador
async function deletePlayer(id) {
    if (!confirm("Tem certeza que deseja deletar este jogador?")) return;
    
    const { error } = await supabase.from("jogadores").delete().match({ id });
    
    if (error) {
        alert("Erro ao deletar jogador");
    } else {
        await loadPlayers();
    }
}