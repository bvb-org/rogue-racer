/**
 * Track Generator
 * Handles procedural generation of tracks for each city
 * Enhanced with intersections, dead-ends, and more complex road networks
 */
class Track {
    constructor(scene, city) {
        this.scene = scene;
        this.city = city;
        this.tileSize = 32;
        this.roadWidth = 2; // Number of tiles
        this.trackLength = 150; // Length of track in tiles
        this.minStartFinishDistance = 75; // Minimum distance between start and finish (in tiles)
        this.intersectionChance = 0.3; // Chance to create an intersection
        this.deadEndChance = 0.4; // Chance for a branch to be a dead end
        this.maxBranches = 3; // Maximum number of branches from the main path
        
        // Track properties based on city
        this.cityProperties = {
            'Bucharest': {
                curviness: 0.3, // Lower means straighter roads
                obstacles: 0.4, // Density of obstacles
                buildings: 0.7, // Density of buildings
                intersections: 0.25, // Density of intersections
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
                intersections: 0.3, // More intersections in mountain roads
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
                intersections: 0.35, // More complex road network
                landmarks: [],
                billboards: [
                    'Bine ați venit în Cluj-Napoca!',
                    'Capitala IT a României',
                    'Untold Festival',
                    'Vizitați Salina Turda'
                ]
            },
            'Timisoara': {
                curviness: 0.4, // Slightly curvier than Bucharest
                obstacles: 0.45, // More obstacles than Cluj-Napoca
                buildings: 0.6, // Same as Cluj-Napoca
                intersections: 0.3, // Medium intersection density
                landmarks: [],
                billboards: [
                    'Bine ați venit în Timișoara!',
                    'Capitala Culturală Europeană',
                    'Piața Unirii',
                    'Catedrala Metropolitană'
                ]
            },
            'Iasi': {
                curviness: 0.6, // More curves than Cluj-Napoca
                obstacles: 0.5, // Same as Brașov
                buildings: 0.5, // Medium building density
                intersections: 0.4, // Higher intersection density
                landmarks: [],
                billboards: [
                    'Bine ați venit în Iași!',
                    'Palatul Culturii',
                    'Universitatea Alexandru Ioan Cuza',
                    'Grădina Botanică'
                ]
            },
            'Vaslui': {
                curviness: 0.8, // Most curves (challenging roads)
                obstacles: 0.6, // Highest obstacle density
                buildings: 0.3, // Lower building density
                intersections: 0.45, // Most complex road network
                landmarks: [],
                billboards: [
                    'Bine ați venit în Vaslui!',
                    'Muzeul Județean Ștefan cel Mare',
                    'Centrul Civic',
                    'Parcul Copou'
                ]
            }
        };
        
        // Track data
        this.trackData = [];
        this.roadPath = []; // Main path from start to finish
        this.allRoadTiles = new Set(); // All road tiles including branches
        this.branchPaths = []; // Additional branch paths
        this.deadEnds = []; // Dead-end paths
        this.obstacles = [];
        this.decorations = [];
        this.billboards = [];
        this.landmarks = [];
        this.finishLine = null;
        this.startPoint = { x: 0, y: 0 };
        this.finishPoint = null;
        
        // Generate the track
        this.generateTrack();
    }
    
