# <img width="371" height="81" alt="fontbolt" src="https://github.com/user-attachments/assets/de5509c2-4db2-4d2c-87ad-5370e952b47b" />


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
| **Search Screen** | <img width="1697" height="994" alt="Screenshot 2025-10-12 at 9 40 18 PM" src="https://github.com/user-attachments/assets/58e7fa47-efc2-43f6-9751-67d300ee06c4" /> |
| **Results Screen** | <img width="1688" height="1005" alt="Results Screen" src="https://github.com/user-attachments/assets/77781a0d-a9f1-4e6a-a2f8-1850b86d1985" /> |
| **Expanded Match** | <img width="1859" height="1363" alt="Expanded Match" src="https://github.com/user-attachments/assets/6ae9f04c-fd5e-4950-a606-df1db59cd7ae" /> |
| **Mastery Screen** | <img width="1480" height="231" alt="MasteryScreen" src="https://github.com/user-attachments/assets/6dcc8457-f08e-4c6e-8d29-9e9173b389c9" /> |
| **Timeline Screen** | <img width="1662" height="1238" alt="Match Timeline" src="https://github.com/user-attachments/assets/df7961f5-816f-4c28-ac1f-7655b5814c5a" /> |
| **Live Game** | <img width="553" height="156" alt="Live Game" src="https://github.com/user-attachments/assets/ed42d3bd-17ac-45cd-a8dd-9e14b47a9b64" /> |

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

To fetch data from the Riot Games API, you need to provide a valid API key.

1.  **Create a `.env` File**
    Create a new file named `.env` in the root of the project directory.
    ```bash
    touch .env
    ```

2.  **Add Your API Key**
    Open the `.env` file and add your Riot API key:
    ```
    RIOT_API_key="your_api_key_here"
    ```
    Get a free development API key from the [Riot Developer Portal](https://developer.riotgames.com/).

**Note for binary users:** If you are using the pre-built binary, you need to place the `.env` file in the same directory as the executable.

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

Contributions are welcome!

Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.
Also, please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand our community standards.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
