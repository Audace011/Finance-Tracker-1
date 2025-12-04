import { useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, PiggyBank, Calculator } from 'lucide-react';
import { startOfYear, getMonth, format } from 'date-fns';

export default function Analytics() {
  const { transactions } = useTransactions();
  const { profile } = useProfile();
  const currency = profile?.currency || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const analytics = useMemo(() => {
    const yearStart = startOfYear(new Date());
    const ytdTransactions = transactions.filter(t => new Date(t.date) >= yearStart);

    const ytdIncome = ytdTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    const ytdExpense = ytdTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    // Monthly breakdown
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(2024, i), 'MMM'),
      income: 0,
      expense: 0,
    }));

    ytdTransactions.forEach(t => {
      const monthIndex = getMonth(new Date(t.date));
      if (t.type === 'income') {
        months[monthIndex].income += Number(t.amount);
      } else {
        months[monthIndex].expense += Number(t.amount);
      }
    });

    // Spending by category
    const categorySpending: Record<string, { name: string; value: number; color: string }> = {};
    ytdTransactions
      .filter(t => t.type === 'expense' && t.categories)
      .forEach(t => {
        const cat = t.categories!;
        if (!categorySpending[cat.id]) {
          categorySpending[cat.id] = { name: cat.name, value: 0, color: cat.color };
        }
        categorySpending[cat.id].value += Number(t.amount);
      });

    const topCategories = Object.values(categorySpending)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Calculate averages (non-zero months only)
    const nonZeroMonths = months.filter(m => m.income > 0 || m.expense > 0).length || 1;
    const avgMonthlyIncome = ytdIncome / nonZeroMonths;
    const avgMonthlyExpense = ytdExpense / nonZeroMonths;
    const savingsRate = ytdIncome > 0 ? ((ytdIncome - ytdExpense) / ytdIncome) * 100 : 0;

    return {
      ytdIncome,
      ytdExpense,
      monthlyData: months,
      topCategories,
      avgMonthlyIncome,
      avgMonthlyExpense,
      savingsRate,
    };
  }, [transactions]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Insights into your spending habits</p>
        </div>

        {/* YTD Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-income" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Income (YTD)</p>
                  <p className="text-xl font-bold text-income">{formatCurrency(analytics.ytdIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expense (YTD)</p>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(analytics.ytdExpense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Savings Rate</p>
                  <p className="text-xl font-bold">{analytics.savingsRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Expense</p>
                  <p className="text-xl font-bold">{formatCurrency(analytics.avgMonthlyExpense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Income vs Expense Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="income" name="Income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Spending by Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analytics.topCategories.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No expense data to display
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.topCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {analytics.topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topCategories.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No expense data yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.topCategories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">{formatCurrency(cat.value)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            backgroundColor: cat.color,
                            width: `${(cat.value / analytics.ytdExpense) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
