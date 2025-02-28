/**
 * Track Generator
 * Handles procedural generation of tracks for each city
 */
class Track {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.tileSize = 32;
        this.roadWidth = 3; // Number of tiles
        this.trackLength = 150; // Length of track in tiles (increased by 1.5x)
        
        // Track properties based on city
        this.cityProperties = {
            'Bucharest': {
                curviness: 0.3, // Lower means straighter roads
                obstacles: 0.4, // Density of obstacles
                buildings: 0.7, // Density of buildings
                landmarks: ['parliament'],
                billboards: [
                    'Bine ați venit în București!',
                    'Vizitați Palatul Parlamentului',
                    'Încercați Țuică tradițională!',
                    'Centrul Vechi - Inima Bucureștiului'
                ]
            },
            'Brașov': {
                curviness: 0.7, // Higher means more curves (mountain roads)
                obstacles: 0.5,
                buildings: 0.4,
                landmarks: ['black-church'],
                billboards: [
                    'Bine ați venit în Brașov!',
                    'Vizitați Biserica Neagră',
                    'Stațiunea Poiana Brașov',
                    'Castelul Bran în apropiere'
                ]
            },
            'Cluj-Napoca': {
                curviness: 0.5, // Medium curviness
                obstacles: 0.3,
                buildings: 0.6,
                landmarks: [],
                billboards: [
                    'Bine ați venit în Cluj-Napoca!',
                    'Capitala IT a României',
                    'Untold Festival',
                    'Vizitați Salina Turda'
                ]
            }
        };
        
        // Track data
        this.trackData = [];
        this.roadPath = [];
        this.obstacles = [];
        this.decorations = [];
        this.billboards = [];
        this.landmarks = [];
        this.finishLine = null;
        
