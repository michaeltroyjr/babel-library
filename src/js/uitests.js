// UI-specific tests
class UITests {
    constructor() {
        this.testsRun = 0;
        this.testsPassed = 0;
        this.testsFailed = 0;
    }    async runTests() {
        console.log('Running UI-specific tests...');
        
        try {
            // Check if we need to create test DOM elements
            this.createTestDOM();
            
            // Create mock game with necessary methods but no rendering
            const game = this.createMockGame();
            
            // Create UI handler with our mock game
            const ui = new UIHandler(game);
            
            // Test dialog behavior
            this.testDialogBehavior(ui);
            
            // Test book container behavior
            this.testBookContainerBehavior(ui);
            
            // Test story flow
            await this.testStoryFlow(game, ui);
        }
        catch (error) {
            console.error('Error during UI tests:', error);
            this.testsFailed++;
        }
    }
    
    createMockGame() {
        // Create a minimal mock of Game class for testing
        const mockGame = {
            isRunning: false,
            library: {
                currentRoomX: 0,
                currentRoomY: 0,
                getBook: (index) => ({
                    title: 'Test Book',
                    currentPage: 1,
                    getPageContent: async () => 'Test content'
                })
            },
            api: {
                generateCharacterStory: async () => 'Test story content'
            },
            save: {
                saveCharacter: () => {},
                saveCharacterStoryToLibrary: async () => {}
            },
            startGame: async () => {},
            startGameLoop: () => { mockGame.isRunning = true; },
            handleInteraction: () => {}
        };
        
        return mockGame;
        
        // Print test results
        console.log(`UI Tests completed: ${this.testsRun} run, ${this.testsPassed} passed, ${this.testsFailed} failed`);
        
        return this.testsFailed === 0;
    }
      createTestDOM() {
        // Check if we need to create test elements
        if (!document.getElementById('dialog-container')) {
            console.log('Creating test DOM elements for UI tests...');
            
            // Create game container and canvas
            const gameContainer = document.createElement('div');
            gameContainer.id = 'game-container';
            
            const gameCanvas = document.createElement('canvas');
            gameCanvas.id = 'game-canvas';
            // Need to set some size for the canvas
            gameCanvas.width = 800;
            gameCanvas.height = 600;
            
            gameContainer.appendChild(gameCanvas);
            
            // Create dialog elements
            const dialogContainer = document.createElement('div');
            dialogContainer.id = 'dialog-container';
            dialogContainer.className = 'hidden';
            
            const dialogContent = document.createElement('div');
            dialogContent.id = 'dialog-content';
            
            const dialogClose = document.createElement('button');
            dialogClose.id = 'dialog-close';
            dialogClose.textContent = 'Close';
            
            dialogContainer.appendChild(dialogContent);
            dialogContainer.appendChild(dialogClose);
            
            // Create book elements
            const bookContainer = document.createElement('div');
            bookContainer.id = 'book-container';
            bookContainer.className = 'hidden';
            
            const bookContent = document.createElement('div');
            bookContent.id = 'book-content';
            
            const bookNavigation = document.createElement('div');
            bookNavigation.id = 'book-navigation';
            
            const prevPageBtn = document.createElement('button');
            prevPageBtn.id = 'prev-page';
            prevPageBtn.textContent = 'Previous Page';
            
            const pageNumber = document.createElement('span');
            pageNumber.id = 'page-number';
            
            const nextPageBtn = document.createElement('button');
            nextPageBtn.id = 'next-page';
            nextPageBtn.textContent = 'Next Page';
            
            const bookClose = document.createElement('button');
            bookClose.id = 'book-close';
            bookClose.textContent = 'Close Book';
            
            bookNavigation.appendChild(prevPageBtn);
            bookNavigation.appendChild(pageNumber);
            bookNavigation.appendChild(nextPageBtn);
            
            bookContainer.appendChild(bookContent);
            bookContainer.appendChild(bookNavigation);
            bookContainer.appendChild(bookClose);
            
            // Create character creation elements
            const characterCreation = document.createElement('div');
            characterCreation.id = 'character-creation';
            characterCreation.style.display = 'none';
            
            const playerNameInput = document.createElement('input');
            playerNameInput.id = 'player-name';
            
            const characterDescInput = document.createElement('textarea');
            characterDescInput.id = 'character-description';
            
            const startGameBtn = document.createElement('button');
            startGameBtn.id = 'start-game';
            startGameBtn.textContent = 'Begin Journey';
            
            characterCreation.appendChild(playerNameInput);
            characterCreation.appendChild(characterDescInput);            characterCreation.appendChild(startGameBtn);
            
            // Add to document
            document.body.appendChild(gameContainer);
            document.body.appendChild(dialogContainer);
            document.body.appendChild(bookContainer);
            document.body.appendChild(characterCreation);
        }
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
    
    testDialogBehavior(ui) {
        console.group('Testing Dialog Behavior');
        
        // Test showing dialog
        ui.showStoryDialog('Test content');
        
        this.assert(
            !ui.dialogContainer.classList.contains('hidden'),
            'Dialog container should be visible when showStoryDialog is called'
        );
        
        this.assert(
            ui.dialogContent.innerHTML === 'Test content',
            'Dialog content should be set correctly'
        );
        
        // Test hiding dialog
        ui.hideDialog();
        
        this.assert(
            ui.dialogContainer.classList.contains('hidden'),
            'Dialog container should be hidden when hideDialog is called'
        );
        
        console.groupEnd();
    }
    
    testBookContainerBehavior(ui) {
        console.group('Testing Book Container Behavior');
        
        // Create a mock book for testing
        const mockBook = {
            title: 'Test Book',
            currentPage: 1,
            getPageContent: async () => 'Test book content'
        };
        
        // Test opening book
        ui.openBook(mockBook);
        
        this.assert(
            !ui.bookContainer.classList.contains('hidden'),
            'Book container should be visible when openBook is called'
        );
        
        this.assert(
            ui.currentBook === mockBook,
            'Current book should be set correctly when openBook is called'
        );
        
        // Test closing book
        ui.closeBook();
        
        this.assert(
            ui.bookContainer.classList.contains('hidden'),
            'Book container should be hidden when closeBook is called'
        );
        
        this.assert(
            ui.bookContainer.style.display === 'none',
            'Book container display should be set to none when closeBook is called'
        );
        
        this.assert(
            ui.currentBook === null,
            'Current book should be set to null when closeBook is called'
        );
        
        console.groupEnd();
    }
    
    async testStoryFlow(game, ui) {
        console.group('Testing Story Flow');
        
        // Mock necessary methods
        const originalShowStoryDialog = ui.showStoryDialog;
        const originalHideDialog = ui.hideDialog;
        const originalStartGameLoop = game.startGameLoop;
        
        let storyDialogShown = false;
        let gameLoopStarted = false;
        
        ui.showStoryDialog = (content) => {
            storyDialogShown = true;
            // Call original but without side effects for testing
            ui._isStoryDialogShowing = true;
        };
        
        ui.hideDialog = () => {
            // Call original but without side effects for testing
            ui._isStoryDialogShowing = false;
        };
        
        game.startGameLoop = () => {
            gameLoopStarted = true;
            game.isRunning = true;
        };
        
        // Test API methods
        const origGenerateCharacterStory = game.api.generateCharacterStory;
        game.api.generateCharacterStory = async () => 'Test story content';
        
        // Mock library and save methods
        game.library.initialize = async () => {};
        game.save.saveCharacter = () => {};
        game.save.saveCharacterStoryToLibrary = async () => {};
        
        // Start game with test character
        await game.startGame('Test Player', 'Test description');
        
        this.assert(
            storyDialogShown,
            'Story dialog should be shown during game start'
        );
        
        this.assert(
            !gameLoopStarted,
            'Game loop should NOT start automatically before story dialog is closed'
        );
          // Simulate closing the story dialog
        // Instead of clicking which might not work in test environment, manually trigger the event handler
        if (typeof ui.dialogClose.click === 'function') {
            ui.dialogClose.click();
        } else {
            // Manually simulate what happens when close button is clicked
            ui.hideDialog();
            if (ui._isStoryDialogShowing && !game.isRunning) {
                ui._isStoryDialogShowing = false;
                game.startGameLoop();
            }
        }
        
        this.assert(
            gameLoopStarted,
            'Game loop should start after story dialog is closed'
        );
        
        // Restore original methods
        ui.showStoryDialog = originalShowStoryDialog;
        ui.hideDialog = originalHideDialog;
        game.startGameLoop = originalStartGameLoop;
        game.api.generateCharacterStory = origGenerateCharacterStory;
        
        console.groupEnd();
    }
}
