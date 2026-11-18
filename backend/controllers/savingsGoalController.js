
import pool from "../config/db.js";

export const createSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      name,
      description,
      target_amount,
      current_amount,
      target_date
    } = req.body;

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid savings goal name."
      });
    }

    if (name.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Goal name cannot exceed 150 characters."
      });
    }

    const targetAmount = Number(target_amount);
    const currentAmount = current_amount === undefined
      ? 0
      : Number(current_amount);

    if (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be greater than zero."
      });
    }

    if (
      !Number.isFinite(currentAmount) ||
      currentAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot be negative."
      });
    }

    if (currentAmount > targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot exceed the target amount."
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string."
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters."
      });
    }

    if (
      target_date !== undefined &&
      target_date !== null &&
      (
        typeof target_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(target_date)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid target date in YYYY-MM-DD format."
      });
    }

    if (target_date) {
      const date = new Date(`${target_date}T00:00:00Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== target_date
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid target date."
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO savings_goals
       (user_id, name, description, target_amount, current_amount, target_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        description?.trim() || null,
        targetAmount,
        currentAmount,
        target_date || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Savings goal created successfully!",
      goal: {
        id: result.insertId,
        name: name.trim(),
        description: description?.trim() || null,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: target_date || null,
        percentage_completed: Number(
          ((currentAmount / targetAmount) * 100).toFixed(2)
        )
      }
    });

  } catch (error) {
    console.error("Create savings goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the savings goal."
    });
  }
};


export const getSavingsGoals = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [goals] = await pool.query(
      `SELECT
          id,
          name,
          description,
          target_amount,
          current_amount,
          target_date,
          created_at,
          updated_at
       FROM savings_goals
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
      [userId]
    );

    const formattedGoals = goals.map((goal) => {
      const targetAmount = Number(goal.target_amount);
      const currentAmount = Number(goal.current_amount);
      const remainingAmount = Math.max(
        targetAmount - currentAmount,
        0
      );

      const percentageCompleted = Number(
        ((currentAmount / targetAmount) * 100).toFixed(2)
      );

      return {
        id: goal.id,
        name: goal.name,
        description: goal.description,
        target_amount: targetAmount,
        current_amount: currentAmount,
        remaining_amount: remainingAmount,
        target_date: goal.target_date,
        percentage_completed: percentageCompleted,
        status: currentAmount >= targetAmount
          ? "Completed"
          : "In Progress",
        created_at: goal.created_at,
        updated_at: goal.updated_at
      };
    });

    const totalTarget = formattedGoals.reduce(
      (sum, goal) => sum + goal.target_amount,
      0
    );

    const totalSaved = formattedGoals.reduce(
      (sum, goal) => sum + goal.current_amount,
      0
    );

    const totalRemaining = formattedGoals.reduce(
      (sum, goal) => sum + goal.remaining_amount,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Savings goals retrieved successfully!",
      summary: {
        total_goals: formattedGoals.length,
        total_target: Number(totalTarget.toFixed(2)),
        total_saved: Number(totalSaved.toFixed(2)),
        total_remaining: Number(totalRemaining.toFixed(2))
      },
      goals: formattedGoals
    });

  } catch (error) {
    console.error("Get savings goals error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving savings goals."
    });
  }
};


export const updateSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goalId = Number(req.params.id);

    if (!Number.isInteger(goalId) || goalId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid savings goal ID."
      });
    }

    const [existingGoals] = await pool.query(
  `SELECT
      id,
      name,
      description,
      target_amount,
      current_amount,
      DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date
   FROM savings_goals
   WHERE id = ? AND user_id = ?`,
  [goalId, userId]
);

    if (existingGoals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found."
      });
    }

    const existingGoal = existingGoals[0];

    const name = req.body.name === undefined
      ? existingGoal.name
      : req.body.name;

    const description = req.body.description === undefined
      ? existingGoal.description
      : req.body.description;

    const targetAmount = req.body.target_amount === undefined
      ? Number(existingGoal.target_amount)
      : Number(req.body.target_amount);

    const currentAmount = req.body.current_amount === undefined
      ? Number(existingGoal.current_amount)
      : Number(req.body.current_amount);

    const targetDate = req.body.target_date === undefined
      ? existingGoal.target_date
      : req.body.target_date;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid goal name (maximum 150 characters)."
      });
    }

    if (
      description !== null &&
      description !== undefined &&
      (
        typeof description !== "string" ||
        description.length > 500
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string of at most 500 characters."
      });
    }

    if (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be greater than zero."
      });
    }

    if (
      !Number.isFinite(currentAmount) ||
      currentAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot be negative."
      });
    }

    if (currentAmount > targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot exceed the target amount."
      });
    }

    if (
      targetDate !== null &&
      targetDate !== undefined
    ) {
      if (
        typeof targetDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid target date in YYYY-MM-DD format."
        });
      }

      const date = new Date(`${targetDate}T00:00:00Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== targetDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid target date."
        });
      }
    }

    await pool.query(
      `UPDATE savings_goals
       SET name = ?,
           description = ?,
           target_amount = ?,
           current_amount = ?,
           target_date = ?
       WHERE id = ? AND user_id = ?`,
      [
        name.trim(),
        description?.trim() || null,
        targetAmount,
        currentAmount,
        targetDate || null,
        goalId,
        userId
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Savings goal updated successfully!",
      goal: {
        id: goalId,
        name: name.trim(),
        description: description?.trim() || null,
        target_amount: targetAmount,
        current_amount: currentAmount,
        remaining_amount: Number(
          Math.max(targetAmount - currentAmount, 0).toFixed(2)
        ),
        target_date: targetDate || null,
        percentage_completed: Number(
          ((currentAmount / targetAmount) * 100).toFixed(2)
        ),
        status: currentAmount >= targetAmount
          ? "Completed"
          : "In Progress"
      }
    });

  } catch (error) {
    console.error("Update savings goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the savings goal."
    });
  }
};

export const deleteSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goalId = Number(req.params.id);

    if (!Number.isInteger(goalId) || goalId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid savings goal ID."
      });
    }

    const [result] = await pool.query(
      `DELETE FROM savings_goals
       WHERE id = ? AND user_id = ?`,
      [goalId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Savings goal deleted successfully!"
    });
  } catch (error) {
    console.error("Delete savings goal error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the savings goal."
    });
  }
};