import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Expense {
  _id?: string;
  id?: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense: Expense | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "Food",
  "Travel",
  "Entertainment",
  "Shopping",
  "Bills",
  "Healthcare",
  "Education",
  "Other",
];

export default function EditExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  expense,
}: EditExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDescription(expense.description || "");
      setDate(expense.date.split("T")[0] || "");
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      const id = expense._id || expense.id;
      const res = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
          date,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update expense");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error updating expense");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <div
      data-testid="edit-expense-modal"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            data-testid="edit-expense-title"
            className="text-2xl font-bold text-slate-800"
          >
            Edit Expense
          </h2>
          <button
            data-testid="edit-expense-close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          data-testid="edit-expense-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="edit-amount"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                $
              </span>
              <input
                id="edit-amount"
                data-testid="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-category"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Category
            </label>
            <select
              id="edit-category"
              data-testid="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-date"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Date
            </label>
            <input
              id="edit-date"
              data-testid="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              data-testid="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Optional note..."
            />
          </div>

          {error && (
            <div
              data-testid="edit-error"
              className="p-3 rounded-lg bg-red-50 text-red-800 text-sm"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              data-testid="edit-cancel"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="edit-submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
