import { Pencil, Trash2, Calendar, DollarSign } from "lucide-react";

export interface Expense {
  _id?: string;
  id?: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-100 text-orange-700",
      Travel: "bg-blue-100 text-blue-700",
      Entertainment: "bg-pink-100 text-pink-700",
      Shopping: "bg-purple-100 text-purple-700",
      Bills: "bg-red-100 text-red-700",
      Healthcare: "bg-green-100 text-green-700",
      Education: "bg-cyan-100 text-cyan-700",
      Other: "bg-slate-100 text-slate-700",
    };
    return colors[category] || colors["Other"];
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div data-testid="expense-empty" className="text-center py-12">
        <DollarSign
          data-testid="expense-empty-icon"
          className="w-16 h-16 text-slate-300 mx-auto mb-4"
        />
        <p data-testid="expense-empty-text" className="text-slate-500 text-lg">
          No expenses yet
        </p>
        <p className="text-slate-400 text-sm mt-2">
          Click "Add Expense" to get started
        </p>
      </div>
    );
  }

  return (
    <div data-testid="expense-list" className="space-y-3">
      {expenses.map((expense, index) => {
        const id = expense._id || expense.id;
        return (
          <div
            key={id}
            data-testid={`expense-item-${index}`}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div
                  className="flex items-center gap-3 mb-2"
                  data-testid={`expense-header-${index}`}
                >
                  <span
                    data-testid={`expense-category-${index}`}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      expense.category
                    )}`}
                  >
                    {expense.category}
                  </span>
                  <div
                    data-testid={`expense-date-${index}`}
                    className="flex items-center text-slate-500 text-sm"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(expense.date)}
                  </div>
                </div>

                {expense.description && (
                  <p
                    data-testid={`expense-description-${index}`}
                    className="text-slate-600 text-sm mb-2"
                  >
                    {expense.description}
                  </p>
                )}

                <p
                  data-testid={`expense-amount-${index}`}
                  className="text-2xl font-bold text-slate-800"
                >
                  {formatAmount(expense.amount)}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  data-testid={`expense-edit-${index}`}
                  onClick={() => onEdit(expense)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit expense"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  data-testid={`expense-delete-${index}`}
                  onClick={() => id && onDelete(id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete expense"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
