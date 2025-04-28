// Game controller class
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.library = new Library();
        this.player = null;
        this.ui = new UIHandler(this);
        
        this.api = new APIHandler();
        this.save = new SaveSystem();
        
        this.isRunning = false;
        this.lastTimestamp = 0;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Input handling
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    // Resize canvas to fill the container
    resizeCanvas() {
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Set game room size based on canvas
        CONFIG.roomSize.width = this.canvas.width;
        CONFIG.roomSize.height = this.canvas.height;
    }
    
    // Initialize the game
    async initialize() {
        // Check for saved character
        const savedCharacter = this.save.loadCharacter();
        
        if (savedCharacter) {
            // Continue with saved character
            this.player = new Player(savedCharacter.name, savedCharacter.description);
            await this.library.initialize();
            this.player.initialize();
            
            this.isRunning = true;
            this.lastTimestamp = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        } else {
            // New game - show character creation
            this.ui.showCharacterCreation();
        }
    }
      // Start a new game with character info
    async startGame(name, description) {
        // Create new player
        this.player = new Player(name, description);
        
        // Create character data
        const characterData = {
            name,
            description,
            creationDate: new Date().toISOString()
        };
        
        // Save character
        this.save.saveCharacter(characterData);
        
        // Initialize library in the background
        const libraryPromise = this.library.initialize();
        
        // Generate character story
        this.ui.showStoryDialog('<p>Generating your story, please wait...</p>');
        const story = await this.api.generateCharacterStory(name, description);
        
        // Wait for library to initialize
        await libraryPromise;
        this.player.initialize();
        
        if (story) {
            // Show story dialog - the game loop will start after this dialog is closed
            this.ui.showStoryDialog(`
                <h2>Your Story</h2>
                ${story}
                <div class="story-instructions">
                    <p class="instruction-text">Read your story and click "Close" below when you're ready to begin exploring.</p>
                </div>
            `);
            
            // Save character's story in a random book
            await this.save.saveCharacterStoryToLibrary(characterData, story);
        } else {
            // Fallback if API fails
            this.ui.showStoryDialog(`
                <h2>Your Story</h2>
                <p>The ancient librarian looks at you with knowing eyes.</p>
                <p>"Welcome, ${name}, to the Library of Babel. I've been expecting you. The knowledge you seek is here, somewhere among our infinite collection. Your journey begins now."</p>
                <div class="story-instructions">
                    <p class="instruction-text">Click "Close" below when you're ready to begin exploring.</p>
                </div>
            `);
        }
        
        // We'll start the game loop only after the user closes the story dialog
        console.log('Game initialized, waiting for user to close story dialog before starting');
    }
    
    // Start the game loop - called after story dialog is closed
    startGameLoop() {
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        console.log('Game loop started');
    }
    
    // Main game loop
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // Only update and render if game is running
        if (this.isRunning) {
            this.update(deltaTime);
            this.render();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    // Update game state
    update(deltaTime) {
        if (this.player && this.library) {
            // Update player
            const roomInfo = this.library.getRoomInfo();
            this.player.update(roomInfo);
        }
    }
    
    // Render game
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.player || !this.library) return;
        
        // Get room information
        const roomInfo = this.library.getRoomInfo();
        
        // Render bookshelves
        this.renderBookshelves(roomInfo);
        
        // Render exits
        this.renderExits();
        
        // Render card catalog at north end
        this.renderCardCatalog();
        
        // Render player
        this.player.render(this.ctx);
        
        // Render room info
        this.renderRoomInfo(roomInfo);
    }
    
    // Render bookshelves and books
    renderBookshelves(roomInfo) {
        const bookPositions = roomInfo.bookPositions;
        const aisleWidth = CONFIG.roomSize.width / CONFIG.aislesPerRoom;
        
        // Draw aisles (vertical lines)
        this.ctx.strokeStyle = '#6b5b3d';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i <= CONFIG.aislesPerRoom; i++) {
            const x = i * aisleWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CONFIG.roomSize.height);
            this.ctx.stroke();
        }
        
        // Draw bookshelves
        this.ctx.fillStyle = '#8b4513'; // Brown color for shelves
        
        // Draw horizontal shelves
        for (let aisle = 0; aisle < CONFIG.aislesPerRoom; aisle++) {
            const aisleX = aisle * aisleWidth;
            
            for (let shelf = 0; shelf < 5; shelf++) { // 5 shelves per aisle
                const shelfY = shelf * 120 + 100;
                
                // Left shelf
                this.ctx.fillRect(
                    aisleX + 10, 
                    shelfY, 
                    aisleWidth/2 - 20, 
                    10
                );
                
                // Right shelf
                this.ctx.fillRect(
                    aisleX + aisleWidth/2 + 10, 
                    shelfY, 
                    aisleWidth/2 - 20, 
                    10
                );
            }
        }
        
        // Draw books
        bookPositions.forEach(book => {
            // Determine if this book is currently highlighted
            const isHighlighted = (book.index === this.player.nearbyBookIndex);
            
            // Choose color based on highlight status
            this.ctx.fillStyle = isHighlighted ? '#d4af37' : '#3a6ea5';
            
            // Draw book
            this.ctx.fillRect(
                book.x - 10, 
                book.y - 20, 
                20, 
                40
            );
            
            // Draw book title if highlighted
            if (isHighlighted && roomInfo.cardCatalog[book.index]) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                
                // Truncate long titles
                let title = roomInfo.cardCatalog[book.index];
                if (title.length > 25) {
                    title = title.substring(0, 22) + '...';
                }
                
                this.ctx.fillText(title, book.x, book.y + 30);
            }
        });
    }
    
    // Render room exits
    renderExits() {
        this.ctx.fillStyle = '#444444';
        
        // North exit
        this.ctx.fillRect(
            CONFIG.roomSize.width/2 - 30, 
            0, 
            60, 
            20
        );
        
        // South exit
        this.ctx.fillRect(
            CONFIG.roomSize.width/2 - 30, 
            CONFIG.roomSize.height - 20, 
            60, 
            20
        );
        
        // East exit
        this.ctx.fillRect(
            CONFIG.roomSize.width - 20, 
            CONFIG.roomSize.height/2 - 30, 
            20, 
            60
        );
        
        // West exit
        this.ctx.fillRect(
            0, 
            CONFIG.roomSize.height/2 - 30, 
            20, 
            60
        );
    }
    
    // Render card catalog
    renderCardCatalog() {
        this.ctx.fillStyle = '#d4af37';
        
        // Draw catalog desk
        this.ctx.fillRect(
            CONFIG.roomSize.width/2 - 50,
            40,
            100,
            30
        );
        
        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Card Catalog', CONFIG.roomSize.width/2, 30);
    }
    
    // Render room info
    renderRoomInfo(roomInfo) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(
            `Room: (${roomInfo.roomX}, ${roomInfo.roomY})`, 
            10, 
            20
        );
    }
    
    // Handle keyboard input
    handleKeyDown(event) {
        // Pass to player if exists
        if (this.player) {
            this.player.handleKeyDown(event);
            
            // Interaction key
            if (event.key.toLowerCase() === 'e') {
                this.handleInteraction();
            }
        }
    }
    
    handleKeyUp(event) {
        // Pass to player if exists
        if (this.player) {
            this.player.handleKeyUp(event);
        }
    }
    
    // Handle player interaction with objects
    handleInteraction() {
        if (!this.player || !this.library) return;
        
        // Check for book interaction
        if (this.player.nearbyBookIndex >= 0) {
            const book = this.library.getBook(this.player.nearbyBookIndex);
            if (book) {
                this.ui.openBook(book);
                return;
            }
        }
        
        // Check for card catalog interaction
        if (this.player.isAtCardCatalog) {
            this.ui.showCardCatalog(this.library.cardCatalog);
            return;
        }
        
        // Check for exit interaction
        if (this.player.isAtExit) {
            this.useExit(this.player.isAtExit);
            return;
        }
    }
    
    // Use an exit to go to another room
    async useExit(direction) {
        const success = await this.library.moveToRoom(direction);
        
        if (success) {
            // Move player to opposite entrance
            switch (direction) {
                case 'north':
                    this.player.x = CONFIG.roomSize.width / 2;
                    this.player.y = CONFIG.roomSize.height - 40;
                    break;
                case 'south':
                    this.player.x = CONFIG.roomSize.width / 2;
                    this.player.y = 40;
                    break;
                case 'east':
                    this.player.x = 40;
                    this.player.y = CONFIG.roomSize.height / 2;
                    break;
                case 'west':
                    this.player.x = CONFIG.roomSize.width - 40;
                    this.player.y = CONFIG.roomSize.height / 2;
                    break;
            }
            
            // UI notification
            this.ui.showNotification(`Entered room (${this.library.currentRoomX}, ${this.library.currentRoomY})`);
        } else {
            this.ui.showNotification('You cannot go further in that direction.');
        }
    }
}
