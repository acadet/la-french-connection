// Game state
let remainingAttempts = 4;
let selectedPuzzleDate = null;
let submissionHistory = [];
let gameOver = false;

// Get today's date in YYYY-MM-DD format
function getTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Find puzzle for selected date
function getSelectedPuzzle() {
    return puzzles.find(puzzle => puzzle.date === selectedPuzzleDate);
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
    const selectedPuzzle = getSelectedPuzzle();
    
    if (!selectedPuzzle) {
        console.log('No puzzle found for date:', selectedPuzzleDate);
        return;
    }
    
    const gridBlocks = document.querySelectorAll('.grid-block');
    const categories = selectedPuzzle.puzzle;
    
    // Flatten the category objects into a single array of 16 words
    const allWords = categories.flatMap(category => category.words);
    
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
    
    // Initialize button states
    updateButtonStates();
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
            
            // Update button states after each click
            updateButtonStates();
        });
    });
}

// Update button states based on selected blocks
function updateButtonStates() {
    const clickedBlocks = document.querySelectorAll('.grid-block.clicked');
    const remainingWordBlocks = document.querySelectorAll('.grid-block:not(.category-result)');
    const submitButton = document.querySelector('.submit-button:not(.share-button)');
    const deselectButton = document.querySelector('.deselect-button');
    const shuffleButton = document.querySelector('.shuffle-button');
    
    // Submit button: enabled only when exactly 4 blocks are selected and game not over
    if (submitButton) {
        if (clickedBlocks.length === 4 && !gameOver) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }
    
    // Deselect button: enabled only when at least 1 block is selected and game not over
    if (clickedBlocks.length > 0 && !gameOver) {
        deselectButton.disabled = false;
    } else {
        deselectButton.disabled = true;
    }
    
    // Shuffle button: enabled only when there are remaining word blocks and game not over
    if (remainingWordBlocks.length > 0 && !gameOver) {
        shuffleButton.disabled = false;
    } else {
        shuffleButton.disabled = true;
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
    
    // Record the submission with emojis
    recordSubmission(selectedWords);
    
    const categoryIndex = isValidGroup(selectedWords);
    if (categoryIndex !== -1) {
        // Success: replace the 4 blocks with a single category block
        replaceWithCategoryBlock(clickedBlocks, selectedWords, categoryIndex);
        
        // Check if all categories are solved
        const remainingWordBlocks = document.querySelectorAll('.grid-block:not(.category-result)');
        if (remainingWordBlocks.length === 0) {
            gameOver = true;
            showShareButton();
        }
        
        updateButtonStates();
    } else {
        
        // Wrong answer: decrease attempts and update display
        remainingAttempts--;
        updateAttemptsDisplay();
        
        if (remainingAttempts <= 0) {
            // No attempts left: reveal all remaining categories
            gameOver = true;
            revealAllCategories();
            showShareButton();
        } else {
            // Shake the selected blocks and clear selection after
            shakeBlocks(clickedBlocks);

            // Check if 3 words are from the same category
            if (hasThreeFromSameCategory(selectedWords)) {
                showAlmostPopup();
            }
        }
    }
}

// Record submission with emojis representing categories
function recordSubmission(selectedWords) {
    const selectedPuzzle = getSelectedPuzzle();
    if (!selectedPuzzle) return;
    
    const categoryEmojis = ['🟨', '🟩', '🟦', '🟪'];
    const submissionEmojis = [];
    
    // Map each selected word to its category emoji
    selectedWords.forEach(word => {
        let foundEmoji = '❓'; // Default if not found
        
        for (let i = 0; i < selectedPuzzle.puzzle.length; i++) {
            const category = selectedPuzzle.puzzle[i];
            if (category.words.includes(word)) {
                foundEmoji = categoryEmojis[i];
                break;
            }
        }
        
        submissionEmojis.push(foundEmoji);
    });
    
    // Add this submission to history
    submissionHistory.push(submissionEmojis);
}

// Check if selected words form a valid group
function isValidGroup(selectedWords) {
    const selectedPuzzle = getSelectedPuzzle();
    if (!selectedPuzzle) return -1;
    
    const categories = selectedPuzzle.puzzle;
    
    // Find which category matches the selected words
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        if (category.words.length === selectedWords.length &&
            category.words.every(word => selectedWords.includes(word))) {
            return i; // Return the category index
        }
    }
    
    return -1; // No match found
}

