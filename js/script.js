// Transaction Model
class Transaction {
    constructor(description, amount, category, type = 'expense', date = new Date()) {
        this.id = Date.now();
        this.description = description;
        this.amount = parseFloat(amount);
        this.category = category;
        this.type = type;
        this.date = date instanceof Date ? date.toISOString() : new Date(date).toISOString();
        this.createdAt = new Date().toISOString();
        this.month = new Date(date).getMonth();
        this.year = new Date(date).getFullYear();
    }
}

// Category Manager Class
class CategoryManager {
    constructor() {
        this.categories = this.loadCategories();
    }

    loadCategories() {
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            return JSON.parse(savedCategories);
        }

        // Default categories if none exist
        const defaultCategories = {
            income: {
                name: 'Income',
                icon: 'wallet',
                color: '#059669',
                subcategories: ['Salary', 'Freelance', 'Investments']
            },
            housing: {
                name: 'Housing',
                icon: 'home',
                color: '#7c3aed',
                subcategories: ['Rent', 'Utilities', 'Maintenance']
            },
            transportation: {
                name: 'Transportation',
                icon: 'car',
                color: '#2563eb',
                subcategories: ['Fuel', 'Public Transit', 'Maintenance']
            },
            food: {
                name: 'Food & Dining',
                icon: 'utensils',
                color: '#dc2626',
                subcategories: ['Groceries', 'Restaurants', 'Delivery']
            },
            entertainment: {
                name: 'Entertainment',
                icon: 'film',
                color: '#db2777',
                subcategories: ['Movies', 'Games', 'Subscriptions']
            },
            shopping: {
                name: 'Shopping',
                icon: 'shopping-bag',
                color: '#9333ea',
                subcategories: ['Clothing', 'Electronics', 'General']
            },
            healthcare: {
                name: 'Healthcare',
                icon: 'heart',
                color: '#059669',
                subcategories: ['Insurance', 'Medications', 'Doctor']
            }
        };

        localStorage.setItem('categories', JSON.stringify(defaultCategories));
        return defaultCategories;
    }

    getAllCategories() {
        return Object.entries(this.categories).map(([id, data]) => ({
            id,
            ...data
        }));
    }

    getCategoryById(id) {
        return this.categories[id];
    }

    getCategoryColor(id) {
        return this.categories[id]?.color || '#64748b';
    }
}

// Theme Manager Class
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                primary: '#0f172a',
                background: '#f8fafc',
                card: '#ffffff',
                text: '#334155'
            },
            dark: {
                primary: '#1e293b',
                background: '#0f172a',
                card: '#1e293b',
                text: '#f1f5f9'
            }
        };
        
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        this.currentTheme = themeName;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        return newTheme;
    }
}

// Settings Manager Class
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }

        // Default settings
        const defaultSettings = {
            currency: 'USD',
            language: 'en-US',
            dateFormat: 'MM/DD/YYYY',
            notifications: true,
            theme: 'light',
            compactView: false
        };

        localStorage.setItem('settings', JSON.stringify(defaultSettings));
        return defaultSettings;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    getSetting(key) {
        return this.settings[key];
    }
}

class FinanceTracker {
    constructor() {
        // Initialize managers
        this.categoryManager = new CategoryManager();
        this.themeManager = new ThemeManager();
        this.settingsManager = new SettingsManager();

        // Load data from localStorage
        this.transactions = this.loadTransactions();
        this.currentPeriod = '30'; // Default to 30 days view
        
        // Charts storage
        this.charts = {
            main: null,
            category: null,
            trend: null
        };

        // State
        this.isLoading = false;
        this.filters = {
            startDate: null,
            endDate: null,
            category: null,
            type: null,
            minAmount: null,
            maxAmount: null
        };

        // Initialize the application
        this.initializeApp();
    }

    async initializeApp() {
        try {
            this.showLoader();
            await this.initializeEventListeners();
            await this.initializeCharts();
            this.updateUI();
            this.hideLoader();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Error initializing application', 'error');
            this.hideLoader();
        }
    }

