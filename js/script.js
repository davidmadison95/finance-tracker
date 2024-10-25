document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded! DOM fully loaded.');

    // GLOBAL: Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            document.body.setAttribute('data-theme', theme);
            console.log(`Theme set to ${theme}`);
        });
    }

    // SETTINGS PAGE: Theme Selection Buttons
    const lightThemeBtn = document.getElementById('light-theme-btn');
    const darkThemeBtn = document.getElementById('dark-theme-btn');
    if (lightThemeBtn && darkThemeBtn) {
        lightThemeBtn.addEventListener('click', () => {
            document.body.classList.remove('dark-mode');
            document.body.setAttribute('data-theme', 'light');
            alert("Light theme activated!");
        });
        darkThemeBtn.addEventListener('click', () => {
            document.body.classList.add('dark-mode');
            document.body.setAttribute('data-theme', 'dark');
            alert("Dark theme activated!");
        });
    }

    // SETTINGS PAGE: Save Settings Button
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const currency = document.getElementById('currency').value;
            const language = document.getElementById('language').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            alert(`Settings saved:\n\nUsername: ${username}\nEmail: ${email}\nCurrency: ${currency}\nLanguage: ${language}`);
        });
    }

    // SETTINGS PAGE: Log Currency and Language Selection Changes
    const currencySelect = document.getElementById('currency');
    const languageSelect = document.getElementById('language');
    if (currencySelect) {
        currencySelect.addEventListener('change', () => console.log(`Currency changed to: ${currencySelect.value}`));
    }
    if (languageSelect) {
        languageSelect.addEventListener('change', () => console.log(`Language changed to: ${languageSelect.value}`));
    }

    // REPORTS PAGE: Generate Report Functionality
    const reportForm = document.getElementById('report-form');
    const reportModal = document.getElementById('report-modal');
    if (reportForm) {
        reportForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const reportName = document.getElementById('report-name').value;
            const dateRange = document.getElementById('report-date-range').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            if (dateRange === 'custom' && (!startDate || !endDate)) {
                alert('Please select both a start and end date for a custom range.');
                return;
            }
            const reportData = generateReportData(reportName, dateRange, startDate, endDate);
            displayGeneratedReport(reportData);
            reportModal.classList.remove('active');
        });
    }

    // REPORTS PAGE: Show/Hide Custom Date Range Fields
    const dateRangeSelect = document.getElementById('report-date-range');
    const customDateRangeFields = document.getElementById('custom-date-range');
    if (dateRangeSelect && customDateRangeFields) {
        dateRangeSelect.addEventListener('change', () => {
            customDateRangeFields.style.display = dateRangeSelect.value === 'custom' ? 'block' : 'none';
        });
    }

    // TRANSACTIONS PAGE: New Transaction Button
    const newTransactionBtn = document.getElementById('new-transaction-btn');
    const transactionModal = document.getElementById('transaction-modal');
    if (newTransactionBtn && transactionModal) {
        newTransactionBtn.addEventListener('click', () => transactionModal.classList.add('active'));
    }

    // BUDGETS PAGE: New Budget Button
    const newBudgetBtn = document.getElementById('new-budget-btn');
    const budgetModal = document.getElementById('budget-modal');
    if (newBudgetBtn && budgetModal) {
        newBudgetBtn.addEventListener('click', () => budgetModal.classList.add('active'));
    }

    // GOALS PAGE: New Goal Button
    const newGoalBtn = document.getElementById('new-goal-btn');
    const goalModal = document.getElementById('goal-modal');
    if (newGoalBtn && goalModal) {
        newGoalBtn.addEventListener('click', () => goalModal.classList.add('active'));
    }

    // Close Buttons for Modals
    document.querySelectorAll('.btn-icon').forEach((closeBtn) => {
        closeBtn.addEventListener('click', (event) => {
            const modal = event.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });

    // Close Modals with Cancel Buttons
    document.querySelectorAll('.btn-secondary').forEach((cancelBtn) => {
        cancelBtn.addEventListener('click', (event) => {
            const modal = event.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });

    // Helper Functions for Reports
    function generateReportData(reportName, dateRange, startDate, endDate) {
        const currentDate = new Date();
        const report = {
            name: reportName,
            dateRange: dateRange,
            startDate: startDate || new Date(currentDate.setDate(currentDate.getDate() - 30)).toISOString().split('T')[0],
            endDate: endDate || new Date().toISOString().split('T')[0],
            data: [
                { category: 'Housing', amount: 500 },
                { category: 'Food & Dining', amount: 300 },
                { category: 'Transportation', amount: 150 },
                { category: 'Utilities', amount: 200 },
                { category: 'Entertainment', amount: 100 },
            ]
        };
        return report;
    }

    function displayGeneratedReport(report) {
        const customReportsContainer = document.getElementById('custom-reports');
        if (customReportsContainer) {
            const reportElement = document.createElement('div');
            reportElement.className = 'report-item';
            reportElement.innerHTML = `
                <h3>${report.name}</h3>
                <p>Date Range: ${report.startDate} to ${report.endDate}</p>
                <ul>
                    ${report.data.map(item => `<li>${item.category}: $${item.amount}</li>`).join('')}
                </ul>
            `;
            customReportsContainer.appendChild(reportElement);
        }

        const categoryChartCanvas = document.getElementById('category-report-chart');
        if (categoryChartCanvas) {
            new Chart(categoryChartCanvas, {
                type: 'pie',
                data: {
                    labels: report.data.map(item => item.category),
                    datasets: [{
                        data: report.data.map(item => item.amount),
                        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                    }],
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'top' } }
                }
            });
        }
    }
});
