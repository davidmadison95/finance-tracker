// Core Classes for Finance Tracker
class Transaction {
    constructor(description, amount, category, subcategory, type = 'expense') {
        this.id = Date.now();
        this.description = description;
        this.amount = parseFloat(amount);
        this.category = category;
        this.subcategory = subcategory;
        this.type = type;
        this.date = new Date().toISOString();
        this.status = 'completed';
        this.tags = [];
        this.notes = '';
    }
}

class BudgetGoal {
    constructor(category, targetAmount, deadline, description = '') {
        this.id = Date.now();
        this.category = category;
        this.targetAmount = parseFloat(targetAmount);
        this.currentAmount = 0;
        this.deadline = new Date(deadline).toISOString();
        this.description = description;
        this.createdAt = new Date().toISOString();
        this.status = 'in_progress';
        this.history = [];
    }

    updateProgress(amount) {
        this.currentAmount += parseFloat(amount);
        this.history.push({
            date: new Date().toISOString(),
            amount: amount,
            total: this.currentAmount
        });

        if (this.currentAmount >= this.targetAmount) {
            this.status = 'completed';
        }
    }

    getProgress() {
        return (this.currentAmount / this.targetAmount) * 100;
    }

    getRemainingDays() {
        const now = new Date();
        const deadline = new Date(this.deadline);
        const diffTime = deadline - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    isOnTrack() {
        const totalDays = Math.ceil((new Date(this.deadline) - new Date(this.createdAt)) / (1000 * 60 * 60 * 24));
        const remainingDays = this.getRemainingDays();
        const expectedProgress = ((totalDays - remainingDays) / totalDays) * this.targetAmount;
        return this.currentAmount >= expectedProgress;
    }
}

class CategoryManager {
    constructor() {
        this.categories = this.loadCategories();
    }

    loadCategories() {
        const defaultCategories = {
            income: {
                name: 'Income',
                icon: 'wallet',
                color: '#059669',
                subcategories: ['Salary', 'Freelance', 'Investments', 'Other']
            },
            housing: {
                name: 'Housing',
                icon: 'home',
                color: '#7c3aed',
                subcategories: ['Rent', 'Mortgage', 'Utilities', 'Maintenance']
            },
            transportation: {
                name: 'Transportation',
                icon: 'car',
                color: '#2563eb',
                subcategories: ['Fuel', 'Public Transit', 'Maintenance', 'Insurance']
            },
            food: {
                name: 'Food & Dining',
                icon: 'utensils',
                color: '#dc2626',
                subcategories: ['Groceries', 'Restaurants', 'Delivery', 'Snacks']
            },
            entertainment: {
                name: 'Entertainment',
                icon: 'film',
                color: '#db2777',
                subcategories: ['Movies', 'Games', 'Hobbies', 'Subscriptions']
            },
            shopping: {
                name: 'Shopping',
                icon: 'shopping-bag',
                color: '#9333ea',
                subcategories: ['Clothing', 'Electronics', 'Household', 'Gifts']
            },
            health: {
                name: 'Healthcare',
                icon: 'heart',
                color: '#059669',
                subcategories: ['Insurance', 'Medications', 'Doctor', 'Fitness']
            },
            personal: {
                name: 'Personal Care',
                icon: 'user',
                color: '#8b5cf6',
                subcategories: ['Grooming', 'Spa & Massage', 'Haircare', 'Cosmetics']
            },
            education: {
                name: 'Education',
                icon: 'book',
                color: '#ea580c',
                subcategories: ['Tuition', 'Books', 'Courses', 'Software']
            },
            bills: {
                name: 'Bills & Utilities',
                icon: 'file-invoice',
                color: '#0891b2',
                subcategories: ['Phone', 'Internet', 'Streaming', 'Insurance']
            },
            savings: {
                name: 'Savings',
                icon: 'piggy-bank',
                color: '#0d9488',
                subcategories: ['Emergency Fund', 'Retirement', 'Investment', 'Goals']
            },
            debt: {
                name: 'Debt',
                icon: 'credit-card',
                color: '#dc2626',
                subcategories: ['Credit Card', 'Loan Payment', 'Mortgage', 'Other']
            }
        };

        const savedCategories = localStorage.getItem('categories');
        return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    addCategory(id, name, icon, color, subcategories = []) {
        this.categories[id] = { name, icon, color, subcategories };
        this.saveCategories();
    }

    updateCategory(id, updates) {
        if (this.categories[id]) {
            this.categories[id] = { ...this.categories[id], ...updates };
            this.saveCategories();
        }
    }

    deleteCategory(id) {
        delete this.categories[id];
        this.saveCategories();
    }

    addSubcategory(categoryId, subcategory) {
        if (this.categories[categoryId] && 
            !this.categories[categoryId].subcategories.includes(subcategory)) {
            this.categories[categoryId].subcategories.push(subcategory);
            this.saveCategories();
        }
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
}

class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                primary: '#0f172a',
                primary_light: '#1e293b',
                accent: '#3b82f6',
                accent_dark: '#2563eb',
                success: '#059669',
                danger: '#dc2626',
                warning: '#d97706',
                background: '#f8fafc',
                card: '#ffffff',
                text: '#334155',
                text_light: '#64748b',
                border: '#e2e8f0'
            },
            dark: {
                primary: '#1e293b',
                primary_light: '#334155',
                accent: '#60a5fa',
                accent_dark: '#3b82f6',
                success: '#34d399',
                danger: '#f87171',
                warning: '#fbbf24',
                background: '#0f172a',
                card: '#1e293b',
                text: '#f1f5f9',
                text_light: '#94a3b8',
                border: '#334155'
            }
        };

        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(`--${property}`, value);
        });
        localStorage.setItem('theme', themeName);
        this.currentTheme = themeName;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    addCustomTheme(name, theme) {
        this.themes[name] = theme;
    }
}
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
// Add these methods to the FinanceTracker class
class FinanceTracker {
    // ... previous code ...

