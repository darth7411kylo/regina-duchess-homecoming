// script.js (Firebase version): handle voting and real-time updates using Firestore

// DOM elements
const yesButton = document.getElementById('yesButton');
const yesssssButton = document.getElementById('yesssssButton');
const yesCountElement = document.getElementById('yesCount');
const yesssssCountElement = document.getElementById('yesssssCount');
const resultsContainer = document.getElementById('results');
const thankYouMessage = document.getElementById('thankYouMessage');

// Initialize Firebase app and Firestore
// The firebaseConfig object should be defined in firebase-config.js
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Reference to our poll document in the 'polls' collection
const pollDocRef = db.collection('polls').doc('regina-homecoming');

/**
 * Ensure the poll document exists. If it doesn't, create it with zeroed counts.
 */
function initializePollDocument() {
    pollDocRef.get().then((doc) => {
        if (!doc.exists) {
            // Create the document with initial counts
            pollDocRef.set({ yes: 0, yesssss: 0 }).catch((error) => {
                console.error('Error initializing poll document:', error);
            });
        } else {
            // Document exists; counts will be handled by snapshot listener
        }
    }).catch((error) => {
        console.error('Error fetching poll document:', error);
    });
}

/**
 * Display the current vote counts on the page
 * @param {Object} data
 */
function displayResults(data) {
    yesCountElement.textContent = data.yes;
    yesssssCountElement.textContent = data.yesssss;
    thankYouMessage.classList.remove('hidden');
    resultsContainer.classList.remove('hidden');
}

/**
 * Handle the vote action. Increments the selected count in Firestore
 * and prevents the user from voting more than once using localStorage.
 * @param {string} option The option being voted on ('yes' or 'yesssss')
 */
function vote(option) {
    const hasVoted = localStorage.getItem('reginaHasVoted');
    if (hasVoted) {
        alert('You have already voted! Thank you for your support.');
        return;
    }
    // Use Firestore FieldValue.increment to atomically increment the count
    const increment = firebase.firestore.FieldValue.increment(1);
    const update = {};
    if (option === 'yes') {
        update.yes = increment;
    } else if (option === 'yesssss') {
        update.yesssss = increment;
    }
    pollDocRef.update(update).then(() => {
        // After updating the count, mark the user as having voted
        localStorage.setItem('reginaHasVoted', 'true');
        // Disable buttons
        yesButton.disabled = true;
        yesssssButton.disabled = true;
    }).catch((error) => {
        console.error('Error updating vote:', error);
    });
}

// Event listeners for buttons
yesButton.addEventListener('click', () => vote('yes'));
yesssssButton.addEventListener('click', () => vote('yesssss'));

// On page load, initialize the poll document and set up a real-time listener
window.addEventListener('DOMContentLoaded', () => {
    initializePollDocument();
    const hasVoted = localStorage.getItem('reginaHasVoted');
    // Real-time listener for the poll document
    pollDocRef.onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            displayResults(data);
        }
    }, (error) => {
        console.error('Error listening to poll document:', error);
    });
    // Disable buttons if the user has already voted
    if (hasVoted) {
        yesButton.disabled = true;
        yesssssButton.disabled = true;
    }
});