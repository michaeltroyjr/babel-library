# babel-library
AI API Test game

This project is meant to demo the use of creating dynamic stories using ChatGPT API. This project was built using Test Driven development. Meaning tests were written using this README.md first, and then the code for the game was written.

## Game Start

The game first asks the player their name and a small description about their character. This is then used for chatGPT to create a story about why the charcter is in the Library of Babel and what information they are looking for.

## Story presented

The story is presented to the player, and then they are free to explore the library after closing the dialog

## library exploration

The library is section off with a room of 100 books. 5 aisles contain 20 books with enough space for the character to walk (Controls are WASD to navigate the library) the aisle around them and explore each book (press E to open a book). At the north end of the library there's a card catalog with the names of all the books in that room. There are 4 paths out of the room that match the cardinal directions. These paths lead to a new room of the library.

### Charater storage

The character and their story are randomly added to the library on creation

### How the library operates

When the game loads it uses a AI API call to get the get the card catalog to the current room. This is stored in a save file so that the library remains persistant for each new player. However the starting room location for each player is randomized. For demo purposes the size of the library is 256 x 256 rooms

### How books operate

When the book opens the first 500 words are populated by AI Api call. This is also stored in a different save file. There are page buttons at the bottom of each book. The player can then choose to turn the page, and the next 500 words are generated. The player can then close the book by pressing E.
