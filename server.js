const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Task = require("./models/Task");
const authRoutes = require("./routes/auth");
const protect = require("./middleware/authMiddleware");
const validateTask = require("./middleware/validationMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// Core Middleware
// ===============================
app.use(express.json());
app.use(cors());

// Performance & Response Time Monitoring
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        res.setHeader("X-Response-Time", `${duration}ms`);
    });
    next();
});

// ===============================
// Authentication Routes
// Mounted at /auth and /api/auth
// ===============================
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

// ===============================
// Home Route / Health Check
// ===============================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        data: "Task Management API is running",
        uptime: `${process.uptime().toFixed(1)}s`,
        timestamp: new Date().toISOString()
    });
});

// ===============================
// Task Route Handlers
// ===============================

// GET ALL TASKS (Protected)
const handleGetTasks = async (req, res, next) => {
    try {
        // Fetch tasks created by logged-in user or legacy tasks without user field
        const tasks = await Task.find({
            $or: [
                { user: req.user.id },
                { user: { $exists: false } },
                { user: null }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};

// GET TASK BY ID (Protected)
const handleGetTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

// CREATE TASK (Protected + Validated)
const handleCreateTask = async (req, res, next) => {
    try {
        const taskData = {
            ...req.body,
            user: req.user.id
        };

        const task = await Task.create(taskData);

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE TASK (Protected + Validated)
const handleUpdateTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task
        });
    } catch (error) {
        next(error);
    }
};

// DELETE TASK (Protected)
const handleDeleteTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            data: task
        });
    } catch (error) {
        next(error);
    }
};

// Bind routes for both /tasks and /api/tasks
app.get("/tasks", protect, handleGetTasks);
app.get("/api/tasks", protect, handleGetTasks);

app.get("/tasks/:id", protect, handleGetTaskById);
app.get("/api/tasks/:id", protect, handleGetTaskById);

app.post("/tasks", protect, validateTask, handleCreateTask);
app.post("/api/tasks", protect, validateTask, handleCreateTask);

app.put("/tasks/:id", protect, validateTask, handleUpdateTask);
app.put("/api/tasks/:id", protect, validateTask, handleUpdateTask);

app.delete("/tasks/:id", protect, handleDeleteTask);
app.delete("/api/tasks/:id", protect, handleDeleteTask);

// ===============================
// Global Error Handler Middleware
// ===============================
app.use((error, req, res, next) => {
    console.error("API Error:", error);

    // Mongoose Validation Error
    if (error.name === "ValidationError") {
        const errors = {};
        for (const field in error.errors) {
            errors[field] = error.errors[field].message;
        }

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID"
        });
    }

    // Duplicate MongoDB field
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate value already exists"
        });
    }

    // JWT verification errors
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }

    // Other Errors
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// ===============================
// MongoDB Connection & Server Start
// ===============================
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskdb";

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

module.exports = app;