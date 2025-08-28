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

    const isAuth = Boolean(ctx.state.user?.id);

    if (!isAuth && (customAlias || expiresAt)) {
      ctx.status = 403;
      ctx.body = { error: "Login required to set custom alias or expiry" };
      return;
    }

    if (isAuth && customAlias) {
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
      customAlias: isAuth ? customAlias?.trim() : undefined,
      userId: isAuth ? ctx.state.user.id : undefined,
      expiresAt: isAuth ? expiresAt : undefined,
      isActive: true,
      clickCount: 0
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      data: {
        longUrl: newUrl.longUrl,
        shortCode: newUrl.shortCode || newUrl.customAlias,
        shortUrl: `${process.env.BASE_URL}/api/urls/${
          newUrl.shortCode || newUrl.customAlias
        }`
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

    const existingUrl = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
      isActive: true
    });

    if (!existingUrl) {
      ctx.status = 404;
      ctx.body = {
        message: "There is no such shortcode, or it might be inactive!"
      };
      return;
    }

    if (existingUrl.isExpired()) {
      ctx.status = 410;
      ctx.body = { message: "This URL has expired." };
      return;
    }

    existingUrl.clickCount += 1;
    await existingUrl.save();

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

url.getAllUrls = async (ctx: any) => {
  try {
    const urls = await Url.find({
      userId: ctx.state.user.id
    }).sort({ createdAt: -1 });

    ctx.body = {
      success: true,
      message: "Urls fetched successfully.",
      urls
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!",
      reason: process.env.NODE_ENV === "development" ? error.message : undefined
    };
  }
};

url.deleteUrl = async (ctx: any) => {
  try {
    const shortCode = ctx.params?.shortcode;
    const { permanent } = ctx.request.body;

    if (!shortCode || shortCode.length < 4 || shortCode.length > 16) {
      ctx.status = 400;
      ctx.body = { success: false, message: "Invalid shortcode" };
      return;
    }

    let deleted;
    if (permanent) {
      deleted = await Url.findOneAndDelete({
        $or: [{ shortCode }, { customAlias: shortCode }],
        userId: ctx.state.user.id
      });
    } else {
      deleted = await Url.findOneAndUpdate(
        {
          $or: [{ shortCode }, { customAlias: shortCode }],
          userId: ctx.state.user.id
        },
        { isActive: false },
        { new: true }
      );
    }

    if (!deleted) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "URL not found or already inactive"
      };
      return;
    }

    ctx.body = {
      success: true,
      message: permanent
        ? "URL permanently deleted"
        : "URL deactivated successfully"
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!",
      reason: process.env.NODE_ENV === "development" ? error.message : undefined
    };
  }
};
