import { useState } from "react";
import { X } from "lucide-react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in.");
        setLoading(false);
        return; // ✅ Keep modal open for error testing
      }

      const res = await fetch(`${API_URL}/api/expenses`, {
        method: "POST",
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

      if (!res.ok) {
        throw new Error(data.message || "Failed to add expense");
      }

      // Reset fields
      setAmount("");
      setCategory(CATEGORIES[0]);
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error adding expense");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="main fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      data-testid="expense-modal"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        data-testid="expense-modal-content"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Add Expense</h2>
          <button
            onClick={onClose}
            data-testid="close-modal-button"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-testid="add-expense-form"
        >
          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                $
              </span>
              <input
                id="amount"
                data-testid="amount-input"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Category
            </label>
            <select
              id="category"
              data-testid="category-select"
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

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Date
            </label>
            <input
              id="date"
              data-testid="date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              data-testid="description-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Optional note..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              data-testid="error-message"
              className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm font-medium mt-2 transition-all duration-200"
              style={{ display: "block" }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              data-testid="cancel-button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              data-testid="submit-expense"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
