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
