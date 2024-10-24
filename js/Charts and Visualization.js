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
