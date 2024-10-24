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
