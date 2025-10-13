const blessed = require('blessed');
const { getRankedData, getChampionMastery, getLiveGame } = require('./api');
const { formatSummary, formatMatchDetails } = require('./ui');
const { getItemData, getChampionData, getSummonerSpellData, getRuneData, getQueueData } = require('./utils');
const { createMasteryScreen } = require('./masteryTui');
const { createTimelineScreen } = require('./timelineTui');

// Color scheme for consistency
const colors = {
  bg: '#282a36',
  fg: '#f8f8f2',
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
};

const rankToScore = (rank) => {
    const tiers = { 'IRON': 0, 'BRONZE': 1, 'SILVER': 2, 'GOLD': 3, 'PLATINUM': 4, 'EMERALD': 5, 'DIAMOND': 6, 'MASTER': 7, 'GRANDMASTER': 8, 'CHALLENGER': 9 };
    const divisions = { 'IV': 0, 'III': 1, 'II': 2, 'I': 3 };
    if (!rank || rank === 'Unranked') return 8; // Treat Unranked as Silver IV
    const [tier, division] = rank.split(' ');
    return (tiers[tier] || 0) * 4 + (divisions[division] || 0);
};

const scoreToRank = (score) => {
    if (score === 0) return 'Unranked';
    const tiers = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
    const divisions = ['IV', 'III', 'II', 'I'];
    const tierIndex = Math.floor(score / 4);
    const divisionIndex = Math.floor(score % 4);
    const tier = tiers[tierIndex] || 'Unknown';
    if (tierIndex >= 7) return tier; // Master+ has no division
    const division = divisions[divisionIndex] || '';
    return `${tier} ${division}`;
};

const colorizeRank = (rank) => {
    if (!rank) return `{white-fg}Unranked{/white-fg}`;
    const tier = rank.split(' ')[0];
    const rankColors = {
        'CHALLENGER': colors.yellow,
        'GRANDMASTER': colors.red,
        'MASTER': colors.pink,
        'DIAMOND': colors.cyan,
        'EMERALD': colors.green,
        'PLATINUM': '#8be9fd',
        'GOLD': colors.yellow,
        'SILVER': colors.fg,
        'BRONZE': '#cd7f32',
        'IRON': '#a9a9a9',
        'Unranked': colors.fg,
    };
    const color = rankColors[tier] || colors.fg;
    return `{${color}-fg}${rank}{/${color}-fg}`;
};

