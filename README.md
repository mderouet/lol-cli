# LoL CLI Stats

A terminal-based application to fetch and display a player's League of Legends statistics, built with Node.js and the Riot Games API.

## Features

- **Interactive TUI:** A full-featured, mouse and keyboard-driven Text-based User Interface for searching and viewing stats.
- **Live Game Viewer:** If a player is in a live game, a box will appear on the summary page showing their champion, role, game time, summoner spells, and runes.
- **Enhanced Summary:** The summary page now shows the most played champions and total playtime from the last 10 games.
- **Match History:** View a summary of the last 10 games, including date, result, champion, role, and KDA.
- **Collapsible Details:** Expand any match to see a detailed breakdown, including:
    - In-depth performance stats (CS, Vision Score, Game Length).
    - KDA performance bar graphs.
    - A line graph showing gold generation over time.
    - A complete list of items.
    - A full rune setup for both primary and secondary trees.
    - Summoner spells.
    - A table of all players in the game, their champion, KDA, and rank.
- **On-Demand Rank Loading:** The average rank of each game is displayed on the summary line, and full player ranks are loaded efficiently when a match is expanded.
- **Champion Mastery:** Press `m` on any match to view a detailed Champion Mastery profile for the champion played in that game.
- **In-Depth Match Timeline:** When a match is expanded, press `t` to open a full-screen, scrollable log of all major events in the match, including kills, multi-kills, objectives, and towers destroyed.
- **Smart Game Status:** Automatically detects and labels "Remake" and "Arena" games.

## Bug Log

- ~In the match timeline view, objective-related events (e.g., "The Blue Team killed the Dragon") do not have the same spacing from the timestamp as other events. This is a cosmetic issue that will be addressed in a future update.~ (Fixed in v1.1)
- ~Mastery and Timeline hotkeys ('m' and 't') only worked when the match title was selected, not the expanded details.~ (Fixed in v1.1)


## Installation

Follow these steps to get the LoL CLI application up and running on your local machine.

1.  **Clone the Repository**
    
    First, clone the repository to your local machine using Git:
    
    ```bash
    git clone https://github.com/your-username/lol-cli.git
    cd lol-cli
    ```
    
2.  **Install Dependencies**
    
    Next, install the required Node.js dependencies using npm:
    
    ```bash
    npm install
    ```
    

## Configuration

To fetch data from the Riot Games API, you need to provide a valid API key.

1.  **Create a `.env` File**
    
    Create a new file named `.env` in the root of the project directory.
    
    ```bash
    touch .env
    ```
    
2.  **Add Your API Key**
    
    Open the `.env` file and add your Riot API key in the following format:
    
    ```
    RIOT_API_key="your_api_key_here"
    ```
    
    You can obtain a free development API key from the [Riot Developer Portal](https://developer.riotgames.com/).
    

## Development

To run the application in a development environment without building it, use the following command:

```bash
npm start
```

This will launch the interactive search screen directly from the source code.

## Building the Application

To create a standalone executable, run the build command:

```bash
npm run build
```

This will generate a binary file (e.g., `lol-cli`) in the project's root directory. You can then run this file directly from your terminal.

## Usage

Once you have built the executable, you can run it from anywhere in your terminal:

```bash
./lol-cli
```

This will launch the interactive search screen. You can also pass arguments directly:

```bash
./lol-cli -r <region> -i '<gameName#tagLine>'
```


### Hotkeys

- **Search Screen:**
    - `Enter`: Move between fields and submit.
    - `Arrow Keys`: Navigate lists.
    - `Esc` / `q` / `Ctrl+C`: Quit.
- **Results Screen:**
    - `Enter`: Expand/collapse a match.
    - `m`: View Champion Mastery for the selected match.
    - `t`: View Match Timeline for the selected match (when expanded).
    - `b`: Go back to the search screen.
    - `q`: Quit.
- **Mastery Screen:**
    - `b`: Go back to the results screen.
- **Timeline Screen:**
    - `b`: Go back to the results screen.
