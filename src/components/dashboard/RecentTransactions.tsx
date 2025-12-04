import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { Transaction } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
  onAddClick: () => void;
}

export default function RecentTransactions({ 
  transactions, 
  currency, 
  onAddClick 
}: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <Button size="sm" onClick={onAddClick} className="gradient-primary">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    transaction.type === 'income' ? "bg-income/10" : "bg-destructive/10"
                  )}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5 text-income" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {transaction.description || transaction.categories?.name || 'Transaction'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "font-semibold",
                  transaction.type === 'income' ? "text-income" : "text-destructive"
                )}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
