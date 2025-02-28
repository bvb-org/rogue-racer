# Rogue Racer

A 2D top-down racing game set in Romania, built with Phaser.js.

## Game Description

Rogue Racer is a fast-paced racing game where you drive through procedurally generated tracks in three Romanian cities: Bucharest, Brașov, and Cluj-Napoca. Each city has a unique track reflecting its traits (urban for Bucharest, mountainous for Brașov, mixed for Cluj-Napoca).

### Features

- **Three Romanian Cities**: Race through Bucharest, Brașov, and Cluj-Napoca
- **Procedurally Generated Tracks**: Each city has a unique track layout
- **Romanian-themed Elements**: Billboards with Romanian text, simplified landmarks
- **Combat System**: Shoot or avoid NPC drones and rival racers
- **Upgrade System**: Improve your vehicle's speed, fire rate, ammo capacity, and health
- **Progress Saving**: Game progress is saved in local storage

## How to Play

### Controls

- **Arrow Keys**: Drive your vehicle
  - Up: Accelerate
  - Down: Reverse
  - Left/Right: Turn
- **Space**: Shoot

### Gameplay

1. Select a city to race in
2. Complete the mission by reaching the finish line
3. Avoid or destroy enemy vehicles and drones
4. Collect pickups for health and ammo
5. Upgrade your vehicle between missions

## Running the Game

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser

### Docker Deployment (Raspberry Pi)

The game includes Docker configuration for easy deployment on a Raspberry Pi or any other system running Docker.

#### Prerequisites

- Docker and Docker Compose installed on your Raspberry Pi
- Git (optional)

#### Deployment Steps

1. Clone or download this repository to your Raspberry Pi:
   ```
   git clone https://github.com/yourusername/rogue-racer.git
   cd rogue-racer
   ```

2. Build and start the Docker container:
   ```
   docker-compose up -d
   ```

3. Access the game by navigating to `http://your-raspberry-pi-ip:8080` in a web browser

#### Stopping the Game Server

```
docker-compose down
```

## Development

### Project Structure

- `index.html`: Main HTML file
- `js/`: JavaScript files
  - `game.js`: Main game initialization
  - `scenes/`: Game scenes (Boot, Menu, Game, Upgrade)
  - `objects/`: Game objects (Player, Enemy, Track)
  - `utils/`: Utility functions (storage)
- `assets/`: Game assets (images, sounds)
- `Dockerfile` & `docker-compose.yml`: Docker configuration

## Credits

- Built with [Phaser 3](https://phaser.io/phaser3)
- Developed as a demonstration project

## License

This project is open source and available under the MIT License.