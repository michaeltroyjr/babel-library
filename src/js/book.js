// Book class for handling individual books
class Book {
    constructor(title, roomX, roomY, bookIndex) {
        this.title = title;
        this.roomX = roomX;
        this.roomY = roomY;
        this.bookIndex = bookIndex;
        this.currentPage = 1;
        this.cachedPages = {};
        
        this.api = new APIHandler();
        this.save = new SaveSystem();
    }
    
    // Load or generate content for the current page
    async getPageContent() {
        // Try to load from save first
        let content = await this.save.loadBookContent(
            this.roomX, 
            this.roomY, 
            this.bookIndex, 
            this.currentPage
        );
        
        // If no saved content, generate new content
        if (!content) {
            content = await this.api.generateBookContent(this.title, this.currentPage);
            
            // Save the newly generated content
            if (content) {
                await this.save.saveBookContent(
                    this.roomX, 
                    this.roomY, 
                    this.bookIndex, 
                    this.currentPage, 
                    content
                );
            }
        }
        
        // Cache the content
        this.cachedPages[this.currentPage] = content;
        
        return content;
    }
    
    // Navigate to a specific page
    async goToPage(pageNum) {
        if (pageNum < 1) pageNum = 1;
        
        this.currentPage = pageNum;
        
        // Check if page is cached
        if (this.cachedPages[pageNum]) {
            return this.cachedPages[pageNum];
        }
        
        return await this.getPageContent();
    }
    
    // Go to next page
    async nextPage() {
        return await this.goToPage(this.currentPage + 1);
    }
    
    // Go to previous page
    async prevPage() {
        return await this.goToPage(this.currentPage - 1);
    }
}
