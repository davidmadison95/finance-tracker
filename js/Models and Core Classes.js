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
