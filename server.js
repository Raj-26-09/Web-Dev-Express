const express = require("express");
const app = express();
const PORT = 5000;

app.use(express.json());

let tasks = [
    { id: 1, title: 'Practical 1', completed: true },
    { id: 2, title: 'Practical 2', completed: true },
    { id: 3, title: 'Practical 3', completed: true },
    { id: 4, title: 'Practical 4', completed: false }
];

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        data: "Hello"
    });
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

app.post("/tasks", (req, res) => {
    const { title, completed } = req.body;

    const new_t = {
        id: tasks.length + 1,
        title,
        completed
    };

    tasks.push(new_t);

    res.status(201).json({
        success: true,
        data: new_t
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});