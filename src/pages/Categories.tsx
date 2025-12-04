import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCategories, Category, CategoryInput } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const colorOptions = [
  '#10b981', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#fb923c', '#fbbf24',
];

export default function Categories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState(colorOptions[0]);

  const { incomeCategories, expenseCategories, addCategory, updateCategory, deleteCategory } = useCategories();

  const resetForm = () => {
    setName('');
    setType('expense');
    setColor(colorOptions[0]);
    setSelectedCategory(undefined);
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setName(category.name);
      setType(category.type);
      setColor(category.color);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: CategoryInput = { name, type, color };
    
    if (selectedCategory) {
      updateCategory.mutate({ ...data, id: selectedCategory.id }, {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
        }
      });
    } else {
      addCategory.mutate(data, {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate(categoryToDelete);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        <span className="font-medium">{category.name}</span>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => openDialog(category)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Organize your transactions</p>
          </div>
          <Button className="gradient-primary" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Income Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-income/10 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-income" />
                </div>
                Income Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {incomeCategories.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No income categories</p>
              ) : (
                incomeCategories.map(cat => <CategoryCard key={cat.id} category={cat} />)
              )}
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-destructive" />
                </div>
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expenseCategories.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No expense categories</p>
              ) : (
                expenseCategories.map(cat => <CategoryCard key={cat.id} category={cat} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Tabs value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income" className="gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    Income
                  </TabsTrigger>
                  <TabsTrigger value="expense" className="gap-2">
                    <ArrowDownRight className="w-4 h-4" />
                    Expense
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      color === c && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gradient-primary" disabled={addCategory.isPending || updateCategory.isPending}>
                {selectedCategory ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Transactions with this category will not be deleted but will have no category assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
