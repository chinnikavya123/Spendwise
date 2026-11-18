
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
