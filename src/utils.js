const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.resolve(__dirname, '../.item_cache.json');
const CHAMPION_CACHE_FILE = path.resolve(__dirname, '../.champion_cache.json');
const SPELL_CACHE_FILE = path.resolve(__dirname, '../.spell_cache.json');
const RUNE_CACHE_FILE = path.resolve(__dirname, '../.rune_cache.json');
const QUEUE_CACHE_FILE = path.resolve(__dirname, '../.queue_cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getLatestVersion = async () => {
    const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    return versionsResponse.data[0];
};

const getChampionData = async () => {
  if (fs.existsSync(CHAMPION_CACHE_FILE)) {
    const stats = fs.statSync(CHAMPION_CACHE_FILE);
    if (new Date() - new Date(stats.mtime) < CACHE_DURATION) {
      return JSON.parse(fs.readFileSync(CHAMPION_CACHE_FILE, 'utf-8'));
    }
  }
  const latestVersion = await getLatestVersion();
  const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
  fs.writeFileSync(CHAMPION_CACHE_FILE, JSON.stringify(response.data));
  return response.data;
};

const getSummonerSpellData = async () => {
    if (fs.existsSync(SPELL_CACHE_FILE)) {
        const stats = fs.statSync(SPELL_CACHE_FILE);
        if (new Date() - new Date(stats.mtime) < CACHE_DURATION) {
            return JSON.parse(fs.readFileSync(SPELL_CACHE_FILE, 'utf-8'));
        }
    }
    const latestVersion = await getLatestVersion();
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/summoner.json`);
    fs.writeFileSync(SPELL_CACHE_FILE, JSON.stringify(response.data));
    return response.data;
};

const getRuneData = async () => {
    if (fs.existsSync(RUNE_CACHE_FILE)) {
        const stats = fs.statSync(RUNE_CACHE_FILE);
        if (new Date() - new Date(stats.mtime) < CACHE_DURATION) {
            return JSON.parse(fs.readFileSync(RUNE_CACHE_FILE, 'utf-8'));
        }
    }
    const latestVersion = await getLatestVersion();
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/runesReforged.json`);
    fs.writeFileSync(RUNE_CACHE_FILE, JSON.stringify(response.data));
    return response.data;
};

const getQueueData = async () => {
    if (fs.existsSync(QUEUE_CACHE_FILE)) {
        const stats = fs.statSync(QUEUE_CACHE_FILE);
        if (new Date() - new Date(stats.mtime) < CACHE_DURATION) {
            return JSON.parse(fs.readFileSync(QUEUE_CACHE_FILE, 'utf-8'));
        }
    }
    const response = await axios.get('https://static.developer.riotgames.com/docs/lol/queues.json');
    fs.writeFileSync(QUEUE_CACHE_FILE, JSON.stringify(response.data));
    return response.data;
};

const getItemData = async () => {
  if (fs.existsSync(CACHE_FILE)) {
    const stats = fs.statSync(CACHE_FILE);
    const lastModified = new Date(stats.mtime);
    if (new Date() - lastModified < CACHE_DURATION) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  }

  const latestVersion = await getLatestVersion();
  const itemResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/item.json`);
  const itemData = itemResponse.data;

  fs.writeFileSync(CACHE_FILE, JSON.stringify(itemData));

  return itemData;
};

module.exports = {
  getItemData,
  getChampionData,
  getSummonerSpellData,
  getRuneData,
  getQueueData,
};