// Check if exactly 3 words are from the same category
function hasThreeFromSameCategory(selectedWords) {
    const selectedPuzzle = getSelectedPuzzle();
    if (!selectedPuzzle) return false;
    
    const categories = selectedPuzzle.puzzle;
    
    // Check each category to see if it has exactly 3 matches
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const matchCount = category.words.filter(word => selectedWords.includes(word)).length;
        if (matchCount === 3) {
            return true;
        }
    }
    
    return false;
}

// Show "Presque..." popup
function showAlmostPopup() {
    const popup = document.getElementById('popup-overlay');
    popup.classList.add('show');
    
    // Hide popup after 2 seconds
    setTimeout(() => {
        hideAlmostPopup();
    }, 2000);
}

// Hide "Presque..." popup
function hideAlmostPopup() {
    const popup = document.getElementById('popup-overlay');
    popup.classList.remove('show');
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

// Add deselect button click listener
function addDeselectListener() {
    const deselectButton = document.querySelector('.deselect-button');
    
    deselectButton.addEventListener('click', function() {
        if (!this.disabled) {
            deselectAllBlocks();
        }
    });
}

// Deselect all selected blocks
function deselectAllBlocks() {
    const clickedBlocks = document.querySelectorAll('.grid-block.clicked');
    clickedBlocks.forEach(block => {
        block.classList.remove('clicked');
    });
    updateButtonStates();
}

// Add shuffle button click listener
function addShuffleListener() {
    const shuffleButton = document.querySelector('.shuffle-button');
    
    shuffleButton.addEventListener('click', function() {
        if (!this.disabled) {
            shuffleRemainingBlocks();
        }
    });
}

function addShareListener() {
    const shareButton = document.querySelector('.share-button');
    shareButton.addEventListener('click', shareResults);
}

// Shuffle remaining word blocks
function shuffleRemainingBlocks() {
    const remainingWordBlocks = document.querySelectorAll('.grid-block:not(.category-result)');
    
    if (remainingWordBlocks.length === 0) return;
    
    // Extract text content from remaining blocks
    const wordsArray = Array.from(remainingWordBlocks).map(block => block.textContent);
    
    // Shuffle the words array
    const shuffledWords = shuffleArray(wordsArray);
    
    // Clear selections before shuffling
    remainingWordBlocks.forEach(block => {
        block.classList.remove('clicked');
    });
    
    // Assign shuffled words back to blocks
    shuffledWords.forEach((word, index) => {
        if (remainingWordBlocks[index]) {
            remainingWordBlocks[index].textContent = word;
        }
    });
    
    // Update button states after shuffle
    updateButtonStates();
}

// Replace 4 selected blocks with a single category block
function replaceWithCategoryBlock(clickedBlocks, selectedWords, categoryIndex) {
    const gridContainer = document.querySelector('.grid-container');
    
    // Remove all 4 selected blocks
    clickedBlocks.forEach(block => {
        block.remove();
    });
    
    // Get the category title
    const selectedPuzzle = getSelectedPuzzle();
    const categoryTitle = selectedPuzzle.puzzle[categoryIndex].title;
    
    // Create the category result block
    const categoryBlock = document.createElement('div');
    categoryBlock.className = `grid-block category-result category-${categoryIndex} bounce`;
    
    // Create title element
    const titleElement = document.createElement('div');
    titleElement.className = 'category-title';
    titleElement.textContent = categoryTitle;
    
    // Create words element
    const wordsElement = document.createElement('div');
    wordsElement.className = 'category-words';
    wordsElement.textContent = selectedPuzzle.puzzle[categoryIndex].words.join(', ');
    
    // Append title and words to the category block
    categoryBlock.appendChild(titleElement);
    categoryBlock.appendChild(wordsElement);
    
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

// Update attempts display
function updateAttemptsDisplay() {
    const attemptsElement = document.querySelector('.attempts-remaining');
    const circles = '⬤'.repeat(remainingAttempts);
    attemptsElement.textContent = `Essais restants : ${circles}`;
}

// Reveal all remaining categories when attempts are exhausted
function revealAllCategories() {
    const selectedPuzzle = getSelectedPuzzle();
    if (!selectedPuzzle) return;
    
    const gridContainer = document.querySelector('.grid-container');
    const existingCategoryBlocks = gridContainer.querySelectorAll('.category-result');
    const solvedCategories = existingCategoryBlocks.length;
    
    // Clear all selected blocks first
    const clickedBlocks = document.querySelectorAll('.grid-block.clicked');
    clickedBlocks.forEach(block => block.classList.remove('clicked'));
    
    // Reveal remaining categories
    for (let i = solvedCategories; i < selectedPuzzle.puzzle.length; i++) {
        const category = selectedPuzzle.puzzle[i];
        const categoryWords = category.words;
        
        // Find the corresponding word blocks
        const remainingBlocks = Array.from(gridContainer.children).filter(block => 
            !block.classList.contains('category-result')
        );
        const wordsToRemove = remainingBlocks.filter(block => 
            categoryWords.includes(block.textContent)
        );
        
        if (wordsToRemove.length === 4) {
            replaceWithCategoryBlock(wordsToRemove, categoryWords, i);
        }
    }
    
    // Disable buttons
    updateButtonStates();
}

// Show share button and hide submit button
function showShareButton() {
    const otherButtons = document.querySelectorAll('.submit-button, .deselect-button, .shuffle-button');
    
    // Hide other buttons
    otherButtons.forEach(button => {
        button.style.display = 'none';
    });
    
    // Create share button if it doesn't exist
    let shareButton = document.querySelector('.share-button');
    shareButton.style.display = 'block';
}

// Hide share button and show submit button
function hideShareButton() {
    const otherButtons = document.querySelectorAll('.submit-button, .deselect-button, .shuffle-button');
    const shareButton = document.querySelector('.share-button');
    
     // Hide other buttons
     otherButtons.forEach(button => {
        button.style.display = 'block';
    });
    
    // Hide share button
    if (shareButton) {
        shareButton.style.display = 'none';
    }
}

// Share results using browser share API
function shareResults() {
    const selectedPuzzle = getSelectedPuzzle();
    if (!selectedPuzzle || submissionHistory.length === 0) return;
    
    const puzzleDate = formatDate(selectedPuzzleDate);
    
    let shareText = `La French Connection - ${puzzleDate}\n`;
    
    // Add submission history
    submissionHistory.forEach((submission, index) => {
        shareText += submission.join('') + '\n';
    });
    
    // Use browser share API if available
    if (navigator.share) {
        navigator.share({
            title: 'La French Connection',
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

// Fallback share method (copy to clipboard)
function fallbackShare(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {
            console.log('Could not paste results into clipboard');
        });
    } else {
        console.log('Could not share results');
    }
}

// Populate date dropdown with puzzle dates
function populateDateDropdown() {
    const dropdown = document.querySelector('.date-dropdown');
    const today = getTodaysDate();
    
    // Filter puzzles to only include past and today's puzzles
    const availablePuzzles = puzzles.filter(puzzle => puzzle.date <= today);
    var index = availablePuzzles.length;
    
    // Populate dropdown with available puzzles
    availablePuzzles.forEach(puzzle => {
        const option = document.createElement('option');
        option.value = puzzle.date;
        const indexText = index < 10 ? `0${index}` : index;
        option.textContent = `${indexText} - ${formatDate(puzzle.date)}`;
        dropdown.appendChild(option);
        index--;
    });
    
    // Set default to the most recent available puzzle (closest to today)
    if (availablePuzzles.length > 0) {
        selectedPuzzleDate = availablePuzzles[0].date;
        dropdown.value = selectedPuzzleDate;
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Add date dropdown change listener
function addDateDropdownListener() {
    const dropdown = document.querySelector('.date-dropdown');
    
    dropdown.addEventListener('change', function() {
        selectedPuzzleDate = this.value;
        resetGame();
    });
}

// Reset game with new puzzle
function resetGame() {
    // Reset game state
    remainingAttempts = 4;
    submissionHistory = [];
    gameOver = false;
    updateAttemptsDisplay();
    
    // Hide share button and show submit button
    hideShareButton();
    
    // Clear grid and refill with new puzzle
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = '';
    
    // Create 16 empty blocks
    for (let i = 0; i < 16; i++) {
        const block = document.createElement('div');
        block.className = 'grid-block';
        gridContainer.appendChild(block);
    }
    
    // Fill with new puzzle and reinitialize
    fillGrid();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Populate dropdown and set initial date
    populateDateDropdown();
    
    // Add dropdown listener
    addDateDropdownListener();
    
    // Add submit button click listener
    addSubmitListener();
    
    // Add deselect button click listener
    addDeselectListener();
    
    // Add shuffle button click listener
    addShuffleListener();
    
    // Add share button click listener
    addShareListener();
    
    // Initialize the game
    fillGrid();
}); 