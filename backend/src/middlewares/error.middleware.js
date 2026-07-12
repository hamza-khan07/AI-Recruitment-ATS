export const errorMiddleware = (err, req, res, next) => {
    const status = err instanceof Error ? 400 : 500;
    const message = err instanceof Error ? err.message : "Internal server error.";
    res.status(status).json({
        success: false,
        message,
    });
    next();
};
//# sourceMappingURL=error.middleware.js.map