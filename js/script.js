// At the top of script.js
console.log('Script loaded!');

// Basic test for button functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded!');

    // Test theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', () => {
        console.log('Theme button clicked');
        document.body.setAttribute('data-theme', 
            document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    // Test new transaction button
    const newTransactionBtn = document.getElementById('new-transaction-btn');
    newTransactionBtn?.addEventListener('click', () => {
        console.log('New transaction button clicked');
        document.getElementById('transaction-modal').classList.add('active');
    });

    // Test modal close button
    const closeModalBtn = document.getElementById('close-modal');
    closeModalBtn?.addEventListener('click', () => {
        console.log('Close modal button clicked');
        document.getElementById('transaction-modal').classList.remove('active');
    });

    // Test cancel transaction button
    const cancelTransactionBtn = document.getElementById('cancel-transaction');
    cancelTransactionBtn?.addEventListener('click', () => {
        console.log('Cancel button clicked');
        document.getElementById('transaction-modal').classList.remove('active');
    });
});
