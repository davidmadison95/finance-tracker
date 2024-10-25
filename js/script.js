// Log to confirm script is loaded
console.log('Script loaded!');

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            console.log(`Theme set to ${newTheme}`);
        });
    }

    // New transaction button
    const newTransactionBtn = document.getElementById('new-transaction-btn');
    if (newTransactionBtn) {
        newTransactionBtn.addEventListener('click', () => {
            const transactionModal = document.getElementById('transaction-modal');
            if (transactionModal) transactionModal.classList.add('active');
        });
    }

    // New budget button
    const newBudgetBtn = document.getElementById('new-budget-btn');
    if (newBudgetBtn) {
        newBudgetBtn.addEventListener('click', () => {
            const budgetModal = document.getElementById('budget-modal');
            if (budgetModal) budgetModal.classList.add('active');
        });
    }

    // New goal button
    const newGoalBtn = document.getElementById('new-goal-btn');
    if (newGoalBtn) {
        newGoalBtn.addEventListener('click', () => {
            const goalModal = document.getElementById('goal-modal');
            if (goalModal) goalModal.classList.add('active');
        });
    }

    // Close modals with the close button
    document.querySelectorAll('.btn-icon').forEach((closeBtn) => {
        closeBtn.addEventListener('click', (event) => {
            const modal = event.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });

    // Cancel buttons inside modals
    document.querySelectorAll('.btn-secondary').forEach((cancelBtn) => {
        cancelBtn.addEventListener('click', (event) => {
            const modal = event.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });

    // Form submission handling
    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log(`Form ${form.id} submitted`);
            // Here, add code to process the form data if needed.
            const modal = form.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });

    // Chart.js initialization for any charts (example setup)
    const mainChartCanvas = document.getElementById('main-chart');
    if (mainChartCanvas) {
        new Chart(mainChartCanvas, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May'],
                datasets: [{
                    label: 'Income',
                    data: [500, 1000, 750, 1250, 1000],
                    borderColor: 'rgb(59, 130, 246)',
                    fill: false,
                }, {
                    label: 'Expenses',
                    data: [400, 800, 600, 1100, 900],
                    borderColor: 'rgb(220, 38, 38)',
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
});
