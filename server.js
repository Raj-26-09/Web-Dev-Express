const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });


// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        data: "Task Management API is running"
    });
});


// GET all tasks
app.get("/tasks", async (req, res, next) => {
    try {
        const tasks = await Task.find();

        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
});


// GET task by ID
app.get("/tasks/:id", async (req, res, next) => {
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
});


// CREATE task
app.post("/tasks", async (req, res, next) => {
    try {
        const task = await Task.create(req.body);

        res.status(201).json({
            success: true,
            data: task
        });

    } catch (error) {
        next(error);
    }
});


// UPDATE task
app.put("/tasks/:id", async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
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
            data: task
        });

    } catch (error) {
        next(error);
    }
});


// DELETE task
app.delete("/tasks/:id", async (req, res, next) => {
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
});


// Global Error Handler
app.use((error, req, res, next) => {
    console.error(error);

    // Mongoose validation error
    if (error.name === "ValidationError") {

        const errors = {};

        for (const field in error.errors) {
            errors[field] = error.errors[field].message;
        }

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
        });
    }


    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID"
        });
    }


    // Other errors
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});