    generateTrack() {
        // Get properties for current city
        const props = this.cityProperties[this.city];
        
        // Generate main road path
        this.generateMainRoadPath(props.curviness);
        
        // Generate intersections and branches
        this.generateIntersections(props.intersections);
        
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
    
    generateMainRoadPath(curviness) {
        // Start with a straight section
        let x = 0;
        let y = 0;
        let direction = 0; // 0 = up, 1 = right, 2 = down, 3 = left
        
        // Add starting point
        this.roadPath.push({ x, y });
        this.allRoadTiles.add(`${x},${y}`);
        
        // Generate path with natural curves
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
            
            // Check if this position is already in the path (avoid loops)
            const posKey = `${x},${y}`;
            if (this.allRoadTiles.has(posKey)) {
                // Try a different direction
                const newDirection = (direction + 1 + Math.floor(Math.random() * 3)) % 4;
                direction = newDirection;
                
                // Reset position and try again
                x = this.roadPath[i-1].x;
                y = this.roadPath[i-1].y;
                
                // Move in new direction
                switch (direction) {
                    case 0: y--; break; // Up
                    case 1: x++; break; // Right
                    case 2: y++; break; // Down
                    case 3: x--; break; // Left
                }
            }
            
            // Add point to path
            this.roadPath.push({ x, y });
            this.allRoadTiles.add(`${x},${y}`);
        }
        
        // Ensure minimum distance between start and finish
        this.ensureMinStartFinishDistance();
        
        // Normalize path to start at (0,0)
        this.normalizeCoordinates();
    }
    
    ensureMinStartFinishDistance() {
        // Calculate direct distance between start and finish
        const start = this.roadPath[0];
        const finish = this.roadPath[this.roadPath.length - 1];
        const distance = Math.sqrt(
            Math.pow(finish.x - start.x, 2) +
            Math.pow(finish.y - start.y, 2)
        );
        
        // If distance is too small, extend the path
        if (distance < this.minStartFinishDistance) {
            // Get properties for current city to maintain curviness
            const props = this.cityProperties[this.city];
            const curviness = props.curviness;
            
            // Start with the last direction
            let direction = this.getLastDirection();
            let x = finish.x;
            let y = finish.y;
            
            // Extend with natural curves until we reach minimum distance
            while (Math.sqrt(
                Math.pow(x - start.x, 2) +
                Math.pow(y - start.y, 2)
            ) < this.minStartFinishDistance) {
                // Determine if we should change direction (using city's curviness)
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
                
                // Check if this position is already in the path (avoid loops)
                const posKey = `${x},${y}`;
                if (this.allRoadTiles.has(posKey)) {
                    // Try a different direction
                    direction = (direction + 1) % 4;
                    
                    // Reset position and try again
                    x = this.roadPath[this.roadPath.length - 1].x;
                    y = this.roadPath[this.roadPath.length - 1].y;
                    
                    // Move in new direction
                    switch (direction) {
                        case 0: y--; break; // Up
                        case 1: x++; break; // Right
                        case 2: y++; break; // Down
                        case 3: x--; break; // Left
                    }
                }
                
                // Add point to path
                this.roadPath.push({ x, y });
                this.allRoadTiles.add(`${x},${y}`);
            }
        }
    }
    
