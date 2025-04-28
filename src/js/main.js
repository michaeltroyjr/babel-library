// Main entry point for the Library of Babel game
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Library of Babel...');
    
    // Create and initialize game
    const game = new Game();
    game.initialize();
    
    console.log('Game initialized successfully!');
});
