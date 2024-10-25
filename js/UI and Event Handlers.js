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
