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
