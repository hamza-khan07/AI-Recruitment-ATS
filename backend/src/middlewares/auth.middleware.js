import { jwtUtils } from "../utils/jwt.js";
export const authMiddleware = {
    authenticate(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const token = authHeader.replace("Bearer ", "");
        try {
            const payload = jwtUtils.verifyAccessToken(token);
            req.user = {
                id: payload.sub,
                role: payload.role,
                email: payload.email,
            };
            next();
        }
        catch {
            res.status(401).json({ success: false, message: "Invalid or expired access token." });
        }
    },
    authorize(roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Authentication required." });
            }
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ success: false, message: "Forbidden." });
            }
            return next();
        };
    },
};
//# sourceMappingURL=auth.middleware.js.map