    // Data Management Methods
    loadTransactions() {
        try {
            const savedTransactions = localStorage.getItem('transactions');
            return savedTransactions ? JSON.parse(savedTransactions) : [];
        } catch (error) {
            console.error('Error loading transactions:', error);
            return [];
        }
    }

    saveTransactions() {
        try {
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error saving transactions:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    addTransaction(transactionData) {
        const transaction = new Transaction(
            transactionData.description,
            transactionData.amount,
            transactionData.category,
            transactionData.type,
            transactionData.date
        );

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.updateUI();
        this.showNotification('Transaction added successfully');
        
        return transaction;
    }

    updateTransaction(id, updates) {
        const index = this.transactions.findIndex(t => t.id === parseInt(id));
        if (index === -1) return false;

        this.transactions[index] = { ...this.transactions[index], ...updates };
        this.saveTransactions();
        this.updateUI();
        this.showNotification('Transaction updated successfully');
        
        return true;
    }

    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === parseInt(id));
        if (index === -1) return false;

        this.transactions.splice(index, 1);
        this.saveTransactions();
        this.updateUI();
        this.showNotification('Transaction deleted successfully');
        
        return true;
    }

    getFilteredTransactions(startDate = null, endDate = null) {
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            if (startDate && transactionDate < startDate) return false;
            if (endDate && transactionDate > endDate) return false;
            
            if (this.filters.category && transaction.category !== this.filters.category) return false;
            if (this.filters.type && transaction.type !== this.filters.type) return false;
            if (this.filters.minAmount && transaction.amount < this.filters.minAmount) return false;
            if (this.filters.maxAmount && transaction.amount > this.filters.maxAmount) return false;
            
            return true;
        });
    }

    // Data Import/Export Methods
    async exportData() {
        try {
            const data = {
                transactions: this.transactions,
                categories: this.categoryManager.categories,
                settings: this.settingsManager.settings,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance_data_${this.formatDate(new Date(), 'file')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Data exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting data', 'error');
        }
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!this.validateImportData(data)) {
                throw new Error('Invalid data format');
            }

            this.transactions = data.transactions;
            if (data.categories) {
                this.categoryManager.categories = data.categories;
                localStorage.setItem('categories', JSON.stringify(data.categories));
            }
            if (data.settings) {
                this.settingsManager.updateSettings(data.settings);
            }

            this.saveTransactions();
            this.updateUI();
            this.showNotification('Data imported successfully');
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Error importing data', 'error');
        }
    }

    validateImportData(data) {
        return data && 
               Array.isArray(data.transactions) && 
               data.transactions.every(t => 
                   t.id && t.description && 
                   t.amount && t.category && 
                   t.date
               );
    }

    // Utility Methods
    formatCurrency(amount) {
        return new Intl.NumberFormat(this.settingsManager.getSetting('language'), {
            style: 'currency',
            currency: this.settingsManager.getSetting('currency')
        }).format(amount);
    }

    formatDate(date, format = 'display') {
        const d = new Date(date);
        switch (format) {
            case 'file':
                return d.toISOString().split('T')[0];
            case 'short':
                return d.toLocaleDateString(this.settingsManager.getSetting('language'), { 
                    month: 'short', 
                    day: 'numeric' 
                });
            case 'display':
                return d.toLocaleDateString(this.settingsManager.getSetting('language'), { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            default:
                return d.toISOString();
        }
    }

    showLoader() {
        this.isLoading = true;
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.classList.add('active');
    }

    hideLoader() {
        this.isLoading = false;
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.classList.remove('active');
    }

    showNotification(message, type = 'success', duration = 3000) {
        if (!this.settingsManager.getSetting('notifications')) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// Add these methods to the FinanceTracker class
class FinanceTracker {
    // ... previous code ...

    initializeEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            const newTheme = this.themeManager.toggleTheme();
            document.getElementById('theme-toggle').innerHTML = 
                `<i class="fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}"></i>`;
        });

        // Transaction Modal Events
        document.getElementById('new-transaction-btn')?.addEventListener('click', () => 
            this.openTransactionModal());
        
        document.getElementById('close-modal')?.addEventListener('click', () => 
            this.closeTransactionModal());
        
        document.getElementById('cancel-transaction')?.addEventListener('click', () => 
            this.closeTransactionModal());

        // Transaction Form Submit
        document.getElementById('transaction-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransactionSubmit(e);
        });

        // Chart Period Selection
        document.getElementById('chart-period')?.addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            this.updateCharts();
        });

        // Category Selection Event
        document.getElementById('category')?.addEventListener('change', (e) => {
            const type = e.target.value === 'income' ? 'income' : 'expense';
            document.getElementById('type').value = type;
        });

        // Type Selection Event
        document.getElementById('type')?.addEventListener('change', (e) => {
            if (e.target.value === 'income') {
                document.getElementById('category').value = 'income';
            }
        });

        // Table Row Actions
        document.getElementById('recent-transactions')?.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;

            const transactionId = action.closest('tr').dataset.id;
            switch (action.dataset.action) {
                case 'edit':
                    this.editTransaction(transactionId);
                    break;
                case 'delete':
                    this.confirmDeleteTransaction(transactionId);
                    break;
            }
        });
    }

    openTransactionModal(transaction = null) {
        const modal = document.getElementById('transaction-modal');
        const form = document.getElementById('transaction-form');
        const title = modal.querySelector('.card-title');

        // Reset form
        form.reset();
        form.removeAttribute('data-transaction-id');

        // Set today's date as default
        document.getElementById('date').valueAsDate = new Date();

        // If editing existing transaction
        if (transaction) {
            title.textContent = 'Edit Transaction';
            form.dataset.transactionId = transaction.id;
            this.populateTransactionForm(transaction);
        } else {
            title.textContent = 'Add Transaction';
        }

        // Populate categories
        this.populateCategorySelect();

        modal.classList.add('active');
    }

    closeTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        modal.classList.remove('active');
        document.getElementById('transaction-form').reset();
    }

    populateTransactionForm(transaction) {
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('category').value = transaction.category;
        document.getElementById('type').value = transaction.type;
        document.getElementById('date').value = transaction.date.split('T')[0];
    }

    populateCategorySelect() {
        const select = document.getElementById('category');
        select.innerHTML = '<option value="">Select Category</option>';

        this.categoryManager.getAllCategories().forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    async handleTransactionSubmit(event) {
        event.preventDefault();
        this.showLoader();

        try {
            const form = event.target;
            const transactionData = {
                description: document.getElementById('description').value,
                amount: parseFloat(document.getElementById('amount').value),
                category: document.getElementById('category').value,
                type: document.getElementById('type').value,
                date: document.getElementById('date').value
            };

            if (form.dataset.transactionId) {
                await this.updateTransaction(form.dataset.transactionId, transactionData);
            } else {
                await this.addTransaction(transactionData);
            }

            this.closeTransactionModal();
        } catch (error) {
            console.error('Transaction submission error:', error);
            this.showNotification('Error saving transaction', 'error');
        } finally {
            this.hideLoader();
        }
    }

    updateUI() {
        this.updateMetrics();
        this.updateTransactionsList();
        this.updateCharts();
    }

    updateMetrics() {
        const metrics = this.calculateMetrics();
        
        // Update balance card
        document.getElementById('total-balance').textContent = 
            this.formatCurrency(metrics.balance);
        document.getElementById('balance-change').textContent = 
            `${Math.abs(metrics.balanceChange).toFixed(1)}%`;
        
        // Update income card
        document.getElementById('total-income').textContent = 
            this.formatCurrency(metrics.income);
        document.getElementById('income-change').textContent = 
            `${Math.abs(metrics.incomeChange).toFixed(1)}%`;
        
        // Update expenses card
        document.getElementById('total-expenses').textContent = 
            this.formatCurrency(metrics.expenses);
        document.getElementById('expense-change').textContent = 
            `${Math.abs(metrics.expenseChange).toFixed(1)}%`;

        // Update change indicators
        this.updateChangeIndicator('balance-change', metrics.balanceChange);
        this.updateChangeIndicator('income-change', metrics.incomeChange);
        this.updateChangeIndicator('expense-change', metrics.expenseChange);
    }

    updateChangeIndicator(elementId, changePercent) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const parent = element.parentElement;
        const icon = parent.querySelector('i');

        if (changePercent > 0) {
            parent.classList.remove('negative');
            parent.classList.add('positive');
            icon.className = 'fas fa-arrow-up';
        } else {
            parent.classList.remove('positive');
            parent.classList.add('negative');
            icon.className = 'fas fa-arrow-down';
        }
    }

    updateTransactionsList() {
        const tbody = document.getElementById('recent-transactions');
        if (!tbody) return;

        tbody.innerHTML = '';
        const recentTransactions = this.transactions.slice(0, 5);

        recentTransactions.forEach(transaction => {
            const tr = document.createElement('tr');
            tr.dataset.id = transaction.id;
            
            const category = this.categoryManager.getCategoryById(transaction.category);
            const categoryName = category ? category.name : transaction.category;
            
            tr.innerHTML = `
                <td>${transaction.description}</td>
                <td>${categoryName}</td>
                <td>${this.formatDate(transaction.date, 'short')}</td>
                <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
                <td>
                    <button class="btn-icon" data-action="edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    confirmDeleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.deleteTransaction(id);
        }
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === parseInt(id));
        if (transaction) {
            this.openTransactionModal(transaction);
        }
    }
}

class FinanceTracker {
    // ... previous code ...

    async initializeCharts() {
        try {
            await Promise.all([
                this.initializeMainChart(),
                this.initializeCategoryChart()
            ]);
        } catch (error) {
            console.error('Error initializing charts:', error);
            this.showNotification('Error initializing charts', 'error');
        }
    }

    initializeMainChart() {
        const ctx = document.getElementById('main-chart')?.getContext('2d');
        if (!ctx) return;

        // Create gradients for the chart
        const gradientIncome = ctx.createLinearGradient(0, 0, 0, 400);
        gradientIncome.addColorStop(0, 'rgba(5, 150, 105, 0.2)');
        gradientIncome.addColorStop(1, 'rgba(5, 150, 105, 0)');

        const gradientExpenses = ctx.createLinearGradient(0, 0, 0, 400);
        gradientExpenses.addColorStop(0, 'rgba(220, 38, 38, 0.2)');
        gradientExpenses.addColorStop(1, 'rgba(220, 38, 38, 0)');

        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        borderColor: '#059669',
                        backgroundColor: gradientIncome,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        data: []
                    },
                    {
                        label: 'Expenses',
                        borderColor: '#dc2626',
                        backgroundColor: gradientExpenses,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        data: []
                    }
                ]
            },
            options: this.getMainChartOptions()
        });
    }

    getMainChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    titleFont: {
                        size: 13
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 12,
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: (value) => this.formatCurrency(value)
                    }
                }
            }
        };
    }

    initializeCategoryChart() {
        const ctx = document.getElementById('category-chart')?.getContext('2d');
        if (!ctx) return;

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: this.getCategoryChartOptions()
        });
    }

    getCategoryChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    callbacks: {
                        label: (context) => {
                            const percentage = ((context.raw / context.dataset.data.reduce((a, b) => a + b)) * 100).toFixed(1);
                            return `${context.label}: ${this.formatCurrency(context.raw)} (${percentage}%)`;
                        }
                    }
                }
            }
        };
    }

    updateCharts() {
        this.updateMainChart();
        this.updateCategoryChart();
    }

    updateMainChart() {
        if (!this.charts.main) return;

        const days = parseInt(this.currentPeriod);
        const data = this.getChartData(days);

        this.charts.main.data.labels = data.labels;
        this.charts.main.data.datasets[0].data = data.income;
        this.charts.main.data.datasets[1].data = data.expenses;
        this.charts.main.update();
    }

    getChartData(days) {
        const now = new Date();
        const data = Array.from({ length: days }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            return {
                date,
                income: 0,
                expenses: 0
            };
        }).reverse();

        this.transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const dataPoint = data.find(d => 
                d.date.toDateString() === transactionDate.toDateString()
            );
            
            if (dataPoint) {
                if (transaction.type === 'income') {
                    dataPoint.income += transaction.amount;
                } else {
                    dataPoint.expenses += transaction.amount;
                }
            }
        });

        return {
            labels: data.map(d => this.formatDate(d.date, 'short')),
            income: data.map(d => d.income),
            expenses: data.map(d => d.expenses)
        };
    }

    updateCategoryChart() {
        if (!this.charts.category) return;

        const categoryTotals = {};
        const recentTransactions = this.getFilteredTransactions(
            new Date(Date.now() - this.currentPeriod * 24 * 60 * 60 * 1000)
        );

        recentTransactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                if (!categoryTotals[transaction.category]) {
                    categoryTotals[transaction.category] = 0;
                }
                categoryTotals[transaction.category] += transaction.amount;
            }
        });

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

        this.charts.category.data.labels = sortedCategories.map(([category]) => {
            const categoryInfo = this.categoryManager.getCategoryById(category);
            return categoryInfo ? categoryInfo.name : category;
        });

        this.charts.category.data.datasets[0].data = sortedCategories.map(([, amount]) => amount);
        this.charts.category.data.datasets[0].backgroundColor = sortedCategories.map(([category]) => {
            return this.categoryManager.getCategoryColor(category);
        });

        this.charts.category.update();
    }

    animateValue(element, start, end, duration = 1000) {
        if (!element) return;

        const startTime = performance.now();
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const value = start + (end - start) * this.easeOutQuad(progress);
            element.textContent = this.formatCurrency(value);

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };

        requestAnimationFrame(updateValue);
    }

    easeOutQuad(x) {
        return 1 - (1 - x) * (1 - x);
    }
}

class FinanceTracker {
    // ... previous code ...

    calculateMetrics(startDate = null, endDate = null) {
        const currentTransactions = this.getFilteredTransactions(startDate, endDate);
        const previousTransactions = this.getFilteredTransactions(
            new Date(startDate?.getTime() - 30 * 24 * 60 * 60 * 1000),
            new Date(endDate?.getTime() - 30 * 24 * 60 * 60 * 1000)
        );

        const current = this.calculatePeriodMetrics(currentTransactions);
        const previous = this.calculatePeriodMetrics(previousTransactions);

        return {
            ...current,
            balanceChange: this.calculatePercentageChange(previous.balance, current.balance),
            incomeChange: this.calculatePercentageChange(previous.income, current.income),
            expenseChange: this.calculatePercentageChange(previous.expenses, current.expenses),
            savingsRate: current.income > 0 ? ((current.income - current.expenses) / current.income) * 100 : 0
        };
    }

    calculatePeriodMetrics(transactions) {
        const metrics = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                acc.income += transaction.amount;
            } else {
                acc.expenses += transaction.amount;
            }
            return acc;
        }, { income: 0, expenses: 0 });

        return {
            ...metrics,
            balance: metrics.income - metrics.expenses
        };
    }

    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) return newValue === 0 ? 0 : 100;
        return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    }

    analyzeSpendingPatterns() {
        const categories = {};
        const monthlySpending = {};

        this.transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                // Category analysis
                if (!categories[transaction.category]) {
                    categories[transaction.category] = {
                        total: 0,
                        count: 0,
                        average: 0
                    };
                }
                categories[transaction.category].total += transaction.amount;
                categories[transaction.category].count++;

                // Monthly analysis
                const monthKey = `${transaction.year}-${transaction.month}`;
                if (!monthlySpending[monthKey]) {
                    monthlySpending[monthKey] = 0;
                }
                monthlySpending[monthKey] += transaction.amount;
            }
        });

        // Calculate averages
        Object.values(categories).forEach(category => {
            category.average = category.total / category.count;
        });

        return { categories, monthlySpending };
    }

    generateInsights() {
        const insights = [];
        const metrics = this.calculateMetrics();
        const patterns = this.analyzeSpendingPatterns();

        // Savings Rate Insight
        if (metrics.savingsRate < 20) {
            insights.push({
                type: 'warning',
                title: 'Low Savings Rate',
                description: 'Your savings rate is below 20%. Consider reducing non-essential expenses.',
                action: 'Review your budget and identify areas to cut back.'
            });
        }

        // Spending Pattern Insights
        const categoryTotals = Object.entries(patterns.categories)
            .sort(([, a], [, b]) => b.total - a.total);

        if (categoryTotals.length > 0) {
            const topCategory = categoryTotals[0];
            insights.push({
                type: 'info',
                title: 'Top Spending Category',
                description: `Your highest spending is in ${this.categoryManager.getCategoryById(topCategory[0]).name}`,
                action: 'Review this category for potential savings.'
            });
        }

        // Month-over-Month Changes
        if (metrics.expenseChange > 20) {
            insights.push({
                type: 'warning',
                title: 'Increased Spending',
                description: 'Your expenses have increased by more than 20% compared to last month.',
                action: 'Review recent transactions for unusual spending.'
            });
        }

        return insights;
    }

    generateReport(type = 'summary') {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.calculateMetrics(),
            insights: this.generateInsights()
        };

        switch (type) {
            case 'detailed':
                return this.generateDetailedReport(report);
            case 'summary':
                return this.generateSummaryReport(report);
            case 'trends':
                return this.generateTrendsReport(report);
            default:
                return report;
        }
    }

    generateSummaryReport(baseReport) {
        return {
            ...baseReport,
            summary: {
                totalTransactions: this.transactions.length,
                averageTransaction: this.transactions.reduce((sum, t) => sum + t.amount, 0) / this.transactions.length,
                topCategories: this.getTopCategories(5),
                recentTransactions: this.transactions.slice(0, 5)
            }
        };
    }

    generateDetailedReport(baseReport) {
        const patterns = this.analyzeSpendingPatterns();
        
        return {
            ...baseReport,
            details: {
                categoryAnalysis: patterns.categories,
                monthlyTrends: patterns.monthlySpending,
                transactionBreakdown: this.getTransactionBreakdown(),
                averages: this.calculateAverages()
            }
        };
    }

    generateTrendsReport(baseReport) {
        return {
            ...baseReport,
            trends: {
                monthly: this.calculateMonthlyTrends(),
                categories: this.calculateCategoryTrends(),
                growth: this.calculateGrowthRates()
            }
        };
    }

    getTopCategories(limit = 5) {
        const categoryTotals = {};
        
        this.transactions.forEach(transaction => {
            if (!categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] = 0;
            }
            categoryTotals[transaction.category] += transaction.amount;
        });

        return Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([category, amount]) => ({
                category: this.categoryManager.getCategoryById(category).name,
                amount,
                percentage: (amount / Object.values(categoryTotals).reduce((a, b) => a + b)) * 100
            }));
    }

    calculateAverages() {
        const transactions = this.transactions;
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        return {
            daily: totalAmount / 30,  // Last 30 days
            weekly: totalAmount / 4,   // Last 4 weeks
            monthly: totalAmount,      // Last month
            perTransaction: totalAmount / transactions.length
        };
    }

    getTransactionBreakdown() {
        return {
            byType: {
                income: this.transactions.filter(t => t.type === 'income').length,
                expense: this.transactions.filter(t => t.type === 'expense').length
            },
            byAmount: {
                small: this.transactions.filter(t => t.amount <= 50).length,
                medium: this.transactions.filter(t => t.amount > 50 && t.amount <= 200).length,
                large: this.transactions.filter(t => t.amount > 200).length
            }
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.financeTracker = new FinanceTracker();
});
