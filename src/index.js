#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Command } = require('commander');
const blessed = require('blessed');
const { getSummonerDataByRiotId, getMatchHistory, getMatchDetails, getMatchTimeline } = require('./api');
const { createSearchScreen } = require('./tui');
const { createResultsScreen } = require('./resultsTui');
const { createLoadingScreen } = require('./loadingTui');

const program = new Command();

program
  .version('1.0.0')
  .description('A CLI tool to get League of Legends summoner stats')
  .option('-r, --region <region>', 'The region to search in')
  .option('-i, --riot-id <riotId>', "The Riot ID to search for (e.g., 'gameName#tagLine')");

program.parse(process.argv);

const options = program.opts();

if (!program.args.length) {
  const main = async () => {
    let region, riotId;
    let cliOptions = { ...options };

    while (true) {
      if (!cliOptions.region || !cliOptions.riotId) {
        const searchData = await createSearchScreen();
        if (!searchData || searchData === 'EXIT' || !searchData.riotId) {
          console.log('Exiting.');
          break;
        }
        region = searchData.region;
        riotId = searchData.riotId;
      } else {
        region = cliOptions.region;
        riotId = cliOptions.riotId;
        cliOptions = {};
      }

      const screen = blessed.screen({
        smartCSR: true,
        fullUnicode: true,
      });

      const loading = createLoadingScreen(screen);
      screen.render();

      try {
        loading.update(10, 'Fetching summoner data...');
        const summoner = await getSummonerDataByRiotId(region, riotId);

        loading.update(30, 'Fetching match history...');
        const matchHistory = await getMatchHistory(region, summoner.puuid);

        const matches = [];
        for (let i = 0; i < matchHistory.length; i++) {
          const matchId = matchHistory[i];
          const progress = 30 + (i / matchHistory.length) * 60;
          loading.update(progress, `Fetching details for match ${i + 1}/${matchHistory.length}...`);
          
          const matchDetails = await getMatchDetails(region, matchId);
          const matchTimeline = await getMatchTimeline(region, matchId);
          matches.push({ details: matchDetails, timeline: matchTimeline });
        }

        loading.update(100, 'All data loaded.');
        loading.destroy();
        
        screen.destroy(); // Destroy the screen used for loading

        const result = await createResultsScreen(summoner, matches, region);
        if (result !== 'BACK') {
          break;
        }
      } catch (error) {
        screen.destroy();
        console.error('\nError:', error.message);
        break;
      }
    }
  };

  main();
}
