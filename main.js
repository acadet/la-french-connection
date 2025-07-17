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
    const words = todaysPuzzle.puzzle;
    
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
    
    // Add click event listeners to toggle colors
    addClickListeners();
    
    // Add submit button click listener
    addSubmitListener();
    
    // Initialize submit button state
    updateSubmitButtonState();
}

// Add click event listeners to all grid blocks
function addClickListeners() {
    const gridBlocks = document.querySelectorAll('.grid-block');
    
    gridBlocks.forEach(block => {
        block.addEventListener('click', function() {
            const isCurrentlyClicked = this.classList.contains('clicked');
            const clickedBlocks = document.querySelectorAll('.grid-block.clicked');
            
            if (isCurrentlyClicked) {
                // Always allow unclicking
                this.classList.remove('clicked');
            } else {
                // Only allow clicking if less than 4 blocks are selected
                if (clickedBlocks.length < 4) {
                    this.classList.add('clicked');
                }
            }
            
            // Update submit button state after each click
            updateSubmitButtonState();
        });
    });
}

// Update submit button state based on selected blocks
function updateSubmitButtonState() {
    const clickedBlocks = document.querySelectorAll('.grid-block.clicked');
    const submitButton = document.querySelector('.submit-button');
    
    if (clickedBlocks.length === 4) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

// Add submit button click listener
function addSubmitListener() {
    const submitButton = document.querySelector('.submit-button');
    
    submitButton.addEventListener('click', function() {
        if (!this.disabled) {
            handleSubmission();
        }
    });
}

// Handle submission logic
function handleSubmission() {
    const clickedBlocks = document.querySelectorAll('.grid-block.clicked');
    const selectedWords = Array.from(clickedBlocks).map(block => block.textContent);
    
    const categoryIndex = isValidGroup(selectedWords);
    if (categoryIndex !== -1) {
        // Success: replace the 4 blocks with a single category block
        replaceWithCategoryBlock(clickedBlocks, selectedWords, categoryIndex);
        updateSubmitButtonState();
    } else {
        // Shake the selected blocks
        shakeBlocks(clickedBlocks);
    }
}

// Check if selected words form a valid group
function isValidGroup(selectedWords) {
    const todaysPuzzle = getTodaysPuzzle();
    if (!todaysPuzzle) return -1;
    
    const categories = todaysPuzzle.puzzle;
    
    // Find which category matches the selected words
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        if (category.length === selectedWords.length &&
            category.every(word => selectedWords.includes(word))) {
            return i; // Return the category index
        }
    }
    
    return -1; // No match found
}

// Add shake animation to blocks
function shakeBlocks(blocks) {
    blocks.forEach(block => {
        block.classList.add('shake');
        // Remove shake class after animation completes
        setTimeout(() => {
            block.classList.remove('shake');
        }, 500);
    });
}

// Replace 4 selected blocks with a single category block
function replaceWithCategoryBlock(clickedBlocks, selectedWords, categoryIndex) {
    const gridContainer = document.querySelector('.grid-container');
    
    // Remove all 4 selected blocks
    clickedBlocks.forEach(block => {
        block.remove();
    });
    
    // Create the category result block
    const categoryBlock = document.createElement('div');
    categoryBlock.className = `grid-block category-result category-${categoryIndex} bounce`;
    categoryBlock.textContent = selectedWords.join(', ');
    
    // Remove bounce class after animation completes
    setTimeout(() => {
        categoryBlock.classList.remove('bounce');
    }, 600);
    
    // Find where to insert: after existing category blocks or at the top
    const remainingBlocks = Array.from(gridContainer.children);
    const categoryBlocks = remainingBlocks.filter(block => 
        block.classList.contains('category-result')
    );
    const lastCategoryBlock = categoryBlocks[categoryBlocks.length - 1];
    
    if (lastCategoryBlock) {
        // Insert after the last existing category block
        const nextSibling = lastCategoryBlock.nextSibling;
        if (nextSibling) {
            gridContainer.insertBefore(categoryBlock, nextSibling);
        } else {
            gridContainer.appendChild(categoryBlock);
        }
    } else {
        // No existing category blocks, insert at the top
        if (remainingBlocks.length > 0) {
            gridContainer.insertBefore(categoryBlock, remainingBlocks[0]);
        } else {
            gridContainer.appendChild(categoryBlock);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fillGrid); 