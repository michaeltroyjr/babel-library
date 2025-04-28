// API Integration for ChatGPT
class APIHandler {
    constructor() {
        this.apiKey = null; // Will prompt user for API key
    }    async initialize() {
        // Check if we should use mock data for testing
        this.useMockData = CONFIG.debug && window.MOCK_DATA;
        if (this.useMockData) {
            console.log('Using mock data for API calls');
            return true;
        }
        
        // In a real application, this would be handled securely through environment variables
        // For demo purposes, we'll prompt the user (or in a real app, use a server-side proxy)
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('babel_api_key');
            if (!this.apiKey) {
                const useApiKey = confirm('Would you like to use your own OpenAI API key? Click Cancel to use sample data instead.');
                if (useApiKey) {
                    this.apiKey = prompt('Please enter your OpenAI API key (it will be stored locally):');
                    if (this.apiKey) {
                        localStorage.setItem('babel_api_key', this.apiKey);
                    }
                } else {
                    // Use mock data instead
                    this.useMockData = true;
                    console.log('Using mock data for API calls');
                    return true;
                }
            }
        }
        
        return this.useMockData || !!this.apiKey;
    }    async generateCharacterStory(name, description) {
        if (!await this.initialize()) return null;
        
        // Use mock data if configured
        if (this.useMockData && window.MOCK_DATA) {
            const storyTemplate = MOCK_DATA.stories[Math.floor(Math.random() * MOCK_DATA.stories.length)];
            return storyTemplate
                .replace(/{name}/g, name)
                .replace(/{description}/g, description);
        }
        
        const prompt = `Generate a short story (about 300 words) about a character named ${name} who has arrived at the Library of Babel searching for important information. The character is described as: ${description}. The story should explain why they are in the library and what specific knowledge they seek.`;
        
        return this.callAPI(prompt);
    }

    async generateBookContent(bookTitle, currentPage = 1) {
        if (!await this.initialize()) return null;
        
        // Use mock data if configured
        if (this.useMockData && window.MOCK_DATA) {
            const pageIndex = (currentPage - 1) % MOCK_DATA.bookContents.length;
            return MOCK_DATA.bookContents[pageIndex] + `\n\n(Page ${currentPage} of "${bookTitle}")`;
        }
        
        const prompt = `Generate ${CONFIG.wordsPerPage} words of content for page ${currentPage} of a book titled "${bookTitle}" in the Library of Babel. The content should be mystical, philosophical, or contain hidden knowledge. If this is beyond page 1, make the content flow naturally from the previous pages.`;
        
        return this.callAPI(prompt);
    }

    async generateRoomCatalog(roomX, roomY) {
        if (!await this.initialize()) return null;
        
        // Use mock data if configured
        if (this.useMockData && window.MOCK_DATA) {
            // Generate a consistent set of book titles for this room
            const seed = roomX * 1000 + roomY;
            const shuffledTitles = [...MOCK_DATA.bookTitles].sort(() => {
                seed; // Use seed for consistent shuffling
                return 0.5 - Math.random();
            });
            
            // Create enough titles by combining room coordinates with base titles
            const titles = [];
            for (let i = 0; i < CONFIG.booksPerRoom; i++) {
                const baseTitle = shuffledTitles[i % shuffledTitles.length];
                titles.push(`${baseTitle} (Vol. ${Math.floor(i/10) + 1}.${i % 10 + 1})`);
            }
            return titles;
        }
        
        const prompt = `Generate a list of ${CONFIG.booksPerRoom} book titles that would be found in room (${roomX}, ${roomY}) of the Library of Babel. The titles should be mystical, philosophical, or suggest hidden knowledge. Return them as a JSON array of strings.`;
        
        const response = await this.callAPI(prompt);
        try {
            // Extract JSON array from the response
            const jsonStart = response.indexOf('[');
            const jsonEnd = response.lastIndexOf(']') + 1;
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const jsonStr = response.substring(jsonStart, jsonEnd);
                return JSON.parse(jsonStr);
            }
            // Fallback if JSON parsing fails
            return response.split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^["'\d\-.*•]+\s*/, '').trim())
                .slice(0, CONFIG.booksPerRoom);
        } catch (error) {
            console.error('Error parsing catalog response:', error);
            return null;
        }
    }    // Track API calls to avoid rate limiting
    lastCallTime = 0;
    minTimeBetweenCalls = 1000; // 1 second minimum between calls
    
    async callAPI(prompt) {
        // Always fallback to mock data when debugging or if useMockData is enabled
        if ((CONFIG.debug && CONFIG.useMockData) || this.useMockData) {
            console.log('Using mock data instead of API call for:', prompt.substring(0, 30) + '...');
            
            // Simple mock response based on prompt
            if (prompt.includes('story')) {
                const storyTemplate = MOCK_DATA.stories[0];
                return storyTemplate
                    .replace(/{name}/g, 'Character')
                    .replace(/{description}/g, 'A curious explorer');
            } else if (prompt.includes('book titles')) {
                return JSON.stringify(MOCK_DATA.bookTitles.slice(0, 10));
            } else {
                return MOCK_DATA.bookContents[0];
            }
        }
        
        // Implement rate limiting
        const now = Date.now();
        const timeElapsed = now - this.lastCallTime;
        
        if (timeElapsed < this.minTimeBetweenCalls) {
            const delay = this.minTimeBetweenCalls - timeElapsed;
            console.log(`Rate limiting API: waiting ${delay}ms before next call`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        try {
            this.lastCallTime = Date.now();
            console.log('Making API call for:', prompt.substring(0, 30) + '...');
            
            const response = await fetch(CONFIG.apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: CONFIG.apiModel,
                    messages: [
                        { role: 'system', content: 'You are a creative assistant generating content for a game called Library of Babel.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                // If we get a 429, switch to mock data and remember this choice
                if (response.status === 429) {
                    console.warn('Rate limit (429) hit, switching to mock data permanently');
                    this.useMockData = true;
                    localStorage.setItem('babel_use_mock_data', 'true');
                    return this.callAPI(prompt); // Retry with mock data
                }
                
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API call error:', error);
            
            // Switch to mock data on error
            console.warn('API error occurred, using mock data as fallback');
            this.useMockData = true;
            
            // Use recursive call to get mock data
            return this.callAPI(prompt);
        }
    }
}