    getLastDirection() {
        // Determine the direction of the last segment
        const last = this.roadPath[this.roadPath.length - 1];
        const secondLast = this.roadPath[this.roadPath.length - 2];
        
        const dx = last.x - secondLast.x;
        const dy = last.y - secondLast.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 1 : 3; // Right or Left
        } else {
            return dy > 0 ? 2 : 0; // Down or Up
        }
    }
    
    normalizeCoordinates() {
        // Get all coordinates including branches
        const allCoords = Array.from(this.allRoadTiles).map(pos => {
            const [x, y] = pos.split(',').map(Number);
            return { x, y };
        });
        
        // Find minimum x and y
        const minX = Math.min(...allCoords.map(p => p.x));
        const minY = Math.min(...allCoords.map(p => p.y));
        
        // Normalize main path
        this.roadPath = this.roadPath.map(p => ({
            x: p.x - minX,
            y: p.y - minY
        }));
        
        // Normalize branch paths
        this.branchPaths = this.branchPaths.map(branch =>
            branch.map(p => ({
                x: p.x - minX,
                y: p.y - minY
            }))
        );
        
        // Normalize dead ends
        this.deadEnds = this.deadEnds.map(branch =>
            branch.map(p => ({
                x: p.x - minX,
                y: p.y - minY
            }))
        );
        
        // Update all road tiles set
        this.allRoadTiles.clear();
        this.roadPath.forEach(p => this.allRoadTiles.add(`${p.x},${p.y}`));
        this.branchPaths.forEach(branch =>
            branch.forEach(p => this.allRoadTiles.add(`${p.x},${p.y}`))
        );
        this.deadEnds.forEach(branch =>
            branch.forEach(p => this.allRoadTiles.add(`${p.x},${p.y}`))
        );
        
        // Set start and finish points
        this.startPoint = this.roadPath[0];
        this.finishPoint = this.roadPath[this.roadPath.length - 1];
    }
    
    generateIntersections(intersectionDensity) {
        // Create intersections along the main path
        const branchPoints = [];
        
        // Skip the first and last 20% of the main path for branches
        const startSkip = Math.floor(this.roadPath.length * 0.2);
        const endSkip = Math.floor(this.roadPath.length * 0.8);
        
        // Find potential branch points
        for (let i = startSkip; i < endSkip; i += 10) {
            if (Math.random() < intersectionDensity) {
                branchPoints.push(i);
            }
        }
        
        // Limit the number of branches
        const numBranches = Math.min(branchPoints.length, this.maxBranches);
        
        // Create branches
        for (let i = 0; i < numBranches; i++) {
            const branchIndex = branchPoints[i];
            const branchPoint = this.roadPath[branchIndex];
            
            // Determine if this should be a dead end
            const isDeadEnd = Math.random() < this.deadEndChance;
            
            // Create branch
            const branchLength = Math.floor(Math.random() * 30) + 20; // 20-50 tiles
            const branch = this.createBranch(branchPoint, branchLength, isDeadEnd);
            
            // Add branch to appropriate collection
            if (isDeadEnd) {
                this.deadEnds.push(branch);
            } else {
                this.branchPaths.push(branch);
            }
        }
    }
    
    createBranch(startPoint, length, isDeadEnd) {
        const branch = [];
        let x = startPoint.x;
        let y = startPoint.y;
        
        // Determine initial direction (different from main path)
        const mainPathDirection = this.getDirectionAt(this.roadPath.findIndex(p =>
            p.x === startPoint.x && p.y === startPoint.y
        ));
        
        // Choose a direction that's perpendicular to the main path
        let direction;
        if (mainPathDirection === 0 || mainPathDirection === 2) {
            // Main path is vertical, branch horizontally
            direction = Math.random() < 0.5 ? 1 : 3;
        } else {
            // Main path is horizontal, branch vertically
            direction = Math.random() < 0.5 ? 0 : 2;
        }
        
        // Add starting point
        branch.push({ x, y });
        
        // Generate branch path
        for (let i = 1; i < length; i++) {
            // Occasionally change direction
            if (Math.random() < 0.2) {
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
            
            // Check if this position is already in any path
            const posKey = `${x},${y}`;
            if (this.allRoadTiles.has(posKey)) {
                // If this is not a dead end, we can connect to existing roads
                if (!isDeadEnd && i > length / 2) {
                    branch.push({ x, y });
                    break;
                }
                
                // Otherwise, try a different direction
                const newDirection = (direction + 1 + Math.floor(Math.random() * 3)) % 4;
                direction = newDirection;
                
                // Reset position and try again
                x = branch[i-1].x;
                y = branch[i-1].y;
                
                // Move in new direction
                switch (direction) {
                    case 0: y--; break; // Up
                    case 1: x++; break; // Right
                    case 2: y++; break; // Down
                    case 3: x--; break; // Left
                }
            }
            
            // Add point to branch
            branch.push({ x, y });
            this.allRoadTiles.add(posKey);
        }
        
        return branch;
    }
    
    getDirectionAt(index) {
        // Determine the direction at a specific point in the path
        if (index < 0 || index >= this.roadPath.length - 1) {
            return 0;
        }
        
        const current = this.roadPath[index];
        const next = this.roadPath[index + 1];
        
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 1 : 3; // Right or Left
        } else {
            return dy > 0 ? 2 : 0; // Down or Up
        }
    }
    
    generateObstacles(density) {
        // Add obstacles along all road paths
        const reducedDensity = density / 3;
        
        // Add obstacles along main path
        this.addObstaclesToPath(this.roadPath, reducedDensity, 10, this.roadPath.length - 5);
        
        // Add obstacles along branch paths
        this.branchPaths.forEach(branch => {
            this.addObstaclesToPath(branch, reducedDensity * 0.8, 5, branch.length - 3);
        });
        
        // Add obstacles along dead ends
        this.deadEnds.forEach(deadEnd => {
            this.addObstaclesToPath(deadEnd, reducedDensity * 1.2, 5, deadEnd.length - 3);
        });
    }
    
    addObstaclesToPath(path, density, startOffset, endIndex) {
        // Skip segments to reduce count
        for (let i = startOffset; i < endIndex; i += 3) {
            if (Math.random() < density) {
                // Get current road segment
                const segment = path[i];
                
                // Determine obstacle position (left or right of road)
                const side = Math.random() > 0.5 ? 1 : -1;
                const offset = Math.floor(Math.random() * 2) + 2; // 2-3 tiles away
                
                // Calculate obstacle position
                let obstacleX, obstacleY;
                
                // Determine direction of road segment
                const nextSegment = path[Math.min(i + 1, path.length - 1)];
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
                
                // Check if position is already occupied
                const posKey = `${obstacleX},${obstacleY}`;
                if (!this.allRoadTiles.has(posKey)) {
                    // Add obstacle - only use drones near the road, not on it
                    this.obstacles.push({
                        x: obstacleX,
                        y: obstacleY,
                        type: 'drone'
                    });
                }
            }
        }
    }
    
    generateDecorations(buildingDensity) {
        // Add decorations around all road paths
        const maxDistance = 15; // Maximum distance from road
        
        // Create a grid to track occupied positions
        const occupiedPositions = new Set();
        
        // Mark all road positions as occupied
        this.allRoadTiles.forEach(posKey => {
            const [x, y] = posKey.split(',').map(Number);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    occupiedPositions.add(`${x + dx},${y + dy}`);
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
        // Add billboards with Romanian text along all paths
        const billboardCount = Math.min(texts.length, 5);
        
        // Place billboards along main path
        const mainPathBillboards = Math.ceil(billboardCount * 0.6); // 60% on main path
        this.addBillboardsToPath(this.roadPath, texts.slice(0, mainPathBillboards), mainPathBillboards);
        
        // Place remaining billboards on branches
        let remainingTexts = texts.slice(mainPathBillboards);
        
        // Distribute remaining billboards between branches and dead ends
        if (remainingTexts.length > 0 && this.branchPaths.length > 0) {
            const branchBillboards = Math.min(remainingTexts.length, this.branchPaths.length);
            
            for (let i = 0; i < branchBillboards; i++) {
                const branch = this.branchPaths[i % this.branchPaths.length];
                this.addBillboardsToPath(branch, [remainingTexts[i]], 1);
            }
        }
    }
    
    addBillboardsToPath(path, texts, count) {
        if (path.length < 10 || texts.length === 0) return;
        
        const segmentLength = Math.floor(path.length / (count + 1));
        
        for (let i = 1; i <= count; i++) {
            const segmentIndex = i * segmentLength;
            if (segmentIndex >= path.length) continue;
            
            const segment = path[segmentIndex];
            
            // Determine billboard position (left or right of road)
            const side = Math.random() > 0.5 ? 1 : -1;
            const offset = 2;
            
            // Calculate billboard position
            let billboardX, billboardY;
            
            // Determine direction of road segment
            const nextSegment = path[Math.min(segmentIndex + 1, path.length - 1)];
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
        const lastSegment = this.roadPath[this.roadPath.length - 1];
        const prevSegment = this.roadPath[this.roadPath.length - 2];
        
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
        // Check if position is near any road segment (main path, branches, or dead ends)
        
        // Check main path
        for (const segment of this.roadPath) {
            const distance = Math.sqrt(
                Math.pow(segment.x - x, 2) +
                Math.pow(segment.y - y, 2)
            );
            
            if (distance <= maxDistance) {
                return true;
            }
        }
        
        // Check branch paths
        for (const branch of this.branchPaths) {
            for (const segment of branch) {
                const distance = Math.sqrt(
                    Math.pow(segment.x - x, 2) +
                    Math.pow(segment.y - y, 2)
                );
                
                if (distance <= maxDistance) {
                    return true;
                }
            }
        }
        
        // Check dead ends
        for (const deadEnd of this.deadEnds) {
            for (const segment of deadEnd) {
                const distance = Math.sqrt(
                    Math.pow(segment.x - x, 2) +
                    Math.pow(segment.y - y, 2)
                );
                
                if (distance <= maxDistance) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    getMaxX() {
        // Get maximum X coordinate from all road segments
        let maxX = Math.max(...this.roadPath.map(p => p.x));
        
        // Check branch paths
        this.branchPaths.forEach(branch => {
            if (branch.length > 0) {
                maxX = Math.max(maxX, ...branch.map(p => p.x));
            }
        });
        
        // Check dead ends
        this.deadEnds.forEach(deadEnd => {
            if (deadEnd.length > 0) {
                maxX = Math.max(maxX, ...deadEnd.map(p => p.x));
            }
        });
        
        return maxX;
    }
    
    getMaxY() {
        // Get maximum Y coordinate from all road segments
        let maxY = Math.max(...this.roadPath.map(p => p.y));
        
        // Check branch paths
        this.branchPaths.forEach(branch => {
            if (branch.length > 0) {
                maxY = Math.max(maxY, ...branch.map(p => p.y));
            }
        });
        
        // Check dead ends
        this.deadEnds.forEach(deadEnd => {
            if (deadEnd.length > 0) {
                maxY = Math.max(maxY, ...deadEnd.map(p => p.y));
            }
        });
        
        return maxY;
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
        const finishSegment = this.roadPath[this.roadPath.length - 1];
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
        // Render all road paths
        this.renderRoadPath(this.roadPath);
        
        // Render branch paths
        this.branchPaths.forEach(branch => {
            this.renderRoadPath(branch);
        });
        
        // Render dead ends
        this.deadEnds.forEach(deadEnd => {
            this.renderRoadPath(deadEnd);
        });
        
        // Add visual indicators at intersections
        this.markIntersections();
    }
    
    renderRoadPath(path) {
        // Render road tiles for a path
        for (const segment of path) {
            this.roadTiles.create(
                segment.x * this.tileSize + this.tileSize / 2,
                segment.y * this.tileSize + this.tileSize / 2,
                'road'
            );
        }
    }
    
    markIntersections() {
        // Add visual indicators at intersection points
        // Find points where branches connect to the main path
        this.branchPaths.forEach(branch => {
            if (branch.length > 0) {
                const startPoint = branch[0];
                
                // Create a small marker at the intersection
                const marker = this.scene.add.circle(
                    startPoint.x * this.tileSize + this.tileSize / 2,
                    startPoint.y * this.tileSize + this.tileSize / 2,
                    this.tileSize / 6,
                    0xffff00,
                    0.7
                );
            }
        });
        
        // Mark dead ends with red indicators
        this.deadEnds.forEach(deadEnd => {
            if (deadEnd.length > 0) {
                const endPoint = deadEnd[deadEnd.length - 1];
                
                // Create a small marker at the dead end
                const marker = this.scene.add.circle(
                    endPoint.x * this.tileSize + this.tileSize / 2,
                    endPoint.y * this.tileSize + this.tileSize / 2,
                    this.tileSize / 6,
                    0xff0000,
                    0.7
                );
            }
        });
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