    async initializeCharts() {
        try {
            await Promise.all([
                this.initializeMainChart(),
                this.initializeCategoryChart(),
                this.initializeTrendChart(),
                this.initializeGoalsChart()
            ]);
        } catch (error) {
            console.error('Error initializing charts:', error);
            this.showNotification('Error initializing charts', 'error');
        }
    }

    initializeMainChart() {
        const ctx = document.getElementById('main-chart')?.getContext('2d');
        if (!ctx) return;

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
            options: {
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
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        titleFont: {
                            size: 14,
                            weight: 'normal'
                        },
                        bodyFont: {
                            size: 13
                        },
                        bodySpacing: 8,
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
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrency(value, true)
                        }
                    }
                }
            }
        });
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
            options: {
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
            }
        });
    }

    initializeTrendChart() {
        const ctx = document.getElementById('trend-chart')?.getContext('2d');
        if (!ctx) return;

        this.charts.trend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Net Income',
                    data: [],
                    backgroundColor: [],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Net Income: ${this.formatCurrency(context.raw)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrency(value, true)
                        }
                    }
                }
            }
        });
    }

    initializeGoalsChart() {
        const ctx = document.getElementById('goals-chart')?.getContext('2d');
        if (!ctx) return;

        this.charts.goals = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Progress',
                    data: [],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        max: 100,
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: (value) => `${value}%`
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        this.updateMainChart();
        this.updateCategoryChart();
        this.updateTrendChart();
        this.updateGoalsChart();
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

    updateCategoryChart() {
        if (!this.charts.category) return;

        const categoryTotals = this.calculateCategoryTotals(
            this.getFilteredTransactions(null, null, { type: 'expense' })
        );

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

        this.charts.category.data.labels = sortedCategories.map(([category]) => {
            const categoryInfo = this.categoryManager.getCategoryById(category);
            return categoryInfo ? categoryInfo.name : category;
        });

        this.charts.category.data.datasets[0].data = sortedCategories.map(([, amount]) => amount);
        this.charts.category.data.datasets[0].backgroundColor = sortedCategories.map(([category]) => {
            const categoryInfo = this.categoryManager.getCategoryById(category);
            return categoryInfo ? categoryInfo.color : '#64748b';
        });

        this.charts.category.update();
    }

    updateTrendChart() {
        if (!this.charts.trend) return;

        const monthlyData = this.getMonthlyTrends();

        this.charts.trend.data.labels = monthlyData.labels;
        this.charts.trend.data.datasets[0].data = monthlyData.netIncome;
        this.charts.trend.data.datasets[0].backgroundColor = monthlyData.netIncome.map(
            value => value >= 0 ? '#059669' : '#dc2626'
        );

        this.charts.trend.update();
    }

    updateGoalsChart() {
        if (!this.charts.goals) return;

        const activeGoals = this.goals.filter(goal => goal.status === 'in_progress');
        
        this.charts.goals.data.labels = activeGoals.map(goal => goal.description);
        this.charts.goals.data.datasets[0].data = activeGoals.map(goal => goal.getProgress());
        
        this.charts.goals.update();
    }

    getMonthlyTrends(months = 6) {
        const now = new Date();
        const data = Array.from({ length: months }, (_, i) => {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return {
                date,
                income: 0,
                expenses: 0
            };
        }).reverse();

        this.transactions.forEach(transaction => {
            const transDate = new Date(transaction.date);
            const dataPoint = data.find(d => 
                d.date.getMonth() === transDate.getMonth() && 
                d.date.getFullYear() === transDate.getFullYear()
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
            labels: data.map(d => d.date.toLocaleDateString(this.settings.language, { 
                month: 'short'
            })),
            netIncome: data.map(d => d.income - d.expenses)
        };
    }

    updateUI() {
        this.updateMetrics();
        this.updateTransactionsList();
        this.updateCharts();
        this.updateGoalsList();
        this.updateCategoryList();
    }

    updateMetrics() {
        const metrics = this.calculateMetrics();
        
        // Update summary cards
        document.getElementById('total-balance').textContent = this.formatCurrency(metrics.balance);
        document.getElementById('total-income').textContent = this.formatCurrency(metrics.income);
        document.getElementById('total-expenses').textContent = this.formatCurrency(metrics.expenses);
        
        // Update change indicators
        this.updateMetricChange('balance-change', metrics.changes.balance);
        this.updateMetricChange('income-change', metrics.changes.income);
        this.updateMetricChange('expense-change', metrics.changes.expenses);
        
        // Update additional metrics if they exist
        if (document.getElementById('savings-rate')) {
            document.getElementById('savings-rate').textContent = 
                `${metrics.savingsRate.toFixed(1)}%`;
        }
        
        if (document.getElementById('avg-transaction')) {
            document.getElementById('avg-transaction').textContent = 
                this.formatCurrency(metrics.averageTransaction);
        }
    }

    // ... Rest of the class methods ...
}
class FinanceTracker {
    // ... previous code ...

    async initializeEventListeners() {
        // Navigation and Sidebar
        this.initializeNavigationListeners();
        
        // Transaction Form
        this.initializeTransactionListeners();
        
        // Filters and Search
        this.initializeFilterListeners();
        
        // Category Management
        this.initializeCategoryListeners();
        
        // Goals Management
        this.initializeGoalListeners();
        
        // Settings and Theme
        this.initializeSettingsListeners();
        
        // Import/Export
        this.initializeDataManagementListeners();
    }

    initializeNavigationListeners() {
        // Sidebar toggle for mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && 
                    !sidebarToggle.contains(e.target) && 
                    window.innerWidth <= 1024) {
                    sidebar.classList.remove('active');
                }
            });
        }

        // Navigation menu items
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.dataset.view;
                this.navigateToView(view);
            });
        });
    }

    initializeTransactionListeners() {
        // New Transaction Button
        document.getElementById('new-transaction-btn')?.addEventListener('click', () => {
            this.openTransactionModal();
        });

        // Transaction Form
        const form = document.getElementById('transaction-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleTransactionSubmit(e);
        });

        // Dynamic Category Selection
        const categorySelect = document.getElementById('transaction-category');
        const subcategorySelect = document.getElementById('transaction-subcategory');
        
        categorySelect?.addEventListener('change', (e) => {
            this.updateSubcategoryOptions(e.target.value, subcategorySelect);
        });

        // Transaction Amount Input Formatting
        const amountInput = document.getElementById('transaction-amount');
        amountInput?.addEventListener('input', (e) => {
            this.formatAmountInput(e.target);
        });

        // Transaction List Actions
        document.getElementById('transactions-list')?.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;

            const transactionId = action.closest('[data-transaction-id]')?.dataset.transactionId;
            if (!transactionId) return;

            switch (action.dataset.action) {
                case 'edit':
                    this.editTransaction(transactionId);
                    break;
                case 'delete':
                    this.confirmDeleteTransaction(transactionId);
                    break;
                case 'details':
                    this.showTransactionDetails(transactionId);
                    break;
            }
        });
    }

    initializeFilterListeners() {
        // Date Range Picker
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            new DateRangePicker(dateRange, {
                onChange: (start, end) => {
                    this.filters.startDate = start;
                    this.filters.endDate = end;
                    this.applyFilters();
                }
            });
        }

        // Category Filter
        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.filters.category = e.target.value || null;
            this.applyFilters();
        });

        // Type Filter
        document.getElementById('type-filter')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value || null;
            this.applyFilters();
        });

        // Amount Range Filters
        const minAmount = document.getElementById('min-amount');
        const maxAmount = document.getElementById('max-amount');

        [minAmount, maxAmount].forEach(input => {
            input?.addEventListener('change', () => {
                this.filters.minAmount = minAmount.value ? parseFloat(minAmount.value) : null;
                this.filters.maxAmount = maxAmount.value ? parseFloat(maxAmount.value) : null;
                this.applyFilters();
            });
        });

        // Search Input
        const searchInput = document.getElementById('search-transactions');
        let searchTimeout;

        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.applyFilters();
            }, 300);
        });

        // Clear Filters
        document.getElementById('clear-filters')?.addEventListener('click', () => {
            this.clearFilters();
        });
    }

    initializeCategoryListeners() {
        // Category Form
        document.getElementById('category-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit(e);
        });

        // Category Color Picker
        const colorPicker = document.getElementById('category-color');
        colorPicker?.addEventListener('change', (e) => {
            this.updateColorPreview(e.target.value);
        });

        // Category List Actions
        document.getElementById('categories-list')?.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;

            const categoryId = action.closest('[data-category-id]')?.dataset.categoryId;
            if (!categoryId) return;

            switch (action.dataset.action) {
                case 'edit':
                    this.editCategory(categoryId);
                    break;
                case 'delete':
                    this.confirmDeleteCategory(categoryId);
                    break;
                case 'subcategories':
                    this.showSubcategories(categoryId);
                    break;
            }
        });
    }

    initializeGoalListeners() {
        // Goal Form
        document.getElementById('goal-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGoalSubmit(e);
        });

        // Goal Progress Updates
        document.getElementById('goals-list')?.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;

            const goalId = action.closest('[data-goal-id]')?.dataset.goalId;
            if (!goalId) return;

            switch (action.dataset.action) {
                case 'edit':
                    this.editGoal(goalId);
                    break;
                case 'delete':
                    this.confirmDeleteGoal(goalId);
                    break;
                case 'update-progress':
                    this.updateGoalProgress(goalId);
                    break;
            }
        });
    }

    initializeSettingsListeners() {
        // Theme Toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.themeManager.toggleTheme();
            this.updateCharts(); // Update charts for new theme
        });

        // Settings Form
        document.getElementById('settings-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSettingsSubmit(e);
        });

        // Currency Selection
        document.getElementById('currency-select')?.addEventListener('change', (e) => {
            this.settings.currency = e.target.value;
            this.saveSettings();
            this.updateUI();
        });

        // Language Selection
        document.getElementById('language-select')?.addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            this.saveSettings();
            this.updateUI();
        });

        // Notification Settings
        document.getElementById('notifications-toggle')?.addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
            this.saveSettings();
        });
    }

    initializeDataManagementListeners() {
        // Export Data
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });

        // Import Data
        const importInput = document.getElementById('import-data');
        importInput?.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                await this.importData(e.target.files[0]);
                e.target.value = ''; // Reset input
            }
        });

        // Backup Settings
        document.getElementById('auto-backup-toggle')?.addEventListener('change', (e) => {
            this.settings.autoBackup = e.target.checked;
            this.saveSettings();
            if (e.target.checked) {
                this.scheduleAutoBackup();
            }
        });
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('active');
        this.trapFocus(modal);
        this.handleModalClose(modal);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        this.releaseFocus();
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });

        firstFocusable.focus();
    }

    // Form Handling Methods
    async handleTransactionSubmit(event) {
        try {
            const form = event.target;
            const formData = new FormData(form);

            const transaction = {
                description: formData.get('description'),
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                subcategory: formData.get('subcategory'),
                type: formData.get('type'),
                date: formData.get('date') || new Date().toISOString(),
                notes: formData.get('notes')
            };

            if (form.dataset.transactionId) {
                await this.updateTransaction(form.dataset.transactionId, transaction);
            } else {
                await this.addTransaction(transaction);
            }

            this.closeModal('transaction-modal');
            form.reset();
        } catch (error) {
            console.error('Transaction submission error:', error);
            this.showNotification('Error saving transaction', 'error');
        }
    }

    // ... Additional event handling methods ...
}
class FinanceTracker {
    // ... previous code ...

