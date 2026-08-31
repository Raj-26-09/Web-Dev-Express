const validateTask = (req, res, next) => {
    const { title, description, priority, completed } = req.body;
    const errors = {};

    const isCreate = req.method === "POST";

    // Validate title: required on POST, optional on PUT unless provided
    if (isCreate) {
        if (!title || typeof title !== "string" || title.trim() === "") {
            errors.title = "Title is required";
        } else if (title.trim().length < 3) {
            errors.title = "Title must be at least 3 characters";
        }
    } else if (title !== undefined) {
        if (typeof title !== "string" || title.trim() === "") {
            errors.title = "Title cannot be empty";
        } else if (title.trim().length < 3) {
            errors.title = "Title must be at least 3 characters";
        }
    }

    // Validate priority if provided
    if (priority !== undefined && !["low", "medium", "high"].includes(priority)) {
        errors.priority = "Priority must be low, medium, or high";
    }

    // Validate description if provided
    if (description !== undefined && description !== null && typeof description !== "string") {
        errors.description = "Description must be a string";
    }

    // Validate completed if provided
    if (completed !== undefined && typeof completed !== "boolean") {
        errors.completed = "Completed must be a boolean";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Input validation failed",
            errors
        });
    }

    next();
};

module.exports = validateTask;