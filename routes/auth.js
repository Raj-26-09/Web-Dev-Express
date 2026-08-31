const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// POST /auth/register
// ===============================
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        const errors = {};
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            errors.name = "Name is required";
        }
        if (!email || typeof email !== "string" || email.trim().length === 0) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = "Please provide a valid email address";
        }
        if (!password || typeof password !== "string") {
            errors.password = "Password is required";
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters long";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // Hash password with bcrypt (salt rounds = 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        // Generate token for immediate use
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET || "default_jwt_secret_key",
            { expiresIn: "1h" }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
});

// ===============================
// POST /auth/login
// ===============================
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        const errors = {};
        if (!email || typeof email !== "string" || email.trim().length === 0) {
            errors.email = "Email is required";
        }
        if (!password || typeof password !== "string") {
            errors.password = "Password is required";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Sign JWT token with 1 hour expiration
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET || "default_jwt_secret_key",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
});

// ===============================
// GET /auth/me (Protected Profile)
// ===============================
router.get("/me", protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
