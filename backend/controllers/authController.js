
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account."
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in."
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully!",
      user: users[0]
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving your profile."
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    if (!name || !email || typeof name !== "string" || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name and email are required."
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 1 and 100 characters."
      });
    }

    if (
      normalizedEmail.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [normalizedEmail, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already being used by another account."
      });
    }

    await pool.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [normalizedName, normalizedEmail, userId]
    );

    const [users] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: users[0]
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating your profile."
    });
  }
};


export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required."
      });
    }

    if (typeof currentPassword !== "string" ||
        typeof newPassword !== "string" ||
        typeof confirmPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid password input."
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters."
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match."
      });
    }

    const [users] = await pool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      users[0].password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await pool.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again."
    });
  } catch (error) {
    console.error("Password change error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while changing your password."
    });
  }
};
