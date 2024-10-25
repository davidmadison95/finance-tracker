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
