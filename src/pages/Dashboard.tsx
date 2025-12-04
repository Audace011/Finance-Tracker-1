import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import BalanceChart from '@/components/dashboard/BalanceChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import TransactionDialog from '@/components/transactions/TransactionDialog';
import { useTransactions, TransactionInput } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useProfile } from '@/hooks/useProfile';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { transactions, addTransaction, isLoading: transactionsLoading } = useTransactions();
  const { categories } = useCategories();
  const { profile } = useProfile();
  
  const currency = profile?.currency || 'USD';

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
    );

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const monthIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    const monthExpense = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      balance: totalIncome - totalExpense,
      monthIncome,
      monthExpense,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleAddTransaction = (data: TransactionInput) => {
    addTransaction.mutate(data, {
      onSuccess: () => setDialogOpen(false)
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your financial overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Balance"
            value={formatCurrency(stats.balance)}
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="This Month Income"
            value={formatCurrency(stats.monthIncome)}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="income"
          />
          <StatCard
            title="This Month Expense"
            value={formatCurrency(stats.monthExpense)}
            icon={<TrendingDown className="w-6 h-6" />}
            variant="expense"
          />
        </div>

        {/* Charts and Transactions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BalanceChart transactions={transactions} currency={currency} />
          <RecentTransactions 
            transactions={transactions} 
            currency={currency}
            onAddClick={() => setDialogOpen(true)}
          />
        </div>
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddTransaction}
        categories={categories}
        isLoading={addTransaction.isPending}
      />
    </DashboardLayout>
  );
}
