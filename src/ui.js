const asciichart = require('asciichart');

const formatSummary = (summoner, matches) => {
  if (matches.length === 0) {
    return `{bold}{green-fg}No recent games found.{/green-fg}{/bold}`;
  }

  let totalWins = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalDuration = 0;
  const championCounts = {};

  matches.forEach(match => {
    const participant = match.details.info.participants.find(p => p.puuid === summoner.puuid);
    if (participant) {
      if (participant.win) totalWins++;
      totalKills += participant.kills;
      totalDeaths += participant.deaths;
      totalAssists += participant.assists;
      totalDuration += match.details.info.gameDuration;
      championCounts[participant.championName] = (championCounts[participant.championName] || 0) + 1;
    }
  });

  const winRate = ((totalWins / matches.length) * 100).toFixed(2);
  const overallKda = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : 'Perfect';

  const sortedChampions = Object.entries(championCounts).sort((a, b) => b[1] - a[1]);
  const mostPlayed = sortedChampions.slice(0, 3).map(([name, count]) => `${name} (${count})`).join(', ');

  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const timePlayed = `${hours}h ${minutes}m`;

  const labels = ["Win Rate:", "Overall KDA:", "Most Played:", "Time Played:"];
  const longestLabel = Math.max(...labels.map(l => l.length));

  return `{bold}{green-fg}Last ${matches.length} Games Summary:{/green-fg}{/bold}\n` +
         `${labels[0].padEnd(longestLabel)} {bold}${winRate}%{/bold}\n` +
         `${labels[1].padEnd(longestLabel)} {bold}${overallKda}{/bold}\n` +
         `${labels[2].padEnd(longestLabel)} {bold}${mostPlayed}{/bold}\n` +
         `${labels[3].padEnd(longestLabel)} {bold}${timePlayed}{/bold}`;
};

const colorizeRank = (rank) => {
    if (!rank) return 'Unranked';
    const tier = rank.split(' ')[0];
    const colors = {
        'CHALLENGER': 'yellow-fg',
        'GRANDMASTER': 'red-fg',
        'MASTER': 'magenta-fg',
        'DIAMOND': 'cyan-fg',
        'EMERALD': 'green-fg',
        'PLATINUM': 'blue-fg',
        'GOLD': 'yellow-fg',
        'SILVER': 'white-fg',
        'BRONZE': '#CD7F32-fg',
        'IRON': 'grey-fg',
        'Unranked': 'white-fg'
    };
    const color = colors[tier] || 'white-fg';
    return `{${color}}${rank}{/${color}}`;
};

const padStringWithTags = (str, length) => {
  const visibleLength = str.replace(/{[^{}]*}/g, '').length;
  const padding = ' '.repeat(Math.max(0, length - visibleLength));
  return str + padding;
};

const frame = (title, content) => {
  if (!content) return '';
  const lines = content.split('\n');
  const width = Math.max(...lines.map(l => l.replace(/{[^{}]*}/g, '').length));
  const horizontal = '─'.repeat(width + 2);
  const titlePadding = '─'.repeat(Math.max(0, width - title.length - 1));
  const framedTitle = `┌─ ${title} ${titlePadding}┐`;

  const framedContent = lines.map(line => `│ ${padStringWithTags(line, width)} │`).join('\n');

  return `${framedTitle}\n${framedContent}\n└${horizontal}┘`;
};

