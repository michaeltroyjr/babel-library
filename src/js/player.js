// Player class for character movement and interaction
class Player {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.x = CONFIG.roomSize.width / 2;
        this.y = CONFIG.roomSize.height / 2;
        this.speed = CONFIG.playerSpeed;
        this.size = CONFIG.playerSize;
        
        // Movement flags
        this.moveUp = false;
        this.moveDown = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Interaction state
        this.nearbyBookIndex = -1;
        this.isAtCardCatalog = false;
        this.isAtExit = null; // 'north', 'south', 'east', 'west' or null
        
        this.save = new SaveSystem();
    }
    
    // Initialize player position
    initialize() {
        // Try to load saved position
        const savedPosition = this.save.loadPlayerPosition();
        if (savedPosition) {
            this.x = savedPosition.x;
            this.y = savedPosition.y;
        }
    }
    
    // Update player position based on input
    update(roomInfo) {
        // Movement
        let dx = 0;
        let dy = 0;
        
        if (this.moveUp) dy -= this.speed;
        if (this.moveDown) dy += this.speed;
        if (this.moveLeft) dx -= this.speed;
        if (this.moveRight) dx += this.speed;
        
        // Apply movement if not at boundaries
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Check boundaries
        const padding = this.size / 2;
        if (newX >= padding && newX <= CONFIG.roomSize.width - padding) {
            this.x = newX;
        }
        if (newY >= padding && newY <= CONFIG.roomSize.height - padding) {
            this.y = newY;
        }
        
        // Check for room exits
        this.checkForRoomExits();
        
        // Check for nearby books
        this.checkForNearbyBooks(roomInfo.bookPositions);
        
        // Check if near card catalog (at north end of the room)
        this.isAtCardCatalog = (this.y < 80 && Math.abs(this.x - CONFIG.roomSize.width / 2) < 50);
        
        // Save position
        this.save.savePlayerPosition(this.x, this.y, roomInfo.roomX, roomInfo.roomY);
    }
    
    // Check if player is near room exits
    checkForRoomExits() {
        const exitDistance = 40; // Distance to detect exits
        
        // North exit
        if (this.y < exitDistance) {
            this.isAtExit = 'north';
        }
        // South exit
        else if (this.y > CONFIG.roomSize.height - exitDistance) {
            this.isAtExit = 'south';
        }
        // East exit
        else if (this.x > CONFIG.roomSize.width - exitDistance) {
            this.isAtExit = 'east';
        }
        // West exit
        else if (this.x < exitDistance) {
            this.isAtExit = 'west';
        }
        else {
            this.isAtExit = null;
        }
    }
    
    // Check if player is near any books
    checkForNearbyBooks(bookPositions) {
        this.nearbyBookIndex = -1;
        
        // Find closest book within interaction range
        let closestDistance = 40; // Interaction distance
        
        bookPositions.forEach(book => {
            const distance = Math.sqrt(
                Math.pow(this.x - book.x, 2) + 
                Math.pow(this.y - book.y, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                this.nearbyBookIndex = book.index;
            }
        });
    }
    
    // Handle keyboard input
    handleKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
                this.moveUp = true;
                break;
            case 's':
                this.moveDown = true;
                break;
            case 'a':
                this.moveLeft = true;
                break;
            case 'd':
                this.moveRight = true;
                break;
        }
    }
    
    handleKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
                this.moveUp = false;
                break;
            case 's':
                this.moveDown = false;
                break;
            case 'a':
                this.moveLeft = false;
                break;
            case 'd':
                this.moveRight = false;
                break;
        }
    }
    
    // Render the player
    render(ctx) {
        ctx.fillStyle = '#d4af37'; // Gold color for the player
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw interaction indicators if near something
        if (this.nearbyBookIndex >= 0 || this.isAtCardCatalog || this.isAtExit) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            
            let message = '';
            if (this.nearbyBookIndex >= 0) {
                message = 'Press E to read book';
            } else if (this.isAtCardCatalog) {
                message = 'Press E to view card catalog';
            } else if (this.isAtExit) {
                message = `Press E to go ${this.isAtExit}`;
            }
            
            ctx.fillText(message, this.x, this.y - 20);
        }
    }
}
