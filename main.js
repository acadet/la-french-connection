// Get today's date in YYYY-MM-DD format
function getTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Find puzzle for today's date
function getTodaysPuzzle() {
    const today = getTodaysDate();
    return puzzles.find(puzzle => puzzle.date === today);
}

// Shuffle array randomly using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Fill the grid with puzzle words
function fillGrid() {
    const todaysPuzzle = getTodaysPuzzle();
    
    if (!todaysPuzzle) {
        console.log('No puzzle found for today:', getTodaysDate());
        return;
    }
    
    const gridBlocks = document.querySelectorAll('.grid-block');
    const words = todaysPuzzle.words;
    
    // Flatten the 4x4 array into a single array of 16 words
    const allWords = words.flat();
    
    // Randomize the order of words
    const shuffledWords = shuffleArray(allWords);
    
    // Fill the grid blocks with shuffled words
    shuffledWords.forEach((word, index) => {
        if (gridBlocks[index]) {
            gridBlocks[index].textContent = word;
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fillGrid); 