const formatMatchDetails = (match, summoner, itemMap, spellMap, runeMap, terminalWidth, rankData) => {
  const participant = match.details.info.participants.find(p => p.puuid === summoner.puuid);
  if (!participant) return 'Participant data not found.';

  const gameDurationSeconds = match.details.info.gameDuration;
  const gameDurationMinutes = Math.floor(gameDurationSeconds / 60);
  const gameDurationRemainingSeconds = gameDurationSeconds % 60;
  const totalCreepScore = participant.totalMinionsKilled + participant.neutralMinionsKilled;

  const detailsSummary =
    `{bold}Champion:{/bold} ${participant.championName}\n` +
    `{bold}KDA:{/bold}      ${participant.kills}/${participant.deaths}/${participant.assists}\n` +
    `{bold}CS:{/bold}       ${totalCreepScore}\n` +
    `{bold}Vision:{/bold}   ${participant.visionScore}\n` +
    `{bold}Length:{/bold}   ${gameDurationMinutes}m ${gameDurationRemainingSeconds}s`;

  // KDA Graph
  const maxBarWidth = Math.floor(terminalWidth * 0.4);
  const maxKDAValue = Math.max(participant.kills, participant.deaths, participant.assists, 1);
  const createBar = (value, color) => {
      const barWidth = Math.round((value / maxKDAValue) * maxBarWidth);
      return `{${color}-fg}${'█'.repeat(barWidth)}{/${color}-fg}` + ` (${value})`;
  };
  const kdaGraph = `{bold}KDA Performance:{/bold}\n` +
                   `Kills:   ${createBar(participant.kills, 'green')}\n` +
                   `Deaths:  ${createBar(participant.deaths, 'red')}\n` +
                   `Assists: ${createBar(participant.assists, 'magenta')}`;

  // Gold Graph
  const participantId = participant.participantId;
  const goldFrames = match.timeline.info.frames.map(frame => frame.participantFrames[String(participantId)].totalGold);
  const graphWidth = Math.floor(terminalWidth * 0.8);
  const resampledGold = resampleData(goldFrames, graphWidth);
  const goldChart = asciichart.plot(resampledGold, { height: 8 });
  const xAxis = createXAxis(Math.floor(match.details.info.gameDuration / 60), graphWidth);
  const goldGraph = `{bold}Gold Generation:{/bold}\n{yellow-fg}${goldChart}{/yellow-fg}\n${xAxis}`;

  // Items
  const items = [
    participant.item0, participant.item1, participant.item2,
    participant.item3, participant.item4, participant.item5, participant.item6
  ].filter(id => id !== 0).map(id => itemMap[id] ? itemMap[id].name : 'Unknown Item');
  const itemsText = items.length > 0 ? `{bold}Items:{/bold}\n${items.join(', ')}` : '';

  // Spells and Runes
  const spell1 = spellMap.get(String(participant.summoner1Id)) || 'N/A';
  const spell2 = spellMap.get(String(participant.summoner2Id)) || 'N/A';
  const spellsText = `{bold}Spells:{/bold}\n${spell1}, ${spell2}`;

  const perks = participant.perks;
  const primaryStyle = perks.styles[0];
  const secondaryStyle = perks.styles[1];

  const primaryTreeName = runeMap.get(primaryStyle.style) || 'N/A';
  const primaryRunes = primaryStyle.selections.map(s => runeMap.get(s.perk) || 'N/A');
  
  const secondaryTreeName = runeMap.get(secondaryStyle.style) || 'N/A';
  const secondaryRunes = secondaryStyle.selections.map(s => runeMap.get(s.perk) || 'N/A');

  const runesText = `{bold}Runes:{/bold}\n` +
                    `{yellow-fg}${primaryTreeName}{/yellow-fg}: ${primaryRunes.join(', ')}\n` +
                    `{cyan-fg}${secondaryTreeName}{/cyan-fg}: ${secondaryRunes.join(', ')}`;

  let rankText = '';
  if (rankData) {
    rankText = `{bold}Players:{/bold}\n`;
    const team1 = match.details.info.participants.slice(0, 5);
    const team2 = match.details.info.participants.slice(5, 10);

    // Calculate the longest name for dynamic padding
    const longestName = Math.max(...match.details.info.participants.map(p => `${p.riotIdGameName}#${p.riotIdTagline}`.length));

    const formatTeam = (team) => {
        return team.map(p => {
            const rank = rankData[p.puuid] || 'Unranked';
            const fullRiotId = `${p.riotIdGameName}#${p.riotIdTagline}`.padEnd(longestName + 2);
            const champion = p.championName.padEnd(16);
            const kda = `${p.kills}/${p.deaths}/${p.assists}`.padEnd(12);
            return `${fullRiotId} ${champion} ${kda} ${colorizeRank(rank)}`;
        }).join('\n');
    };
    rankText += `{cyan-fg}Blue Team:{/cyan-fg}\n${formatTeam(team1)}\n`;
    rankText += `{red-fg}Red Team:{/red-fg}\n${formatTeam(team2)}`;
  }

  return `\n${frame('Details', detailsSummary)}\n\n${frame('KDA', kdaGraph)}\n\n${frame('Gold', goldGraph)}\n\n${frame('Items', itemsText)}\n\n${frame('Spells', spellsText)}\n\n${frame('Runes', runesText)}\n\n${frame('Ranks', rankText)}\n`;
};
// Helper functions for graphs
const resampleData = (data, targetWidth) => {
    if (!data || data.length === 0) return [];
    const resampled = new Array(targetWidth).fill(0);
    const factor = (data.length - 1) / (targetWidth - 1);
    for (let i = 0; i < targetWidth; i++) {
        const index = i * factor;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        resampled[i] = data[lower] * (1 - weight) + data[upper] * weight;
    }
    return resampled;
};

const createXAxis = (durationMinutes, width) => {
    const interval = 5;
    let axis = ' '.repeat(width);
    for (let min = 0; min <= durationMinutes; min += interval) {
        const label = `${min}m`;
        const position = Math.floor((min / durationMinutes) * width);
        if (position + label.length < width) {
            axis = axis.substring(0, position) + label + axis.substring(position + label.length);
        }
    }
    return axis;
};


module.exports = {
  formatSummary,
  formatMatchDetails,
};