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
