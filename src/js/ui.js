// UI handler for game interface
class UIHandler {
    constructor(game) {
        this.game = game;
        
        // DOM Elements
        this.dialogContainer = document.getElementById('dialog-container');
        this.dialogContent = document.getElementById('dialog-content');
        this.dialogClose = document.getElementById('dialog-close');
        
        this.bookContainer = document.getElementById('book-container');
        this.bookContent = document.getElementById('book-content');
        this.bookNavigation = document.getElementById('book-navigation');
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.pageNumber = document.getElementById('page-number');
        this.bookClose = document.getElementById('book-close');
        
        this.characterCreation = document.getElementById('character-creation');
        this.playerNameInput = document.getElementById('player-name');
        this.characterDescInput = document.getElementById('character-description');
        this.startGameBtn = document.getElementById('start-game');
        
        this.currentBook = null;
        
        this.initEventListeners();
    }
      initEventListeners() {
        // Dialog close button
        this.dialogClose.addEventListener('click', () => {
            this.hideDialog();
            
            // If this is the story dialog and game isn't running yet, start the game loop
            if (this._isStoryDialogShowing && !this.game.isRunning) {
                console.log('Starting game loop after story dialog closed');
                this._isStoryDialogShowing = false;
                this.game.startGameLoop();
            }
        });
        
        // Book navigation
        this.prevPageBtn.addEventListener('click', () => {
            this.turnPage('prev');
        });
        
        this.nextPageBtn.addEventListener('click', () => {
            this.turnPage('next');
        });
        
        // Book close button
        this.bookClose.addEventListener('click', () => {
            this.closeBook();
        });
        
        // Character creation
        this.startGameBtn.addEventListener('click', () => {
            this.submitCharacterInfo();
        });
        
        // Keyboard shortcuts for book interaction
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e') {
                // Only process if book is open
                if (this.bookContainer.classList.contains('hidden')) {
                    this.game.handleInteraction();
                } else {
                    this.closeBook();
                }
            }
        });
    }
    
    // Show character creation screen
    showCharacterCreation() {
        this.characterCreation.style.display = 'flex';
    }
    
    // Hide character creation
    hideCharacterCreation() {
        this.characterCreation.style.display = 'none';
    }
    
    // Process character info submission
    submitCharacterInfo() {
        const name = this.playerNameInput.value.trim();
        const description = this.characterDescInput.value.trim();
        
        if (!name) {
            alert('Please enter your name.');
            return;
        }
        
        if (!description) {
            alert('Please enter a character description.');
            return;
        }
        
        this.hideCharacterCreation();
        this.game.startGame(name, description);
    }
      // Show story dialog
    showStoryDialog(content) {
        this._isStoryDialogShowing = true;
        this.dialogContent.innerHTML = content;
        this.dialogContainer.classList.remove('hidden');
        
        // Make sure the close button is visible and properly styled
        this.dialogClose.style.display = 'block';
        this.dialogClose.style.marginTop = '20px';
        this.dialogClose.focus(); // Focus on the close button
        
        // Log for debugging        console.log('Story dialog shown, waiting for user to close it');
        console.log('Dialog content:', content);
        console.log('Dialog container classList before update:', this.dialogContainer.classList);
        this.dialogContainer.classList.remove('hidden');
        console.log('Dialog container classList after update:', this.dialogContainer.classList);
    }
    
    // Hide dialog
    hideDialog() {
        this.dialogContainer.classList.add('hidden');
        console.log('Dialog hidden');
    }
    
    // Open a book
    openBook(book) {
        this.currentBook = book;
        this.pageNumber.textContent = book.currentPage;
        this.bookContainer.classList.remove('hidden');
        
        // Ensure book container is visible with proper styles
        this.bookContainer.style.display = 'flex';
        
        // Loading indicator
        this.bookContent.innerHTML = '<p>Loading book content...</p>';
        
        // Log for debugging
        console.log('Opening book:', book.title);
        
        // Load the content
        book.getPageContent().then(content => {
            this.bookContent.innerHTML = content || '<p>This page appears to be blank.</p>';
        });
    }
    
    // Close the book
    closeBook() {
        // Make sure we're using both classList and style to ensure it's hidden
        this.bookContainer.classList.add('hidden');
        this.bookContainer.style.display = 'none';
        this.currentBook = null;
        
        // Log for debugging
        console.log('Book closed');
    }
    
    // Turn page in book
    turnPage(direction) {
        if (!this.currentBook) return;
        
        // Loading indicator
        this.bookContent.innerHTML = '<p>Turning page...</p>';
        
        // Turn page and update content
        const contentPromise = direction === 'prev' ? 
            this.currentBook.prevPage() : 
            this.currentBook.nextPage();
        
        contentPromise.then(content => {
            this.pageNumber.textContent = this.currentBook.currentPage;
            this.bookContent.innerHTML = content || '<p>This page appears to be blank.</p>';
        });
    }
    
    // Show card catalog
    showCardCatalog(catalog) {
        let content = `<h2>Card Catalog</h2>
                       <p>Room (${this.game.library.currentRoomX}, ${this.game.library.currentRoomY})</p>
                       <ul class="catalog-list">`;
                       
        catalog.forEach((title, index) => {
            content += `<li data-index="${index}">${title}</li>`;
        });
        
        content += `</ul>`;
        
        this.showStoryDialog(content);
        
        // Add click handlers to catalog items
        const catalogItems = document.querySelectorAll('.catalog-list li');
        catalogItems.forEach(item => {
            item.addEventListener('click', () => {
                const bookIndex = parseInt(item.getAttribute('data-index'));
                const book = this.game.library.getBook(bookIndex);
                if (book) {
                    this.hideDialog();
                    this.openBook(book);
                }
            });
        });
    }
    
    // Show a notification at the top of the screen
    showNotification(message, duration = 3000) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.position = 'absolute';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '100';
            document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Hide after duration
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }
}
