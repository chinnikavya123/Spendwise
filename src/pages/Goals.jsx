
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  PiggyBank,
  Target,
  TrendingUp,
  Wallet,
  CircleCheck,
  CalendarDays,
  AlertTriangle,
  X,
  Trophy
} from "lucide-react";
import api from "../services/api";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

const formatDate = (date) => {
  if (!date) return "No target date";

  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({
    total_goals: 0,
    total_target: 0,
    total_saved: 0,
    total_remaining: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_amount: "",
    current_amount: "0",
    target_date: ""
  });

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/savings-goals");

      setGoals(response.data.goals || []);
      setSummary(
        response.data.summary || {
          total_goals: 0,
          total_target: 0,
          total_saved: 0,
          total_remaining: 0
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load savings goals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchGoals());
  }, [fetchGoals]);

  const openAddModal = () => {
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
      target_amount: "",
      current_amount: "0",
      target_date: ""
    });

    setError("");
    setShowModal(true);
  };

  const openEditModal = (goal) => {
    setEditingId(goal.id);

    setFormData({
      name: goal.name,
      description: goal.description || "",
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      target_date: goal.target_date
        ? String(goal.target_date).slice(0, 10)
        : ""
    });

    setError("");
    setShowModal(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSaveGoal = async (event) => {
    event.preventDefault();

    const targetAmount = Number(formData.target_amount);
    const currentAmount = Number(formData.current_amount);

    if (!formData.name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError("Target amount must be greater than zero.");
      return;
    }

    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
      setError("Current savings cannot be negative.");
      return;
    }

    if (currentAmount > targetAmount) {
      setError("Current savings cannot exceed the target amount.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: formData.target_date || null
      };

      if (editingId !== null) {
        await api.put(`/savings-goals/${editingId}`, payload);
      } else {
        await api.post("/savings-goals", payload);
      }

      setShowModal(false);
      setEditingId(null);

      await fetchGoals();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save savings goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (goal) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${goal.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/savings-goals/${goal.id}`);

      await fetchGoals();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete savings goal."
      );
    }
  };

  return (
    <div className="goals-page">
      <div className="goals-page-header">
        <div>
          <h1>Savings Goals</h1>
          <p>
            Set meaningful financial goals and track your savings journey.
          </p>
        </div>

        <button className="goals-add-button" onClick={openAddModal}>
          <Plus size={17} />
          Add New Goal
        </button>
      </div>

      {error && (
        <div className="goals-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="goals-summary-grid">
        <div className="goals-summary-card">
          <div className="goals-summary-icon goals-purple">
            <Target size={21} />
          </div>
          <p>Total Goals</p>
          <h2>{summary.total_goals}</h2>
          <span>Financial goals created</span>
        </div>

        <div className="goals-summary-card">
          <div className="goals-summary-icon goals-blue">
            <Wallet size={21} />
          </div>
          <p>Total Target</p>
          <h2>{formatCurrency(summary.total_target)}</h2>
          <span>Your savings target</span>
        </div>

        <div className="goals-summary-card">
          <div className="goals-summary-icon goals-green">
            <TrendingUp size={21} />
          </div>
          <p>Total Saved</p>
          <h2>{formatCurrency(summary.total_saved)}</h2>
          <span>Amount saved so far</span>
        </div>

        <div className="goals-summary-card">
          <div className="goals-summary-icon goals-orange">
            <PiggyBank size={21} />
          </div>
          <p>Still to Save</p>
          <h2>{formatCurrency(summary.total_remaining)}</h2>
          <span>Remaining savings target</span>
        </div>
      </div>

      <div className="goals-section">
        <div className="goals-section-heading">
          <div>
            <h2>Your Financial Goals</h2>
            <p>Every small step brings you closer to your goals.</p>
          </div>

          <span>{goals.length} goals</span>
        </div>

        {loading ? (
          <div className="goals-empty-state">
            Loading your savings goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="goals-empty-state">
            <div className="goals-empty-icon">
              <PiggyBank size={36} />
            </div>

            <h3>No savings goals yet</h3>
            <p>
              Start planning for something important.
              Create your first savings goal today!
            </p>

            <button
              className="goals-add-button"
              onClick={openAddModal}
            >
              <Plus size={16} />
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => {
              const percentage = Number(
                goal.percentage_completed || 0
              );

              const completed = goal.status === "Completed";

              return (
                <div className="goal-card" key={goal.id}>
                  <div className="goal-card-header">
                    <div className="goal-card-icon">
                      {completed ? (
                        <Trophy size={21} />
                      ) : (
                        <Target size={21} />
                      )}
                    </div>

                    <div className="goal-card-actions">
                      <button
                        onClick={() => openEditModal(goal)}
                        aria-label={`Edit ${goal.name}`}
                        title="Edit goal"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className="goal-delete-button"
                        onClick={() => handleDeleteGoal(goal)}
                        aria-label={`Delete ${goal.name}`}
                        title="Delete goal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="goal-card-title">
                    <h3>{goal.name}</h3>

                    <span
                      className={`goal-status ${
                        completed
                          ? "goal-status-completed"
                          : "goal-status-progress"
                      }`}
                    >
                      {completed ? (
                        <CircleCheck size={13} />
                      ) : (
                        <TrendingUp size={13} />
                      )}
                      {goal.status}
                    </span>
                  </div>

                  <p className="goal-description">
                    {goal.description || "No description added."}
                  </p>

                  <div className="goal-progress-details">
                    <div>
                      <span>Saved so far</span>
                      <strong>
                        {formatCurrency(goal.current_amount)}
                      </strong>
                    </div>

                    <div>
                      <span>Target amount</span>
                      <strong>
                        {formatCurrency(goal.target_amount)}
                      </strong>
                    </div>
                  </div>

                  <div className="goal-progress-track">
                    <div
                      className={`goal-progress-fill ${
                        completed ? "goal-progress-completed" : ""
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.max(percentage, 0),
                          100
                        )}%`
                      }}
                    />
                  </div>

                  <div className="goal-progress-footer">
                    <strong>{percentage.toFixed(1)}% completed</strong>
                    <span>
                      {formatCurrency(goal.remaining_amount)} left
                    </span>
                  </div>

                  <div className="goal-card-date">
                    <CalendarDays size={15} />
                    <span>{formatDate(goal.target_date)}</span>
                  </div>

                  {completed && (
                    <div className="goal-completion-message">
                      <CircleCheck size={15} />
                      Congratulations! Goal achieved.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="transaction-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >
          <form
            className="transaction-modal goals-modal"
            onSubmit={handleSaveGoal}
          >
            <div className="modal-heading">
              <div>
                <h2>
                  {editingId !== null
                    ? "Edit Savings Goal"
                    : "Create Savings Goal"}
                </h2>
                <p>
                  Define your target and track your savings progress.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <label className="transaction-form-label">
              Goal Name
              <input
                type="text"
                name="name"
                placeholder="e.g. Buy a new laptop"
                maxLength="150"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="transaction-form-label">
              Description (Optional)
              <textarea
                name="description"
                placeholder="What are you saving for?"
                maxLength="500"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
              />
            </label>

            <label className="transaction-form-label">
              Target Amount (₹)
              <input
                type="number"
                name="target_amount"
                placeholder="Enter target amount"
                min="0.01"
                step="0.01"
                value={formData.target_amount}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="transaction-form-label">
              Current Savings (₹)
              <input
                type="number"
                name="current_amount"
                placeholder="Enter amount saved"
                min="0"
                step="0.01"
                value={formData.current_amount}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="transaction-form-label">
              Target Date (Optional)
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleInputChange}
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-modal-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="goals-add-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Goal"
                    : "Create Goal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Goals;
