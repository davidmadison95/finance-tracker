class FinanceTracker {
    constructor() {
        // Initialize managers
        this.categoryManager = new CategoryManager();
        this.themeManager = new ThemeManager();

        // Load data from localStorage
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.settings = JSON.parse(localStorage.getItem('settings')) || this.getDefaultSettings();
        
        // Chart instances
        this.charts = {
            main: null,
            category: null,
            trend: null
        };

        // State management
        this.currentPeriod = '30'; // Default to 30 days view
        this.isLoading = false;
        this.filters = {
            startDate: null,
            endDate: null,
            category: null,
            type: null,
            minAmount: null,
            maxAmount: null
        };

        // Initialize application
        this.initializeApp();
    }

    getDefaultSettings() {
        return {
            currency: 'USD',
            language: 'en-US',
            weekStart: 'monday',
            notifications: true,
            theme: 'light',
            categories: true,
            goalReminders: true,
            compactView: false,
            decimals: 2,
            dateFormat: 'MM/DD/YYYY'
        };
    }

    async initializeApp() {
        try {
            this.showLoader();
            await this.initializeEventListeners();
            await this.initializeCharts();
            this.updateUI();
            this.hideLoader();
            this.showNotification('Application loaded successfully', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Error initializing application', 'error');
            this.hideLoader();
        }
    }

    // Data Management Methods
    addTransaction(transactionData) {
        try {
            const transaction = new Transaction(
                transactionData.description,
                transactionData.amount,
                transactionData.category,
                transactionData.subcategory,
                transactionData.type
            );

            this.transactions.unshift(transaction);
            this.saveData();
            this.updateUI();
            this.updateRelevantGoals(transaction);
            this.showNotification('Transaction added successfully', 'success');
            
            return transaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            this.showNotification('Error adding transaction', 'error');
            throw error;
        }
    }

    updateTransaction(id, updates) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Transaction not found');
        }

        const oldTransaction = this.transactions[index];
        const updatedTransaction = { ...oldTransaction, ...updates };
        this.transactions[index] = updatedTransaction;
        
        this.saveData();
        this.updateUI();
        this.showNotification('Transaction updated successfully', 'success');
        
        return updatedTransaction;
    }

    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Transaction not found');
        }

        this.transactions.splice(index, 1);
        this.saveData();
        this.updateUI();
        this.showNotification('Transaction deleted successfully', 'success');
    }

    addGoal(goalData) {
        try {
            const goal = new BudgetGoal(
                goalData.category,
                goalData.targetAmount,
                goalData.deadline,
                goalData.description
            );

            this.goals.push(goal);
            this.saveData();
            this.updateUI();
            this.showNotification('Goal added successfully', 'success');
            
            return goal;
        } catch (error) {
            console.error('Error adding goal:', error);
            this.showNotification('Error adding goal', 'error');
            throw error;
        }
    }

    updateGoal(id, updates) {
        const goal = this.goals.find(g => g.id === id);
        if (!goal) {
            throw new Error('Goal not found');
        }

        Object.assign(goal, updates);
        this.saveData();
        this.updateUI();
        this.showNotification('Goal updated successfully', 'success');
        
        return goal;
    }

    deleteGoal(id) {
        const index = this.goals.findIndex(g => g.id === id);
        if (index === -1) {
            throw new Error('Goal not found');
        }

        this.goals.splice(index, 1);
        this.saveData();
        this.updateUI();
        this.showNotification('Goal deleted successfully', 'success');
    }

    // Data Analysis Methods
    calculateMetrics(startDate = null, endDate = null) {
        const filteredTransactions = this.getFilteredTransactions(startDate, endDate);
        
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
        
        // Calculate category totals
        const categoryTotals = this.calculateCategoryTotals(filteredTransactions);
        
        // Calculate month-over-month changes
        const changes = this.calculateMonthOverMonthChanges(filteredTransactions);

        return {
            income,
            expenses,
            balance,
            savingsRate,
            categoryTotals,
            changes,
            transactionCount: filteredTransactions.length,
            averageTransaction: filteredTransactions.length > 0 
                ? expenses / filteredTransactions.filter(t => t.type === 'expense').length 
                : 0
        };
    }

    calculateCategoryTotals(transactions) {
        return transactions.reduce((totals, t) => {
            if (!totals[t.category]) {
                totals[t.category] = 0;
            }
            totals[t.category] += t.amount;
            return totals;
        }, {});
    }

    calculateMonthOverMonthChanges(transactions) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const currentMonthData = this.getMonthlyTotals(
            transactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && 
                       date.getFullYear() === currentYear;
            })
        );

        const previousMonthData = this.getMonthlyTotals(
            transactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === (currentMonth - 1) && 
                       date.getFullYear() === currentYear;
            })
        );

        return {
            income: this.calculatePercentageChange(
                previousMonthData.income, 
                currentMonthData.income
            ),
            expenses: this.calculatePercentageChange(
                previousMonthData.expenses, 
                currentMonthData.expenses
            ),
            balance: this.calculatePercentageChange(
                previousMonthData.balance, 
                currentMonthData.balance
            )
        };
    }

    getMonthlyTotals(transactions) {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expenses,
            balance: income - expenses
        };
    }

    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) return newValue === 0 ? 0 : 100;
        return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    }

    // Data Filtering Methods
    getFilteredTransactions(startDate = null, endDate = null, filters = {}) {
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            // Date range filter
            if (startDate && transactionDate < startDate) return false;
            if (endDate && transactionDate > endDate) return false;
            
            // Category filter
            if (filters.category && transaction.category !== filters.category) return false;
            
            // Type filter
            if (filters.type && transaction.type !== filters.type) return false;
            
            // Amount range filter
            if (filters.minAmount && transaction.amount < filters.minAmount) return false;
            if (filters.maxAmount && transaction.amount > filters.maxAmount) return false;
            
            return true;
        });
    }

    // Data Persistence Methods
    saveData() {
        try {
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            localStorage.setItem('goals', JSON.stringify(this.goals));
            localStorage.setItem('settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    exportData() {
        const data = {
            transactions: this.transactions,
            goals: this.goals,
            settings: this.settings,
            categories: this.categoryManager.getAllCategories(),
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
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!this.validateImportData(data)) {
                throw new Error('Invalid data format');
            }

            this.transactions = data.transactions;
            this.goals = data.goals || [];
            this.settings = { ...this.settings, ...data.settings };

            if (data.categories) {
                this.categoryManager.categories = data.categories;
                this.categoryManager.saveCategories();
            }

            this.saveData();
            this.updateUI();
            this.showNotification('Data imported successfully', 'success');
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Error importing data', 'error');
        }
    }

    // Utility Methods
    formatCurrency(amount) {
        return new Intl.NumberFormat(this.settings.language, {
            style: 'currency',
            currency: this.settings.currency,
            minimumFractionDigits: this.settings.decimals,
            maximumFractionDigits: this.settings.decimals
        }).format(amount);
    }

    formatDate(date, format = 'display') {
        const d = new Date(date);
        switch (format) {
            case 'file':
                return d.toISOString().split('T')[0];
            case 'short':
                return d.toLocaleDateString(this.settings.language, { 
                    month: 'short', 
                    day: 'numeric' 
                });
            case 'display':
                return d.toLocaleDateString(this.settings.language, { 
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
        // Add loading UI logic here
    }

    hideLoader() {
        this.isLoading = false;
        // Remove loading UI logic here
    }

    showNotification(message, type = 'success', duration = 3000) {
        if (!this.settings.notifications) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
    }
}
