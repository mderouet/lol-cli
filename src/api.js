const axios = require('axios');

const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!RIOT_API_KEY) {
    console.error('Error: RIOT_API_KEY is not set in the environment variables. Please create a .env file and add your Riot API key.');
    process.exit(1);
}

const api = axios.create();

api.interceptors.request.use((config) => {
  config.headers['X-Riot-Token'] = RIOT_API_KEY;
  return config;
});

const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    if (status === 403) {
      throw new Error('Forbidden: Invalid API Key or insufficient permissions.');
    }
    if (status === 404) {
      throw new Error('Not Found: The requested resource was not found.');
    }
    throw new Error(data.status ? data.status.message : 'An API error occurred.');
  } else {
    throw new Error('An unexpected error occurred.');
  }
};

const getRegionalPlatform = (region) => {
  const americas = ['NA1', 'BR1', 'LA1', 'LA2'];
  const asia = ['KR', 'JP1'];
  const europe = ['EUN1', 'EUW1', 'TR1', 'RU'];
  const sea = ['OC1'];

  if (americas.includes(region)) return 'americas';
  if (asia.includes(region)) return 'asia';
  if (europe.includes(region)) return 'europe';
  if (sea.includes(region)) return 'sea';
  return region;
};

const getSummonerByPuuid = async (region, puuid) => {
  try {
    const response = await api.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const getSummonerDataByRiotId = async (region, riotId) => {
  let gameName, tagLine;
  if (riotId.includes('#')) {
    [gameName, tagLine] = riotId.split('#');
  } else {
    throw new Error("Invalid Riot ID. Please use the format 'gameName#tagLine'.");
  }

  const accountRegion = getRegionalPlatform(region);
  const accountApiUrl = `https://${accountRegion}.api.riotgames.com`;

  let puuid;
  try {
    const response = await api.get(
      `${accountApiUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${tagLine}`
    );
    puuid = response.data.puuid;
  } catch (error) {
    handleApiError(error);
  }

  if (!puuid) {
    throw new Error('Could not retrieve PUUID for the given Riot ID.');
  }

  const summonerData = await getSummonerByPuuid(region, puuid);
  return { ...summonerData, name: gameName };
};


const getMatchHistory = async (region, puuid) => {
  try {
    const response = await api.get(
      `https://${getRegionalPlatform(region)}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const getMatchDetails = async (region, matchId) => {
  try {
    const response = await api.get(
      `https://${getRegionalPlatform(region)}.api.riotgames.com/lol/match/v5/matches/${matchId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const getMatchTimeline = async (region, matchId) => {
  try {
    const response = await api.get(
      `https://${getRegionalPlatform(region)}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const getRankedData = async (region, puuid) => {
    try {
        const response = await api.get(
            `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
        );
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

const getChampionMastery = async (region, puuid, championId) => {
    try {
        const response = await api.get(
            `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/by-champion/${championId}`
        );
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

const getLiveGame = async (region, encryptedPUUID) => {
    try {
        const response = await api.get(
            `https://${region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${encryptedPUUID}`
        );
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null; // Not in a game, return null instead of throwing
        }
        handleApiError(error); // For all other errors, use the handler
    }
};

module.exports = {
  getSummonerDataByRiotId,
  getMatchHistory,
  getMatchDetails,
  getMatchTimeline,
  getRankedData,
  getChampionMastery,
  getLiveGame,
};