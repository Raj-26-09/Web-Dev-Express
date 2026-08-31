const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token || token.trim() === "") {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "default_jwt_secret_key"
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;