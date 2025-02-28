# 🏎️ Rogue Racer

A 2D top-down racing game set in Romania 🇷🇴, built with Phaser.js.

## 🎮 Game Description

Rogue Racer is a fast-paced racing game where you drive through procedurally generated tracks in six Romanian cities: Bucharest, Brașov, Cluj-Napoca, Timisoara, Iasi, and Vaslui. Each city has a unique track reflecting its traits:

- **Bucharest** 🏙️: Urban setting with straighter roads, high building density, and Parliament landmark
- **Brașov** ⛰️: Mountainous terrain with curvy roads and the Black Church landmark
- **Cluj-Napoca** 🌆: Mixed setting with medium curviness and complex road networks
- **Timisoara** 🏛️: Cultural city with slightly curvier roads than Bucharest
- **Iasi** 🏫: Historical city with more curves and higher intersection density
- **Vaslui** 🛣️: Challenging rural roads with the most curves and highest obstacle density

The difficulty increases as you progress through the cities, with more enemies and obstacles to overcome.

### ✨ Features

- **Six Romanian Cities** 🇷🇴: Race through Bucharest, Brașov, Cluj-Napoca, Timisoara, Iasi, and Vaslui
- **Procedurally Generated Tracks** 🗺️: Each city has a unique track layout
- **Romanian-themed Elements** 🏛️: Billboards with Romanian text, simplified landmarks
- **Combat System** 💥: Shoot or avoid NPC drones and rival racers
- **Upgrade System** ⚡: Improve your vehicle's speed, fire rate, ammo capacity, and health
- **Special Abilities** 🌀: Unlock the Shockwave ability after completing Bucharest, allowing you to destroy all nearby enemies
- **Terrain Effects** 🌱: Different driving experiences on roads vs. grass (slower on grass)
- **Progress Saving** 💾: Game progress is saved in local storage

## 🎯 How to Play

### 🎛️ Controls

- **Arrow Keys** ⬆️⬇️⬅️➡️: Drive your vehicle
  - Up: Accelerate
  - Down: Reverse
  - Left/Right: Turn
- **Space** 🔫: Shoot
- **C** 💫: Activate Shockwave (after unlocking)

### 🏁 Gameplay

1. Select a city to race in 🏙️
2. Complete the mission by reaching the finish line 🏁
3. Avoid or destroy enemy vehicles and drones 💥
4. Collect pickups for health and ammo 🔋
5. Upgrade your vehicle between missions 🔧

### 🔧 Upgrade System

After completing each mission, you'll earn upgrade points that can be spent on:

- **Speed** ⚡: Increases your vehicle's maximum speed
- **Fire Rate** 🔥: Reduces the cooldown between shots
- **Ammo Capacity** 🔫: Increases your starting ammunition
- **Health** ❤️: Increases your vehicle's durability

Each stat can be upgraded up to 5 levels. Strategic upgrades are essential for tackling the more challenging cities.

## 🚀 Running the Game

### 💻 Local Development

1. Clone the repository
2. Open `index.html` in a web browser

### 🐳 Docker Deployment (Raspberry Pi)

The game includes Docker configuration for easy deployment on a Raspberry Pi or any other system running Docker.

#### Prerequisites

- Docker and Docker Compose installed on your Raspberry Pi 🐳
- Git (optional) 📦

#### Manual Deployment Steps

1. Clone or download this repository to your Raspberry Pi:
   ```
   git clone https://github.com/qSharpy/rogue-racer.git
   cd rogue-racer
   ```

2. Build and start the Docker container:
   ```
   docker-compose up -d
   ```

3. Access the game by navigating to `http://localhost:8080` in a web browser 🌐

#### Automated Deployment with GitHub Actions

The repository includes a GitHub Actions workflow for automated deployment to a Raspberry Pi:

1. Set up a self-hosted GitHub Actions runner on your Raspberry Pi:
   - Go to your GitHub repository → Settings → Actions → Runners
   - Click "New self-hosted runner" and follow the instructions for Linux
   - Make sure the runner is configured as a service to run at startup

2. Trigger the deployment:
   - Go to your GitHub repository → Actions → "Deploy to Raspberry Pi" workflow
   - Click "Run workflow" to manually trigger the deployment
   - The workflow will automatically check out the code and deploy using Docker Compose

3. Access the game by navigating to `http://localhost:8080` in a web browser 🌐

#### Stopping the Game Server

```
docker-compose down
```

## 👨‍💻 Development

### 📁 Project Structure

- `index.html`: Main HTML file
- `js/`: JavaScript files
  - `game.js`: Main game initialization
  - `scenes/`: Game scenes (Boot, Menu, Game, Upgrade)
  - `objects/`: Game objects (Player, Enemy, Track)
  - `utils/`: Utility functions (storage)
- `assets/`: Game assets (images, sounds)
- `Dockerfile` & `docker-compose.yml`: Docker configuration

## 🙏 Credits

- Built with [Phaser 3](https://phaser.io/) 🎮
- Developed as a demonstration project

## 📄 License

This project is open source and available under the MIT License.