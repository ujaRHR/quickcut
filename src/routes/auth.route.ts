import Router from "@koa/router";
import { requiredAuth } from "../middlewares/auth.middleware.ts";
import { auth } from "../controllers/auth.controller.ts";

const authRouter = new Router();

// specific paths for /auth/.... route
authRouter.post("/register", auth.register);
authRouter.get("/verify-email", auth.verifyEmail);
authRouter.post("/login", auth.login);
authRouter.get("/me", requiredAuth, auth.me);
authRouter.post("/forgot-password", auth.forgotPassword);
authRouter.post("/reset-password", auth.resetPassword);

export default authRouter;
