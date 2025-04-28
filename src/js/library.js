// Library class for managing rooms and book collections
class Library {
    constructor() {
        this.currentRoomX = 0;
        this.currentRoomY = 0;
        this.books = [];
        this.cardCatalog = [];
        
        this.api = new APIHandler();
        this.save = new SaveSystem();
    }
    
    // Initialize the library with a random starting room
    async initialize() {
        // Set a random starting room if no saved position
        const savedPosition = this.save.loadPlayerPosition();
        if (savedPosition) {
            this.currentRoomX = savedPosition.roomX;
            this.currentRoomY = savedPosition.roomY;
        } else {
            this.currentRoomX = Math.floor(Math.random() * CONFIG.librarySize.width);
            this.currentRoomY = Math.floor(Math.random() * CONFIG.librarySize.height);
        }
        
        // Load the current room
        await this.loadRoom(this.currentRoomX, this.currentRoomY);
    }
    
    // Load or generate a room's book catalog
    async loadRoom(roomX, roomY) {
        if (roomX < 0) roomX = 0;
        if (roomX >= CONFIG.librarySize.width) roomX = CONFIG.librarySize.width - 1;
        if (roomY < 0) roomY = 0;
        if (roomY >= CONFIG.librarySize.height) roomY = CONFIG.librarySize.height - 1;
        
        this.currentRoomX = roomX;
        this.currentRoomY = roomY;
        
        // Try to load room catalog from save
        let catalog = await this.save.loadRoomCatalog(roomX, roomY);
        
        // If no saved catalog, generate new one
        if (!catalog) {
            catalog = await this.api.generateRoomCatalog(roomX, roomY);
            
            // Make sure we have the right number of books
            if (catalog && Array.isArray(catalog)) {
                // Trim or pad the catalog to match the expected size
                while (catalog.length > CONFIG.booksPerRoom) {
                    catalog.pop();
                }
                while (catalog.length < CONFIG.booksPerRoom) {
                    catalog.push(`Unnamed Volume ${catalog.length + 1}`);
                }
                
                // Save the generated catalog
                await this.save.saveRoomCatalog(roomX, roomY, catalog);
            } else {
                // Fallback if API fails
                catalog = Array(CONFIG.booksPerRoom).fill().map((_, i) => `Book ${i+1} of Room (${roomX},${roomY})`);
                await this.save.saveRoomCatalog(roomX, roomY, catalog);
            }
        }
        
        // Update the current card catalog
        this.cardCatalog = catalog;
        
        // Create book objects for this room
        this.books = catalog.map((title, index) => new Book(title, roomX, roomY, index));
        
        // Log the room change
        console.log(`Entered room (${roomX}, ${roomY}) with ${this.books.length} books`);
        
        return this.books;
    }
    
    // Move to an adjacent room
    async moveToRoom(direction) {
        let newRoomX = this.currentRoomX;
        let newRoomY = this.currentRoomY;
        
        switch(direction) {
            case 'north':
                newRoomY--;
                break;
            case 'south':
                newRoomY++;
                break;
            case 'east':
                newRoomX++;
                break;
            case 'west':
                newRoomX--;
                break;
        }
        
        // Check if room is within bounds
        if (newRoomX < 0 || newRoomX >= CONFIG.librarySize.width ||
            newRoomY < 0 || newRoomY >= CONFIG.librarySize.height) {
            console.log('Cannot move further in that direction. You have reached the edge of the library.');
            return false;
        }
        
        // Load the new room
        await this.loadRoom(newRoomX, newRoomY);
        return true;
    }
    
    // Get a book by its index
    getBook(index) {
        if (index >= 0 && index < this.books.length) {
            return this.books[index];
        }
        return null;
    }
    
    // Get the position of books and aisles in the room
    getBookPositions() {
        const positions = [];
        const aisleWidth = CONFIG.roomSize.width / CONFIG.aislesPerRoom;
        const bookHeight = 40; // Height of a book on the shelf
        const shelfSpacing = 120; // Vertical space between shelves
        
        for (let aisle = 0; aisle < CONFIG.aislesPerRoom; aisle++) {
            const aisleX = aisle * aisleWidth + aisleWidth/2;
            
            // Books per aisle
            const booksPerAisle = CONFIG.booksPerAisle;
            
            // Books on the left side of the aisle
            for (let i = 0; i < booksPerAisle/2; i++) {
                const bookIndex = aisle * booksPerAisle + i;
                if (bookIndex >= this.books.length) continue;
                
                const shelfLevel = Math.floor(i / 4); // 4 books per shelf level
                const bookPosition = i % 4;
                
                positions.push({
                    index: bookIndex,
                    x: aisleX - aisleWidth/4,
                    y: shelfLevel * shelfSpacing + 100 + bookPosition * (bookHeight + 5),
                    side: 'left'
                });
            }
            
            // Books on the right side of the aisle
            for (let i = 0; i < booksPerAisle/2; i++) {
                const bookIndex = aisle * booksPerAisle + i + booksPerAisle/2;
                if (bookIndex >= this.books.length) continue;
                
                const shelfLevel = Math.floor(i / 4); // 4 books per shelf level
                const bookPosition = i % 4;
                
                positions.push({
                    index: bookIndex,
                    x: aisleX + aisleWidth/4,
                    y: shelfLevel * shelfSpacing + 100 + bookPosition * (bookHeight + 5),
                    side: 'right'
                });
            }
        }
        
        return positions;
    }
    
    // Get information about the current room for rendering
    getRoomInfo() {
        return {
            roomX: this.currentRoomX,
            roomY: this.currentRoomY,
            totalRooms: CONFIG.librarySize.width * CONFIG.librarySize.height,
            cardCatalog: this.cardCatalog,
            bookPositions: this.getBookPositions()
        };
    }
}
