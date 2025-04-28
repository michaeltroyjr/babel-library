// Game Configuration
const CONFIG = {
    // Library Settings
    librarySize: {
        width: 256,
        height: 256
    },
    roomSize: {
        width: 800,
        height: 600
    },
    booksPerRoom: 100,
    aislesPerRoom: 5,
    booksPerAisle: 20,
    
    // Player Settings
    playerSpeed: 3,
    playerSize: 32,
    
    // Book Settings
    wordsPerPage: 500,
    
    // API Settings
    // Note: In a real application, API keys would not be stored in client-side code
    apiURL: 'https://api.openai.com/v1/chat/completions',
    apiModel: 'gpt-3.5-turbo',
    
    // Debug Settings
    debug: true,
    useMockData: true,  // Set to true to always use mock data instead of real API calls
    debugControls: true, // Show debug controls on screen
    showFPS: true,      // Show frames per second counter
    logEvents: true     // Log major events to console
};
