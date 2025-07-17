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

// Fill the grid with puzzle words
function fillGrid() {
    const todaysPuzzle = getTodaysPuzzle();
    
    if (!todaysPuzzle) {
        console.log('No puzzle found for today:', getTodaysDate());
        return;
    }
    
    const gridBlocks = document.querySelectorAll('.grid-block');
    const words = todaysPuzzle.words;
    
    // Flatten the 4x4 array to match the 16 grid blocks
    let wordIndex = 0;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (gridBlocks[wordIndex]) {
                gridBlocks[wordIndex].textContent = words[row][col];
            }
            wordIndex++;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fillGrid); 