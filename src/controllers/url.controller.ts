import { Url } from "../models/url.model.ts";
import { generateShortCode } from "../utils/codeGenerator.ts";

interface BodyAttributes {
  longUrl: string;
  customAlias?: string;
  shortCode?: string;
  expiresAt?: Date;
}

// scaffolding the controllers in 'url' object
export const url: Record<string, any> = {};

url.createShortUrl = async (ctx: any) => {
  try {
    const { longUrl, customAlias, expiresAt } = ctx.request
      .body as BodyAttributes;

    if (customAlias) {
      if (customAlias.length >= 4 && customAlias.length <= 16) {
        const existing = await Url.findOne({
          $or: [{ shortCode: customAlias }, { customAlias }]
        });
        if (existing) {
          ctx.status = 400;
          ctx.body = {
            error: "Custom alias already in use"
          };
          return;
        }
      } else {
        ctx.status = 400;
        ctx.body = {
          error: "Custom alias must be between 4 and 16 characters"
        };
        return;
      }
    }

    const newUrl = await Url.create({
      shortCode: customAlias ? undefined : await generateShortCode(),
      longUrl: longUrl.trim(),
      customAlias: customAlias ? customAlias.trim() : undefined,
      userId: ctx.state.user?.id || undefined,
      expiresAt: expiresAt || undefined,
      isActive: true,
      clickCount: 0
    });

    ctx.body = {
      success: true,
      data: {
        longUrl,
        shortCode: newUrl.shortCode || newUrl.customAlias
      }
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!",
      reason: process.env.ENV === "development" ? error.message : undefined
    };
  }
};

url.getLongUrl = async (ctx: any) => {
  try {
    const shortCode = ctx.params?.shortcode;

    if (!shortCode) {
      ctx.status = 400;
      ctx.body = { message: "Shortcode is required" };
      return;
    }

    if (shortCode.length < 4 || shortCode.length > 16) {
      ctx.status = 400;
      ctx.body = { message: "Invalid shortcode length" };
      return;
    }

    const existingUrl = await Url.findOneAndUpdate(
      {
        $or: [{ shortCode }, { customAlias: shortCode }]
      },
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!existingUrl) {
      ctx.status = 404;
      ctx.body = { message: "There is no such shortcode, try creating one!" };
      return;
    }

    ctx.status = 301;
    ctx.redirect(existingUrl.longUrl);
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!",
      reason: process.env.NODE_ENV === "development" ? error.message : undefined
    };
  }
};
