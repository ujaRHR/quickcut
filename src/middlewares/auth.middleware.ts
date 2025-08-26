import { verifyJWT } from "../utils/jwt.ts";
import { User } from "../models/user.model.ts";

interface JWTPayload {
  id?: string;
  fullname?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export const optionalAuth = async (ctx: any, next: any) => {
  const authHeader = ctx.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = (await verifyJWT(token)) as JWTPayload;

      const user = await User.findById(decoded.id);
      ctx.state.user = user;
    } catch (error: any) {
      // guest
      ctx.state.user = null;
    }
  }
  await next();
};

export const requiredAuth = async (ctx: any, next: any) => {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.status = 401;
    ctx.body = { error: "Authentication required" };
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = (await verifyJWT(token)) as JWTPayload;

    const user = await User.findById(decoded.id);

    if (!user) {
      ctx.status = 401;
      ctx.body = { error: "Invalid or expired token" };
      return;
    }

    ctx.state.user = user;
    await next();
  } catch (error: any) {
    ctx.status = 401;
    ctx.body = { error: "Invalid or expired token" };
  }
};
