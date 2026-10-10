import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.trim().length < 32) {
    throw new Error("JWT_SECRET must be configured and contain at least 32 characters.");
}

// Helper to set cookie
const setSessionCookie = (res, payload) => {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
    });
};

export async function register(req, res) {
    const { name, email, password } = req.body ?? {};

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !name.trim() ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (name.trim().length > 100) {
        return res.status(400).json({ error: "Name must be 100 characters or fewer." });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({ error: "Enter a valid email address." });
    }

    if (password.length < 8 || password.length > 128) {
        return res.status(400).json({ error: "Password must be between 8 and 128 characters." });
    }

    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
        return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await User.create({
        name: name.trim(),
        email: trimmedEmail,
        password,
    });

    setSessionCookie(res, { userId: user._id.toString(), email: user.email });

    return res.status(201).json({
        user: { _id: user._id, name: user.name, email: user.email },
    });
}

export async function login(req, res) {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    setSessionCookie(res, { userId: user._id.toString(), email: user.email });

    return res.status(200).json({
        user: { _id: user._id, name: user.name, email: user.email },
    });
}

export async function logout(_req, res) {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
    return res.json({ success: true });
}

export async function me(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated." });
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }

    return res.json({ user });
}
