import axios from 'axios';

// En production (Vercel), VITE_API_URL pointe vers le bot Railway.
// En développement local, le proxy Vite redirige /api vers localhost:3001.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

/**
 * Récupère le classement (weekly ou alltime).
 */
export async function fetchLeaderboard(type = 'weekly', limit = 20) {
  const { data } = await api.get('/leaderboard', { params: { type, limit } });
  return data;
}

/**
 * Récupère les stats complètes d'un membre.
 */
export async function fetchMember(userId) {
  const { data } = await api.get(`/member/${userId}`);
  return data;
}

/**
 * Récupère le rang et la barre de progression d'un membre.
 */
export async function fetchMemberRank(userId) {
  const { data } = await api.get(`/member/${userId}/rank`);
  return data;
}

/**
 * Récupère les stats globales du serveur.
 */
export async function fetchOverview() {
  const { data } = await api.get('/overview');
  return data;
}

/**
 * Récupère l'historique des rapports hebdomadaires.
 */
export async function fetchHistory(weeks = 4) {
  const { data } = await api.get('/history', { params: { weeks } });
  return data;
}