const createResultsScreen = async (summoner, matches, region) => {
  const itemData = await getItemData();
  const spellData = await getSummonerSpellData();
  const runeData = await getRuneData();
  const queueData = await getQueueData();
  const itemMap = itemData.data;
  const spellMap = new Map(Object.values(spellData.data).map(s => [s.key, s.name]));
  const runeMap = new Map();
  runeData.forEach(tree => {
      runeMap.set(tree.id, tree.name);
      tree.slots.forEach(slot => {
          slot.runes.forEach(rune => {
              runeMap.set(rune.id, rune.name);
          });
      });
  });
  const queueMap = new Map(queueData.map(q => [q.queueId, q.description]));


  const rankCache = {}; // Cache for player ranks and average rank

  return new Promise((resolve) => {
    const screen = blessed.screen({
      smartCSR: true,
      title: `Stats for ${summoner.name} [${region}]`,
      fullUnicode: true,
    });

    const layout = blessed.box({
        parent: screen,
        width: '100%',
        height: '100%',
        style: {
            bg: colors.bg,
            fg: colors.fg,
        },
    });

    blessed.text({
        parent: layout,
        top: 1,
        left: 'center',
        content: `Summoner: {bold}${summoner.name}{/bold} | Region: {bold}${region}{/bold}`,
        tags: true,
        style: {
            fg: colors.cyan,
        },
    });

    const summaryBox = blessed.box({
        parent: layout,
        width: '100%',
        height: 9,
        top: 3,
        left: 0,
        content: formatSummary(summoner, matches),
        tags: true,
        border: {
            type: 'line',
            fg: colors.purple,
        },
        style: {
            border: { fg: colors.purple }
        }
    });

    const liveGameBox = blessed.box({
        parent: layout,
        width: '30%',
        height: 9,
        top: 3,
        right: 0,
        label: ' Live Game ',
        tags: true,
        border: {
            type: 'line',
            fg: colors.purple,
        },
        style: {
            border: { fg: colors.purple }
        }
    });

    const checkLiveGame = async () => {
        const liveGameData = await getLiveGame(region, summoner.puuid);
        if (liveGameData) {
            const participant = liveGameData.participants.find(p => p.puuid === summoner.puuid);
            if (participant) {
                const championData = await getChampionData();
                const championMap = new Map(Object.values(championData.data).map(c => [c.key, c.name]));
                const championName = championMap.get(String(participant.championId)) || 'Unknown';
                
                const spell1 = spellMap.get(String(participant.spell1Id)) || 'N/A';
                const spell2 = spellMap.get(String(participant.spell2Id)) || 'N/A';

                const keystone = runeMap.get(participant.perks.perkIds[0]) || 'N/A';
                const secondaryTree = runeMap.get(participant.perks.perkSubStyle) || 'N/A';
                
                const queueName = queueMap.get(liveGameData.gameQueueConfigId) || 'Unknown Queue';

                const role = liveGameData.gameQueueConfigId === 1700 
                    ? 'Arena' 
                    : participant.teamPosition || participant.individualPosition || 'N/A';

                const updateGameTime = () => {
                    const startTime = new Date(liveGameData.gameStartTime);
                    const now = new Date();
                    const diff = now - startTime;
                    const minutes = Math.floor(diff / 60000);
                    const seconds = Math.floor((diff % 60000) / 1000);
                    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    const content = ` Queue: ${queueName}\n` +
                                  ` Champion: ${championName}\n` +
                                  ` Role: ${role}\n` +
                                  ` Time: ${formattedTime}\n` +
                                  ` Spells: ${spell1}, ${spell2}\n` +
                                  ` Keystone: ${keystone}\n` +
                                  ` Secondary: ${secondaryTree}`;

                    liveGameBox.setContent(content);
                    screen.render();
                };

                updateGameTime();
                const timer = setInterval(updateGameTime, 1000);

                screen.on('destroy', () => {
                    clearInterval(timer);
                });
            }
        }
        screen.render();
    };

    checkLiveGame();

    const matchList = blessed.list({
      parent: layout,
      width: '100%',
      top: 12,
      bottom: 1,
      items: [],
      border: {
        type: 'line',
        fg: colors.purple,
      },
      label: ' Match History (Select to expand) ',
      mouse: true,
      keys: true,
      vi: true,
      scrollable: true,
      tags: true,
      style: {
        border: { fg: colors.purple },
        selected: { bg: colors.pink, fg: colors.bg },
      },
    });

    const footer = blessed.box({
        parent: layout,
        width: '100%',
        height: 1,
        bottom: 0,
        left: 'center',
        content: 'b: Back | m: Mastery | t: Timeline | q: Quit',
        tags: true,
        style: {
            fg: colors.orange,
        },
    });

    const expanded = {};
    let listIndexMap = [];

    const updateList = () => {
        const items = [];
        listIndexMap = [];
        let isAnyExpanded = false;
        matches.forEach((match, index) => {
            const participant = match.details.info.participants.find(p => p.puuid === summoner.puuid);
            const role = (match.details.info.queueId === 1700 
                ? 'Arena' 
                : (participant.teamPosition || participant.individualPosition || '')).padEnd(10);
            const avgRank = rankCache[index] ? `Avg Rank: ${colorizeRank(rankCache[index].average)}`.padEnd(40) : ''.padEnd(40);
            const gameDate = new Date(match.details.info.gameCreation).toLocaleDateString().padEnd(12);
            let resultText;
            if (!participant.win && match.details.info.gameDuration < 300) {
                resultText = 'Remake';
            } else {
                resultText = participant.win ? 'Win' : 'Loss';
            }
            const paddedResult = resultText.padEnd(7);
            const championName = participant.championName.padEnd(16);
            const kda = `KDA: ${participant.kills}/${participant.deaths}/${participant.assists}`;
            let coloredResult;
            if (resultText === 'Win') {
                coloredResult = `{green-fg}${paddedResult}{/green-fg}`;
            } else if (resultText === 'Loss') {
                coloredResult = `{red-fg}${paddedResult}{/red-fg}`;
            } else {
                coloredResult = `{grey-fg}${paddedResult}{/grey-fg}`;
            }
            const summary = `${gameDate}${coloredResult} - ${championName}${role}${kda} ${avgRank}`;
            items.push(summary);
            listIndexMap.push(index);

            if (expanded[index]) {
                isAnyExpanded = true;
                const details = formatMatchDetails(match, summoner, itemMap, spellMap, runeMap, screen.width, rankCache[index].players);
                details.split('\n').forEach(line => {
                    items.push(line);
                    listIndexMap.push(null);
                });
            }
        });
        matchList.setItems(items);

        if (isAnyExpanded) {
            footer.setContent('b: Back | m: Mastery | t: Timeline | q: Quit');
        } else {
            footer.setContent('b: Back | m: Mastery | q: Quit');
        }
        screen.render();
    };

    matchList.on('select', async (item, index) => {
        const matchIndex = listIndexMap[index];
        if (matchIndex !== null) {
            const currentlySelected = matchList.selected;
            expanded[matchIndex] = !expanded[matchIndex];

            if (expanded[matchIndex] && !rankCache[matchIndex]) {
                const loading = blessed.box({ 
                    parent: screen, 
                    top: 'center', 
                    left: 'center', 
                    height: 1, 
                    width: 20, 
                    content: 'Loading ranks...',
                    style: {
                        bg: colors.bg,
                        fg: colors.yellow,
                    },
                });
                screen.render();

                const ranks = {};
                let totalScore = 0;
                const participants = matches[matchIndex].details.info.participants;
                const delay = ms => new Promise(res => setTimeout(res, ms));

                for (const p of participants) {
                    const rankData = await getRankedData(region, p.puuid);
                    const soloQueue = rankData.find(q => q.queueType === 'RANKED_SOLO_5x5');
                    const rankString = soloQueue ? `${soloQueue.tier} ${soloQueue.rank}` : 'Unranked';
                    ranks[p.puuid] = rankString;
                    totalScore += rankToScore(rankString);
                    await delay(100);
                }
                rankCache[matchIndex] = {
                    players: ranks,
                    average: scoreToRank(totalScore / participants.length),
                };
                loading.destroy();
            }

            updateList();
            matchList.select(currentlySelected);
        }
    });
    
    let modalOpen = false;
    
    screen.key('m', async () => {
        if (modalOpen) return;
        let matchIndex = null;
        for (let i = matchList.selected; i >= 0; i--) {
            if (listIndexMap[i] !== null) {
                matchIndex = listIndexMap[i];
                break;
            }
        }

        if (matchIndex !== null) {
            const match = matches[matchIndex];
            const participant = match.details.info.participants.find(p => p.puuid === summoner.puuid);
            
            const loading = blessed.box({ 
                parent: screen, 
                top: 'center', 
                left: 'center', 
                height: 1, 
                width: 20, 
                content: 'Loading mastery...',
                style: {
                    bg: colors.bg,
                    fg: colors.yellow,
                },
            });
            screen.render();

            const masteryData = await getChampionMastery(region, summoner.puuid, participant.championId);
            
            loading.destroy();
            
            modalOpen = true;
            await createMasteryScreen(screen, summoner, participant.championName, masteryData);
            modalOpen = false;
            matchList.focus();
        }
    });

    screen.key('t', async () => {
        if (modalOpen) return;
        let matchIndex = null;
        for (let i = matchList.selected; i >= 0; i--) {
            if (listIndexMap[i] !== null) {
                matchIndex = listIndexMap[i];
                break;
            }
        }

        if (matchIndex !== null && expanded[matchIndex]) {
            const match = matches[matchIndex];
            modalOpen = true;
            await createTimelineScreen(screen, match);
            modalOpen = false;
            screen.render();
            matchList.focus();
        }
    });



    screen.key(['escape', 'q', 'C-c'], () => {
      screen.destroy();
      resolve();
    });

    screen.key('b', () => {
        if (modalOpen) return;
        screen.destroy();
        resolve('BACK');
    });

    updateList();
    matchList.focus();
    screen.render();
  });
};

module.exports = { createResultsScreen };
