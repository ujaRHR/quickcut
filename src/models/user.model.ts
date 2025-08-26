import { Document, model, Schema } from "mongoose";

interface IUser extends Document {
  fullname: string;
  email: string;
  password: string;
  isVerified?: boolean;
  emailVerifyToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}

const userSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/
    },
    password: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    emailVerifyToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
