import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import { connectToDb } from "./config/db.ts";
import urlRouter from "./routes/url.route.ts";
import authRouter from "./routes/auth.route.ts";

const app = new Koa();
const router = new Router();
app.use(bodyParser());

// database connection
await connectToDb();

// Routing prefix setup
router.use("/api/auth", authRouter.routes(), authRouter.allowedMethods());
router.use("/api/urls", urlRouter.routes(), urlRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

app.listen(process.env.PORT, () => {
  console.log(`Working on Port ${process.env.PORT}`);
});