        // Generate the track
        this.generateTrack();
    }
    
    generateTrack() {
        // Get properties for current city
        const props = this.cityProperties[this.city];
        
        // Generate road path
        this.generateRoadPath(props.curviness);
        
        // Generate obstacles
        this.generateObstacles(props.obstacles);
        
        // Generate decorations (buildings, trees, etc.)
        this.generateDecorations(props.buildings);
        
        // Add billboards with Romanian text
        this.addBillboards(props.billboards);
        
        // Add city-specific landmarks
        this.addLandmarks(props.landmarks);
        
        // Add finish line
        this.addFinishLine();
    }
    
    generateRoadPath(curviness) {
        // Start with a straight section
        let x = 0;
        let y = 0;
        let direction = 0; // 0 = up, 1 = right, 2 = down, 3 = left
        
        // Add starting point
        this.roadPath.push({ x, y });
        
        // Generate path with Perlin noise for natural curves
        for (let i = 1; i < this.trackLength; i++) {
            // Determine if we should change direction
            if (Math.random() < curviness) {
                // Change direction slightly (-1, 0, or 1)
                const turn = Math.floor(Math.random() * 3) - 1;
                direction = (direction + turn + 4) % 4;
            }
            
            // Move in current direction
            switch (direction) {
                case 0: y--; break; // Up
                case 1: x++; break; // Right
                case 2: y++; break; // Down
                case 3: x--; break; // Left
            }
            
            // Add point to path
            this.roadPath.push({ x, y });
        }
        
        // Normalize path to start at (0,0)
        const minX = Math.min(...this.roadPath.map(p => p.x));
        const minY = Math.min(...this.roadPath.map(p => p.y));
        
        this.roadPath = this.roadPath.map(p => ({
            x: p.x - minX,
            y: p.y - minY
        }));
    }
    
    generateObstacles(density) {
        // Add obstacles along the track
        // Reduce density by 1/3 to match the spawning reduction
        const reducedDensity = density / 3;
        
        for (let i = 10; i < this.trackLength - 5; i += 3) { // Skip more segments to reduce count
            if (Math.random() < reducedDensity) {
                // Get current road segment
                const segment = this.roadPath[i];
                
                // Determine obstacle position (left or right of road)
                const side = Math.random() > 0.5 ? 1 : -1;
                // Increase offset to place drones near but not on the road
                const offset = Math.floor(Math.random() * 2) + 2; // Now 2-3 tiles away instead of 1-2
                
                // Calculate obstacle position
                let obstacleX, obstacleY;
                
                // Determine direction of road segment
                const nextSegment = this.roadPath[i + 1];
                const dx = nextSegment.x - segment.x;
                const dy = nextSegment.y - segment.y;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal road segment
                    obstacleX = segment.x;
                    obstacleY = segment.y + (side * offset);
                } else {
                    // Vertical road segment
                    obstacleX = segment.x + (side * offset);
                    obstacleY = segment.y;
                }
                
                // Add obstacle - only use drones near the road, not on it
                this.obstacles.push({
                    x: obstacleX,
                    y: obstacleY,
                    type: 'drone'
                });
            }
        }
    }
    
    generateDecorations(buildingDensity) {
        // Add decorations around the track
        const maxDistance = 15; // Maximum distance from road (increased by 1.5x)
        
        // Create a grid to track occupied positions
        const occupiedPositions = new Set();
        
        // Mark road positions as occupied
        this.roadPath.forEach(pos => {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    occupiedPositions.add(`${pos.x + dx},${pos.y + dy}`);
                }
            }
        });
        
        // Mark obstacle positions as occupied
        this.obstacles.forEach(obs => {
            occupiedPositions.add(`${obs.x},${obs.y}`);
        });
        
        // Add buildings and trees
        for (let x = -maxDistance; x < this.getMaxX() + maxDistance; x++) {
            for (let y = -maxDistance; y < this.getMaxY() + maxDistance; y++) {
                const pos = `${x},${y}`;
                
                // Skip if position is occupied
                if (occupiedPositions.has(pos)) continue;
                
                // Skip if on or too close to road (trees should only be on grass)
                if (this.isNearRoad(x, y, 2)) continue;
                
                // Skip if too far from road
                if (!this.isNearRoad(x, y, maxDistance)) continue;
                
                // Add decoration based on probability
                // Increased probability for trees to compensate for removing them from obstacles
                if (Math.random() < 0.15) {
                    const isBuilding = Math.random() < buildingDensity;
                    
                    this.decorations.push({
                        x,
                        y,
                        type: isBuilding ? 'building' : 'tree'
                    });
                    
                    // Mark position as occupied
                    occupiedPositions.add(pos);
                }
            }
        }
    }
    
    addBillboards(texts) {
        // Add billboards with Romanian text
        const billboardCount = Math.min(texts.length, 5);
        const segmentLength = Math.floor(this.trackLength / (billboardCount + 1));
        
        for (let i = 1; i <= billboardCount; i++) {
            const segmentIndex = i * segmentLength;
            const segment = this.roadPath[segmentIndex];
            
            // Determine billboard position (left or right of road)
            const side = Math.random() > 0.5 ? 1 : -1;
            const offset = 2;
            
            // Calculate billboard position
            let billboardX, billboardY;
            
            // Determine direction of road segment
            const nextSegment = this.roadPath[Math.min(segmentIndex + 1, this.trackLength - 1)];
            const dx = nextSegment.x - segment.x;
            const dy = nextSegment.y - segment.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal road segment
                billboardX = segment.x;
                billboardY = segment.y + (side * offset);
            } else {
                // Vertical road segment
                billboardX = segment.x + (side * offset);
                billboardY = segment.y;
            }
            
            // Add billboard
            this.billboards.push({
                x: billboardX,
                y: billboardY,
                text: texts[i - 1]
            });
        }
    }
    
    addLandmarks(landmarks) {
        // Add city-specific landmarks
        if (landmarks.length === 0) return;
        
        // Place landmark near middle of track
        const segmentIndex = Math.floor(this.trackLength / 2);
        const segment = this.roadPath[segmentIndex];
        
        // Find suitable position for landmark
        let landmarkX = segment.x + 4;
        let landmarkY = segment.y + 4;
        
        // Add landmark
        this.landmarks.push({
            x: landmarkX,
            y: landmarkY,
            type: landmarks[0] // Use first landmark
        });
    }
    
    addFinishLine() {
        // Add finish line at end of track
        const lastSegment = this.roadPath[this.trackLength - 1];
        const prevSegment = this.roadPath[this.trackLength - 2];
        
        // Determine finish line orientation
        const dx = lastSegment.x - prevSegment.x;
        const dy = lastSegment.y - prevSegment.y;
        
        this.finishLine = {
            x: lastSegment.x,
            y: lastSegment.y,
            horizontal: Math.abs(dx) > Math.abs(dy)
        };
    }
    
    isNearRoad(x, y, maxDistance) {
        // Check if position is near any road segment
        for (const segment of this.roadPath) {
            const distance = Math.sqrt(
                Math.pow(segment.x - x, 2) + 
                Math.pow(segment.y - y, 2)
            );
            
            if (distance <= maxDistance) {
                return true;
            }
        }
        
        return false;
    }
    
    getMaxX() {
        return Math.max(...this.roadPath.map(p => p.x));
    }
    
    getMaxY() {
        return Math.max(...this.roadPath.map(p => p.y));
    }
    
    getStartPosition() {
        // Return starting position (first road segment)
        const startSegment = this.roadPath[0];
        return {
            x: startSegment.x * this.tileSize + this.tileSize / 2,
            y: startSegment.y * this.tileSize + this.tileSize / 2
        };
    }
    
    getFinishPosition() {
        // Return finish position (last road segment)
        const finishSegment = this.roadPath[this.trackLength - 1];
        return {
            x: finishSegment.x * this.tileSize + this.tileSize / 2,
            y: finishSegment.y * this.tileSize + this.tileSize / 2
        };
    }
    
    render() {
        // Create tile groups
        this.roadTiles = this.scene.physics.add.staticGroup();
        this.grassTiles = this.scene.physics.add.staticGroup();
        this.obstacleSprites = this.scene.physics.add.group();
        this.decorationSprites = this.scene.add.group();
        this.billboardSprites = this.scene.add.group();
        this.landmarkSprites = this.scene.add.group();
        
        // Render grass background
        this.renderGrass();
        
        // Render road
        this.renderRoad();
        
        // Render obstacles
        this.renderObstacles();
        
        // Render decorations
        this.renderDecorations();
        
        // Render billboards
        this.renderBillboards();
        
        // Render landmarks
        this.renderLandmarks();
        
        // Render finish line
        this.renderFinishLine();
        
        return {
            obstacles: this.obstacleSprites,
            road: this.roadTiles
        };
    }
    
    renderGrass() {
        // Render grass tiles as background
        const maxX = this.getMaxX();
        const maxY = this.getMaxY();
        const buffer = 15; // Extra grass around track (increased by 1.5x)
        
        for (let x = -buffer; x <= maxX + buffer; x++) {
            for (let y = -buffer; y <= maxY + buffer; y++) {
                this.grassTiles.create(
                    x * this.tileSize + this.tileSize / 2,
                    y * this.tileSize + this.tileSize / 2,
                    'grass'
                );
            }
        }
    }
    
    renderRoad() {
        // Render road tiles
        for (const segment of this.roadPath) {
            this.roadTiles.create(
                segment.x * this.tileSize + this.tileSize / 2,
                segment.y * this.tileSize + this.tileSize / 2,
                'road'
            );
        }
    }
    
    renderObstacles() {
        // Render obstacles
        for (const obstacle of this.obstacles) {
            const sprite = this.scene.physics.add.sprite(
                obstacle.x * this.tileSize + this.tileSize / 2,
                obstacle.y * this.tileSize + this.tileSize / 2,
                obstacle.type
            );
            
            // Set properties based on type
            if (obstacle.type === 'drone') {
                // Make drones move
                this.scene.tweens.add({
                    targets: sprite,
                    y: sprite.y + 50,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1
                });
                
                // Add to enemy group if it exists
                if (this.scene.enemies) {
                    this.scene.enemies.add(sprite);
                }
            }
            
            this.obstacleSprites.add(sprite);
        }
    }
    
    renderDecorations() {
        // Render decorations
        for (const decoration of this.decorations) {
            let spriteKey = decoration.type;
            
            // If it's a building, randomly select one of the building images
            if (decoration.type === 'building') {
                // Try to get all available building textures
                const buildingTextures = [];
                let index = 0;
                
                // Check for building textures (we know we have at least building0 through building3)
                while (this.scene.textures.exists(`building${index}`)) {
                    buildingTextures.push(`building${index}`);
                    index++;
                }
                
                // If we found any building textures, randomly select one
                if (buildingTextures.length > 0) {
                    const randomIndex = Math.floor(Math.random() * buildingTextures.length);
                    spriteKey = buildingTextures[randomIndex];
                }
            }
            
            const sprite = this.scene.add.image(
                decoration.x * this.tileSize + this.tileSize / 2,
                decoration.y * this.tileSize + this.tileSize / 2,
                spriteKey
            );
            
            this.decorationSprites.add(sprite);
        }
    }
    
    renderBillboards() {
        // Render billboards with Romanian text
        for (const billboard of this.billboards) {
            // Create billboard sprite
            const sprite = this.scene.add.image(
                billboard.x * this.tileSize + this.tileSize / 2,
                billboard.y * this.tileSize + this.tileSize / 2,
                'billboard'
            );
            
            // Add text
            const text = this.scene.add.text(
                billboard.x * this.tileSize + this.tileSize / 2,
                billboard.y * this.tileSize + this.tileSize / 2,
                billboard.text,
                {
                    font: '12px Arial',
                    fill: '#000000',
                    align: 'center',
                    wordWrap: { width: 90 }
                }
            ).setOrigin(0.5);
            
            this.billboardSprites.add(sprite);
            this.billboardSprites.add(text);
        }
    }
    
    renderLandmarks() {
        // Render landmarks
        for (const landmark of this.landmarks) {
            const sprite = this.scene.add.image(
                landmark.x * this.tileSize + this.tileSize / 2,
                landmark.y * this.tileSize + this.tileSize / 2,
                landmark.type
            ).setScale(1.5);
            
            this.landmarkSprites.add(sprite);
        }
    }
    
    renderFinishLine() {
        // Render finish line
        const x = this.finishLine.x * this.tileSize + this.tileSize / 2;
        const y = this.finishLine.y * this.tileSize + this.tileSize / 2;
        
        // Create checkered pattern
        const finishLine = this.scene.add.grid(
            x, y,
            this.tileSize, this.tileSize,
            this.tileSize / 4, this.tileSize / 4,
            0xffffff, 1,
            0x000000, 1
        );
        
        // Add finish text
        this.scene.add.text(
            x, y - 30,
            'FINISH',
            {
                font: 'bold 24px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
    }
}