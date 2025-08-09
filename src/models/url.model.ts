import { Document, model, Schema, Types } from "mongoose";

interface IUrl extends Document {
  shortCode: string;
  longUrl: string;
  userId?: Types.ObjectId | null;
  customAlias?: string | null;
  clickCount: number;
  expiresAt?: Date | null;
  isActive: boolean;
  isExpired(): boolean;
}

const urlSchema = new Schema<IUrl>(
  {
    shortCode: {
      type: String,
      required: true,
      match: /^[a-zA-Z0-9]{7,}$/
    },
    longUrl: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    customAlias: {
      type: String,
      match: /^[a-z0-9-]+$/,
      minlength: 4,
      maxlength: 16,
      default: null,
      trim: true
    },
    clickCount: { type: Number, default: 0, min: 0 },
    expiresAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
urlSchema.index({ shortCode: 1 }, { unique: true });
urlSchema.index({ customAlias: 1 }, { unique: true, sparse: true });
urlSchema.index({ userId: 1 });

// Helper -- Check Expiration
urlSchema.methods.isExpired = function (this: IUrl): boolean {
  return !!this.expiresAt && this.expiresAt < new Date();
};

export const Url = model("Url", urlSchema);
