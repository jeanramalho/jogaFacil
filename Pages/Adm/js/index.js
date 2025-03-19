// js/index.js
import * as players from './players.js';
import * as peladas from './peladas.js';
import * as championships from './championships.js';
import * as champDetail from './championshipDetail.js';

// Inicialização do Supabase – exporte para os módulos
export const SUPABASE_URL = "https://kmunojpmxnrepmzgxqmo.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdW5vanBteG5yZXBtemd4cW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzExOTksImV4cCI6MjA1NzcwNzE5OX0.pXDLJnT4Pgf1eZrThAe_7XpPQ6w5wTYFX_jbb2SltwA";
export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função comum para voltar à view principal
export function showCardsView() {
    document.getElementById('managementView').classList.add('hidden');
    document.getElementById('peladaView').classList.add('hidden');
    document.getElementById('championshipView').classList.add('hidden');
    if (document.getElementById('championshipDetailView')) {
        document.getElementById('championshipDetailView').classList.add('hidden');
    }
    document.getElementById('cardsView').classList.remove('hidden');
}

// Inicializa os módulos
document.addEventListener('DOMContentLoaded', () => {
    players.init();
    peladas.init();
    championships.init();
    champDetail.init();
});

