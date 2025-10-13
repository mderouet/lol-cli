# LoL CLI 

A terminal-based application to fetch and display a player's League of Legends statistics, built with Node.js and the Riot Games API.

## Features

- **Interactive TUI:** A full-featured, mouse and keyboard-driven Text-based User Interface.
- **Live Game Viewer:** See live game data, including champion, role, game time, and more.
- **Enhanced Summary:** View most played champions and total playtime from the last 10 games.
- **Detailed Match History:** Get a summary of the last 10 games and expand for in-depth details.
- **In-Depth Analysis:** See performance stats, KDA graphs, gold generation, items, runes, and more.
- **Champion Mastery:** View your Champion Mastery profile for any champion played.
- **Match Timeline:** Get a full-screen, scrollable log of all major events in a match.
- **Smart Game Status:** Automatically detects and labels "Remake" and "Arena" games.

## Screenshots

| Description | Screenshot |
| :--- | :--- |
| **Search Screen** | |<img width="1697" height="994" alt="Screenshot 2025-10-12 at 9 40 18 PM" src="https://github.com/user-attachments/assets/58e7fa47-efc2-43f6-9751-67d300ee06c4" />

| **Results Screen** | *Screenshot of the results screen* |
| **Expanded Match** | *Screenshot of an expanded match* |
| **Mastery Screen** | *Screenshot of the mastery screen* |
| **Timeline Screen** | *Screenshot of the timeline screen* |

## Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/AntApper/lol-cli.git
    cd lol-cli
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

## Configuration

1.  **Create a `.env` File**
    ```bash
    touch .env
    ```

2.  **Add Your API Key**
    Open the `.env` file and add your Riot API key:
    ```
    RIOT_API_key="your_api_key_here"
    ```
    Get a free development API key from the [Riot Developer Portal](https://developer.riotgames.com/).

## Usage

### Development

To run the application in a development environment, use:
```bash
npm start
```

### Building the Application

To create a standalone executable, run:
```bash
npm run build
```
This will generate a binary file (e.g., `lol-cli`) in the project's root directory.

### Running the Executable

```bash
./lol-cli
```
You can also pass arguments directly:
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

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
