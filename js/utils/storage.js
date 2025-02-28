/**
 * Game Storage Utility
 * Handles saving and loading game progress using localStorage
 */
const GameStorage = {
    /**
     * Save game state to localStorage
     * @param {Object} gameState - The current game state
     */
    saveGame: function(gameState) {
        try {
            const gameData = {
                currentCity: gameState.currentCity,
                playerStats: gameState.playerStats,
                missions: gameState.missions,
                upgrades: gameState.upgrades,
                availableUpgradePoints: gameState.availableUpgradePoints
            };
            localStorage.setItem('rogueRacerSave', JSON.stringify(gameData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    },

    /**
     * Load game state from localStorage
     * @returns {Object|null} The saved game state or null if no save exists
     */
    loadGame: function() {
        try {
            const savedData = localStorage.getItem('rogueRacerSave');
            if (savedData) {
                console.log('Game loaded successfully');
                return JSON.parse(savedData);
            }
            return null;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    },

    /**
     * Clear saved game data
     * @returns {boolean} True if successful, false otherwise
     */
    clearSave: function() {
        try {
            localStorage.removeItem('rogueRacerSave');
            console.log('Save data cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear save data:', error);
            return false;
        }
    }
};