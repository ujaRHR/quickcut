import Router from "@koa/router";
import { url } from "../controllers/url.controller.ts";

const urlRouter = new Router();

// routing
urlRouter.post("/shorten", url.createShortUrl);
urlRouter.get("/:shortcode", url.getLongUrl);

export default urlRouter;
