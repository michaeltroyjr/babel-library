// Save System for the Library of Babel
class SaveSystem {
    constructor() {
        this.savePrefix = 'babel_';
        this.roomCatalogs = {}; // Cache for room catalogs
        this.bookContents = {}; // Cache for book contents
    }

    // Character data
    saveCharacter(characterData) {
        localStorage.setItem(`${this.savePrefix}character`, JSON.stringify(characterData));
    }

    loadCharacter() {
        const data = localStorage.getItem(`${this.savePrefix}character`);
        return data ? JSON.parse(data) : null;
    }

    // Player position
    savePlayerPosition(x, y, roomX, roomY) {
        localStorage.setItem(`${this.savePrefix}player_pos`, JSON.stringify({
            x, y, roomX, roomY
        }));
    }

    loadPlayerPosition() {
        const data = localStorage.getItem(`${this.savePrefix}player_pos`);
        return data ? JSON.parse(data) : null;
    }

    // Room catalog data
    async saveRoomCatalog(roomX, roomY, catalog) {
        const roomKey = `${roomX},${roomY}`;
        
        // Save to cache
        this.roomCatalogs[roomKey] = catalog;
        
        // Save to local storage (we may need to chunk this data if it's large)
        localStorage.setItem(`${this.savePrefix}room_${roomKey}`, JSON.stringify(catalog));
        
        // Also save the list of rooms we have data for
        const rooms = this.getKnownRooms();
        if (!rooms.includes(roomKey)) {
            rooms.push(roomKey);
            localStorage.setItem(`${this.savePrefix}known_rooms`, JSON.stringify(rooms));
        }
    }

    async loadRoomCatalog(roomX, roomY) {
        const roomKey = `${roomX},${roomY}`;
        
        // Check cache first
        if (this.roomCatalogs[roomKey]) {
            return this.roomCatalogs[roomKey];
        }
        
        // Try to load from storage
        const data = localStorage.getItem(`${this.savePrefix}room_${roomKey}`);
        if (data) {
            const catalog = JSON.parse(data);
            this.roomCatalogs[roomKey] = catalog;
            return catalog;
        }
        
        return null;
    }

    // Book content data
    async saveBookContent(roomX, roomY, bookIndex, pageIndex, content) {
        const bookKey = `${roomX},${roomY}_${bookIndex}_${pageIndex}`;
        
        // Save to cache
        this.bookContents[bookKey] = content;
        
        // Save to storage
        localStorage.setItem(`${this.savePrefix}book_${bookKey}`, content);
        
        // Save to the list of known books
        const books = this.getKnownBooks();
        if (!books.includes(bookKey)) {
            books.push(bookKey);
            localStorage.setItem(`${this.savePrefix}known_books`, JSON.stringify(books));
        }
    }

    async loadBookContent(roomX, roomY, bookIndex, pageIndex) {
        const bookKey = `${roomX},${roomY}_${bookIndex}_${pageIndex}`;
        
        // Check cache first
        if (this.bookContents[bookKey]) {
            return this.bookContents[bookKey];
        }
        
        // Try to load from storage
        const content = localStorage.getItem(`${this.savePrefix}book_${bookKey}`);
        if (content) {
            this.bookContents[bookKey] = content;
            return content;
        }
        
        return null;
    }

    // Helper methods
    getKnownRooms() {
        const data = localStorage.getItem(`${this.savePrefix}known_rooms`);
        return data ? JSON.parse(data) : [];
    }

    getKnownBooks() {
        const data = localStorage.getItem(`${this.savePrefix}known_books`);
        return data ? JSON.parse(data) : [];
    }

    // Save player's character story in a random book in the library
    async saveCharacterStoryToLibrary(characterData, story) {
        // Generate a random room and book position
        const roomX = Math.floor(Math.random() * CONFIG.librarySize.width);
        const roomY = Math.floor(Math.random() * CONFIG.librarySize.height);
        const bookIndex = Math.floor(Math.random() * CONFIG.booksPerRoom);
        
        // Create a special book title for the character
        const catalog = await this.loadRoomCatalog(roomX, roomY) || [];
        catalog[bookIndex] = `The Story of ${characterData.name}: Seeker of Knowledge`;
        
        // Save catalog with the special book
        await this.saveRoomCatalog(roomX, roomY, catalog);
        
        // Save the story as the first page of this book
        await this.saveBookContent(roomX, roomY, bookIndex, 1, story);
        
        // Save the location of this special book for later reference
        localStorage.setItem(`${this.savePrefix}character_book`, JSON.stringify({
            roomX, roomY, bookIndex
        }));
        
        return { roomX, roomY, bookIndex };
    }

    // Reset all saved data
    resetAllData() {
        // Get all keys with our prefix
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.savePrefix)) {
                keysToRemove.push(key);
            }
        }
        
        // Remove all keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear caches
        this.roomCatalogs = {};
        this.bookContents = {};
    }
}
