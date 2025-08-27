import Router from "@koa/router";
import { url } from "../controllers/url.controller.ts";
import { optionalAuth, requiredAuth } from "../middlewares/auth.middleware.ts";

const urlRouter = new Router();

// routing
urlRouter.post("/shorten", optionalAuth, url.createShortUrl);
urlRouter.get("/all", requiredAuth, url.getAllUrls);
urlRouter.get("/:shortcode", url.getLongUrl);

export default urlRouter;
