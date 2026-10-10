import { Router } from "express";
import { createProject, deleteProject, getProject, getPublicProject, listProjects, publishProject, rollbackProject, updateProjectFiles } from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { chat } from "../controllers/chatController.js";
import { rateLimit } from "../middleware/rateLimit.js";

const generationLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many project-generation requests. Please wait 15 minutes and try again.",
});

const revisionLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many AI revision requests. Please wait 15 minutes and try again.",
});

const projectRouter = Router();

// Public Route
projectRouter.get("/public/:id", getPublicProject)

// Protect all following routes
projectRouter.use(authMiddleware)

projectRouter.post("/", generationLimit, createProject)
projectRouter.get("/", listProjects)
projectRouter.get("/:id", getProject)
projectRouter.delete("/:id", deleteProject)
projectRouter.put("/:id/files", updateProjectFiles)
projectRouter.post("/:id/publish", publishProject)
projectRouter.post("/:id/rollback", rollbackProject)

// Chat
projectRouter.post("/:id/chat", revisionLimit, chat)

export default projectRouter;