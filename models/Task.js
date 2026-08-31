const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    completed: {
        type: Boolean,
        default: false
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    }
});

// Trim whitespace from title before saving
taskSchema.pre("save", function() {
    if (this.title) {
        this.title = this.title.trim();
    }
});

module.exports = mongoose.model("Task", taskSchema);