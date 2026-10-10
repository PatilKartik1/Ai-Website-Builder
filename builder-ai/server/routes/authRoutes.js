import { Router } from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimit.js";

const authAttemptLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many authentication attempts. Please wait 15 minutes and try again.",
});

const authRouter = Router();

authRouter.post('/register', authAttemptLimit, register)
authRouter.post('/login', authAttemptLimit, login)
authRouter.post('/logout', logout)
authRouter.get('/me', authMiddleware, me)

export default authRouter;