// Test suite for Library of Babel
class TestSuite {
    constructor() {
        this.testsRun = 0;
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    async runTests() {
        console.log('Running Library of Babel tests...');
        
        // Test modules initialization
        await this.testModulesLoad();
        
        // Test API Module
        await this.testAPIHandler();
        
        // Test Save System
        await this.testSaveSystem();
        
        // Test Book Class
        await this.testBookClass();
        
        // Test Library Class
        await this.testLibraryClass();
        
        // Test Player Class
        await this.testPlayerClass();
        
        // Print test results
        console.log(`Tests completed: ${this.testsRun} run, ${this.testsPassed} passed, ${this.testsFailed} failed`);
        
        return this.testsFailed === 0;
    }
    
    assert(condition, message) {
        this.testsRun++;
        
        if (condition) {
            console.log(`✓ PASS: ${message}`);
            this.testsPassed++;
            return true;
        } else {
            console.error(`✗ FAIL: ${message}`);
            this.testsFailed++;
            return false;
        }
    }
    
    async testModulesLoad() {
        console.group('Testing module loading');
        
        this.assert(
            typeof CONFIG === 'object',
            'CONFIG object is defined'
        );
        
        this.assert(
            typeof APIHandler === 'function',
            'APIHandler class is defined'
        );
        
        this.assert(
            typeof SaveSystem === 'function',
            'SaveSystem class is defined'
        );
        
        this.assert(
            typeof Book === 'function',
            'Book class is defined'
        );
        
        this.assert(
            typeof Library === 'function',
            'Library class is defined'
        );
        
        this.assert(
            typeof Player === 'function',
            'Player class is defined'
        );
        
        this.assert(
            typeof Game === 'function',
            'Game class is defined'
        );
        
        console.groupEnd();
    }
    
    async testAPIHandler() {
        console.group('Testing API Handler');
        
        const api = new APIHandler();
        
        // Skip actual API tests if no key available to avoid prompts during testing
        if (localStorage.getItem('babel_api_key')) {
            // Mock the API call for testing
            const originalCallAPI = api.callAPI;
            api.callAPI = async (prompt) => {
                return `Test response for prompt: ${prompt.substring(0, 20)}...`;
            };
            
            const story = await api.generateCharacterStory('Test Player', 'A test character');
            this.assert(
                story && story.includes('Test response'),
                'generateCharacterStory returns mock content'
            );
            
            const bookContent = await api.generateBookContent('Test Book');
            this.assert(
                bookContent && bookContent.includes('Test response'),
                'generateBookContent returns mock content'
            );
            
            const catalog = await api.generateRoomCatalog(0, 0);
            this.assert(
                catalog !== null,
                'generateRoomCatalog returns a non-null result'
            );
            
            // Restore original function
            api.callAPI = originalCallAPI;
        } else {
            console.log('Skipping API tests - no API key in localStorage');
        }
        
        console.groupEnd();
    }
    
    async testSaveSystem() {
        console.group('Testing Save System');
        
        const save = new SaveSystem();
        
        // Test character save/load
        const testCharacter = {
            name: 'Test Character',
            description: 'A test character for unit tests'
        };
        
        save.saveCharacter(testCharacter);
        const loadedCharacter = save.loadCharacter();
        
        this.assert(
            loadedCharacter && loadedCharacter.name === testCharacter.name,
            'Character data is correctly saved and loaded'
        );
        
        // Test position save/load
        const testPosition = {
            x: 100, 
            y: 200, 
            roomX: 10, 
            roomY: 20
        };
        
        save.savePlayerPosition(testPosition.x, testPosition.y, testPosition.roomX, testPosition.roomY);
        const loadedPosition = save.loadPlayerPosition();
        
        this.assert(
            loadedPosition && 
            loadedPosition.x === testPosition.x && 
            loadedPosition.roomX === testPosition.roomX,
            'Player position is correctly saved and loaded'
        );
        
        // Test room catalog save/load
        const testCatalog = ['Book 1', 'Book 2', 'Book 3'];
        await save.saveRoomCatalog(5, 5, testCatalog);
        const loadedCatalog = await save.loadRoomCatalog(5, 5);
        
        this.assert(
            Array.isArray(loadedCatalog) && 
            loadedCatalog.length === testCatalog.length && 
            loadedCatalog[0] === testCatalog[0],
            'Room catalog is correctly saved and loaded'
        );
        
        // Test book content save/load
        const testContent = 'This is test book content for page 1';
        await save.saveBookContent(5, 5, 1, 1, testContent);
        const loadedContent = await save.loadBookContent(5, 5, 1, 1);
        
        this.assert(
            loadedContent === testContent,
            'Book content is correctly saved and loaded'
        );
        
        console.groupEnd();
    }
    
    async testBookClass() {
        console.group('Testing Book Class');
        
        // Create a test book
        const testBook = new Book('Test Book Title', 3, 3, 5);
        
        this.assert(
            testBook.title === 'Test Book Title' && 
            testBook.roomX === 3 && 
            testBook.bookIndex === 5,
            'Book initializes with correct properties'
        );
        
        // Mock the API and save functions for testing
        testBook.api.generateBookContent = async () => 'Generated test content for page';
        testBook.save.loadBookContent = async () => null;
        testBook.save.saveBookContent = async () => true;
        
        const content = await testBook.getPageContent();
        
        this.assert(
            content.includes('Generated test content'),
            'Book getPageContent works when no saved content exists'
        );
        
        // Test page navigation
        testBook.currentPage = 1;
        await testBook.nextPage();
        
        this.assert(
            testBook.currentPage === 2,
            'nextPage increments current page'
        );
        
        await testBook.prevPage();
        
        this.assert(
            testBook.currentPage === 1,
            'prevPage decrements current page'
        );
        
        // Test going below page 1
        await testBook.prevPage();
        
        this.assert(
            testBook.currentPage === 1,
            'prevPage does not go below page 1'
        );
        
        console.groupEnd();
    }
    
    async testLibraryClass() {
        console.group('Testing Library Class');
        
        const library = new Library();
        
        // Mock API and save system for testing
        library.api.generateRoomCatalog = async () => ['Test Book 1', 'Test Book 2', 'Test Book 3'];
        library.save.loadRoomCatalog = async () => null;
        library.save.saveRoomCatalog = async () => true;
        
        await library.loadRoom(10, 10);
        
        this.assert(
            library.currentRoomX === 10 && library.currentRoomY === 10,
            'Library loadRoom sets current room coordinates'
        );
        
        this.assert(
            Array.isArray(library.books) && library.books.length > 0,
            'Library loadRoom creates book objects'
        );
        
        this.assert(
            Array.isArray(library.cardCatalog) && library.cardCatalog.length > 0,
            'Library has a card catalog after loading room'
        );
        
        // Test room movement
        const origX = library.currentRoomX;
        await library.moveToRoom('east');
        
        this.assert(
            library.currentRoomX === origX + 1,
            'moveToRoom east increases X coordinate'
        );
        
        const origY = library.currentRoomY;
        await library.moveToRoom('north');
        
        this.assert(
            library.currentRoomY === origY - 1,
            'moveToRoom north decreases Y coordinate'
        );
        
        console.groupEnd();
    }
    
    async testPlayerClass() {
        console.group('Testing Player Class');
        
        const player = new Player('Test Player', 'A test player');
        
        this.assert(
            player.name === 'Test Player' && player.description === 'A test player',
            'Player initializes with correct properties'
        );
        
        // Test movement
        const originalX = player.x;
        player.moveRight = true;
        player.update({ roomX: 0, roomY: 0, bookPositions: [] });
        
        this.assert(
            player.x > originalX,
            'Player moves right when moveRight is true'
        );
        
        player.moveRight = false;
        player.moveLeft = true;
        const currentX = player.x;
        player.update({ roomX: 0, roomY: 0, bookPositions: [] });
        
        this.assert(
            player.x < currentX,
            'Player moves left when moveLeft is true'
        );
        
        // Test key handling
        player.handleKeyDown({ key: 'w' });
        
        this.assert(
            player.moveUp === true,
            'Player sets moveUp flag when W is pressed'
        );
        
        player.handleKeyUp({ key: 'w' });
        
        this.assert(
            player.moveUp === false,
            'Player clears moveUp flag when W is released'
        );
        
        console.groupEnd();
    }
}

// Run tests when this file is loaded
window.runBabelTests = async function() {
    // Run the main test suite first
    const testSuite = new TestSuite();
    const mainTestsResult = await testSuite.runTests();
    
    console.log('\n---------------------------------------------\n');
    
    // Then run the UI-specific tests
    const uiTestSuite = new UITests();
    const uiTestsResult = await uiTestSuite.runTests();
    
    // Only pass if both test suites pass
    return mainTestsResult && uiTestsResult;
};
