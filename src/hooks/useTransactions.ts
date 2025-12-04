import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  date: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
}

export interface TransactionInput {
  type: 'income' | 'expense';
  amount: number;
  category_id?: string;
  description?: string;
  date?: string;
  receipt_url?: string;
}

export function useTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (id, name, color, icon)
        `)
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const addTransaction = useMutation({
    mutationFn: async (input: TransactionInput) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user!.id,
          type: input.type,
          amount: input.amount,
          category_id: input.category_id || null,
          description: input.description || null,
          date: input.date || new Date().toISOString().split('T')[0],
          receipt_url: input.receipt_url || null,
        })
        .select(`*, categories (id, name, color, icon)`)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add transaction');
      console.error(error);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...input }: TransactionInput & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          type: input.type,
          amount: input.amount,
          category_id: input.category_id || null,
          description: input.description || null,
          date: input.date,
          receipt_url: input.receipt_url || null,
        })
        .eq('id', id)
        .select(`*, categories (id, name, color, icon)`)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update transaction');
      console.error(error);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete transaction');
      console.error(error);
    },
  });

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