    // Analytics and Reporting Methods
    generateFinancialReport(startDate = null, endDate = null) {
        const report = {
            summary: this.generateSummaryMetrics(startDate, endDate),
            trends: this.analyzeTrends(startDate, endDate),
            categories: this.analyzeCategories(startDate, endDate),
            budgetAnalysis: this.analyzeBudgetPerformance(startDate, endDate),
            recommendations: this.generateRecommendations(),
            goals: this.analyzeGoalsProgress(),
            timestamp: new Date().toISOString()
        };

        return report;
    }

    generateSummaryMetrics(startDate, endDate) {
        const transactions = this.getFilteredTransactions(startDate, endDate);
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome: income,
            totalExpenses: expenses,
            netIncome: income - expenses,
            savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
            transactionCount: transactions.length,
            averageExpense: expenses / transactions.filter(t => t.type === 'expense').length || 0,
            averageIncome: income / transactions.filter(t => t.type === 'income').length || 0,
            largestExpense: Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0),
            largestIncome: Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0)
        };
    }

    analyzeTrends(startDate, endDate) {
        const transactions = this.getFilteredTransactions(startDate, endDate);
        const monthlyData = this.groupTransactionsByMonth(transactions);
        
        return {
            monthlyTrends: this.calculateMonthlyTrends(monthlyData),
            movingAverages: this.calculateMovingAverages(monthlyData),
            seasonality: this.analyzeSeasonality(monthlyData),
            growth: this.calculateGrowthRates(monthlyData)
        };
    }

    calculateMonthlyTrends(monthlyData) {
        const trends = [];
        let previousMonth = null;

        for (const [month, data] of Object.entries(monthlyData)) {
            const trend = {
                month,
                income: data.income,
                expenses: data.expenses,
                netIncome: data.income - data.expenses,
                changeFromPrevMonth: previousMonth ? {
                    income: ((data.income - previousMonth.income) / previousMonth.income) * 100,
                    expenses: ((data.expenses - previousMonth.expenses) / previousMonth.expenses) * 100,
                    netIncome: ((data.income - data.expenses) - (previousMonth.income - previousMonth.expenses)) /
                              Math.abs(previousMonth.income - previousMonth.expenses) * 100
                } : null
            };
            
            trends.push(trend);
            previousMonth = data;
        }

        return trends;
    }

    calculateMovingAverages(monthlyData, periods = 3) {
        const movingAverages = [];
        const months = Object.keys(monthlyData);

        for (let i = periods - 1; i < months.length; i++) {
            let incomeSum = 0;
            let expenseSum = 0;

            for (let j = 0; j < periods; j++) {
                const monthData = monthlyData[months[i - j]];
                incomeSum += monthData.income;
                expenseSum += monthData.expenses;
            }

            movingAverages.push({
                month: months[i],
                averageIncome: incomeSum / periods,
                averageExpenses: expenseSum / periods
            });
        }

        return movingAverages;
    }

    analyzeSeasonality(monthlyData) {
        const monthlyAverages = {};
        const monthGroups = {};

        // Group data by month
        for (const [date, data] of Object.entries(monthlyData)) {
            const month = new Date(date).getMonth();
            if (!monthGroups[month]) {
                monthGroups[month] = [];
            }
            monthGroups[month].push(data);
        }

        // Calculate averages for each month
        for (const [month, data] of Object.entries(monthGroups)) {
            monthlyAverages[month] = {
                income: data.reduce((sum, d) => sum + d.income, 0) / data.length,
                expenses: data.reduce((sum, d) => sum + d.expenses, 0) / data.length
            };
        }

        return monthlyAverages;
    }

    calculateGrowthRates(monthlyData) {
        const growth = {
            income: {
                monthly: [],
                quarterly: [],
                annual: null
            },
            expenses: {
                monthly: [],
                quarterly: [],
                annual: null
            }
        };

        const months = Object.keys(monthlyData).sort();
        if (months.length < 2) return growth;

        // Monthly growth rates
        for (let i = 1; i < months.length; i++) {
            const previousMonth = monthlyData[months[i - 1]];
            const currentMonth = monthlyData[months[i]];

            growth.income.monthly.push({
                month: months[i],
                rate: ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
            });

            growth.expenses.monthly.push({
                month: months[i],
                rate: ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
            });
        }

        // Annual growth rate if we have at least 12 months of data
        if (months.length >= 12) {
            const firstMonth = monthlyData[months[0]];
            const lastMonth = monthlyData[months[months.length - 1]];
            const monthsDiff = months.length;

            growth.income.annual = (Math.pow(lastMonth.income / firstMonth.income, 12 / monthsDiff) - 1) * 100;
            growth.expenses.annual = (Math.pow(lastMonth.expenses / firstMonth.expenses, 12 / monthsDiff) - 1) * 100;
        }

        return growth;
    }

    analyzeCategories(startDate, endDate) {
        const transactions = this.getFilteredTransactions(startDate, endDate);
        const categoryAnalysis = {};

        // Group transactions by category
        for (const category of Object.keys(this.categoryManager.categories)) {
            const categoryTransactions = transactions.filter(t => t.category === category);
            
            categoryAnalysis[category] = {
                total: categoryTransactions.reduce((sum, t) => sum + t.amount, 0),
                count: categoryTransactions.length,
                average: categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / categoryTransactions.length || 0,
                percentageOfTotal: 0,
                trend: this.calculateCategoryTrend(categoryTransactions),
                subcategories: this.analyzeSubcategories(categoryTransactions)
            };
        }

        // Calculate percentages of total
        const total = Object.values(categoryAnalysis).reduce((sum, cat) => sum + cat.total, 0);
        for (const category in categoryAnalysis) {
            categoryAnalysis[category].percentageOfTotal = (categoryAnalysis[category].total / total) * 100;
        }

        return categoryAnalysis;
    }

    calculateCategoryTrend(transactions) {
        if (transactions.length < 2) return null;

        const monthlyTotals = this.groupTransactionsByMonth(transactions);
        const months = Object.keys(monthlyTotals).sort();
        
        const trend = {
            direction: 'stable',
            percentage: 0
        };

        if (months.length >= 2) {
            const firstMonth = monthlyTotals[months[0]].total;
            const lastMonth = monthlyTotals[months[months.length - 1]].total;
            const change = ((lastMonth - firstMonth) / firstMonth) * 100;

            trend.direction = change > 1 ? 'increasing' : change < -1 ? 'decreasing' : 'stable';
            trend.percentage = Math.abs(change);
        }

        return trend;
    }

    analyzeSubcategories(transactions) {
        const subcategories = {};
        
        transactions.forEach(transaction => {
            if (!subcategories[transaction.subcategory]) {
                subcategories[transaction.subcategory] = {
                    total: 0,
                    count: 0,
                    average: 0
                };
            }
            
            subcategories[transaction.subcategory].total += transaction.amount;
            subcategories[transaction.subcategory].count++;
        });

        // Calculate averages
        for (const sub in subcategories) {
            subcategories[sub].average = 
                subcategories[sub].total / subcategories[sub].count;
        }

        return subcategories;
    }

    analyzeBudgetPerformance(startDate, endDate) {
        const transactions = this.getFilteredTransactions(startDate, endDate);
        const categoryTotals = this.calculateCategoryTotals(transactions);
        const budgetAnalysis = {};

        for (const [category, budget] of Object.entries(this.settings.budgets || {})) {
            const spent = categoryTotals[category] || 0;
            const remaining = budget - spent;
            const percentageUsed = (spent / budget) * 100;

            budgetAnalysis[category] = {
                budget,
                spent,
                remaining,
                percentageUsed,
                status: this.getBudgetStatus(percentageUsed),
                projectedOverspend: this.projectOverspend(spent, budget, startDate, endDate)
            };
        }

        return budgetAnalysis;
    }

    getBudgetStatus(percentageUsed) {
        if (percentageUsed >= 100) return 'exceeded';
        if (percentageUsed >= 90) return 'warning';
        if (percentageUsed >= 75) return 'attention';
        return 'good';
    }

    projectOverspend(spent, budget, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
        const daysElapsed = (new Date() - start) / (1000 * 60 * 60 * 24);
        
        if (daysElapsed <= 0) return 0;
        
        const dailyRate = spent / daysElapsed;
        const projectedTotal = dailyRate * totalDays;
        
        return projectedTotal > budget ? projectedTotal - budget : 0;
    }

    generateRecommendations() {
        const recommendations = [];
        const metrics = this.generateSummaryMetrics();
        const budgetAnalysis = this.analyzeBudgetPerformance();

        // Savings Rate Recommendations
        if (metrics.savingsRate < 20) {
            recommendations.push({
                type: 'savings',
                priority: 'high',
                description: 'Your savings rate is below recommended levels. Consider reducing non-essential expenses.',
                actionItems: [
                    'Review and categorize your expenses',
                    'Identify potential areas for cost reduction',
                    'Set up automatic savings transfers'
                ]
            });
        }

        // Budget Recommendations
        for (const [category, analysis] of Object.entries(budgetAnalysis)) {
            if (analysis.status === 'exceeded' || analysis.status === 'warning') {
                recommendations.push({
                    type: 'budget',
                    priority: analysis.status === 'exceeded' ? 'high' : 'medium',
                    category: category,
                    description: `Your ${category} spending is ${analysis.status === 'exceeded' ? 'over' : 'approaching'} budget.`,
                    actionItems: [
                        'Review recent transactions in this category',
                        'Look for alternative options or ways to reduce spending',
                        'Consider adjusting budget if consistently exceeded'
                    ]
                });
            }
        }

        // Growth Analysis Recommendations
        const trends = this.analyzeTrends();
        if (trends.growth.expenses.annual > trends.growth.income.annual) {
            recommendations.push({
                type: 'growth',
                priority: 'medium',
                description: 'Your expenses are growing faster than your income.',
                actionItems: [
                    'Review recurring expenses and subscriptions',
                    'Look for opportunities to increase income',
                    'Create a plan to reduce expense growth rate'
                ]
            });
        }

        return recommendations;
    }

    // Report Generation Methods
    async generateReport(format = 'html') {
        const report = this.generateFinancialReport();
        
        switch (format) {
            case 'html':
                return this.generateHTMLReport(report);
            case 'pdf':
                return this.generatePDFReport(report);
            case 'csv':
                return this.generateCSVReport(report);
            case 'json':
                return JSON.stringify(report, null, 2);
            default:
                throw new Error('Unsupported report format');
        }
    }

    generateHTMLReport(report) {
        // Implementation for HTML report generation
        // Returns HTML string
    }

    generatePDFReport(report) {
        // Implementation for PDF report generation
        // Returns PDF buffer
    }

    generateCSVReport(report) {
        // Implementation for CSV report generation
        // Returns CSV string
    }

    // ... Additional analytics methods ...
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.financeTracker = new FinanceTracker();
});
