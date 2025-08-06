import jwt from "jsonwebtoken";
const secret: string | undefined = process.env.JWT_SECRET;

export const issueJWT = async (
  payload: string | object | Buffer
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!secret) {
      reject(new Error("JWT_SECRET is not defined."));
      return;
    }
    jwt.sign(payload, secret, { expiresIn: "3d" }, (err, token) => {
      if (err) reject(err);
      else if (token) resolve(token);
      else reject(new Error("Token generation failed"));
    });
  });
};

export const verifyJWT = async (token: string): Promise<object> => {
  return new Promise((resolve, reject) => {
    if (!secret) {
      reject(new Error("JWT_SECRET is not defined."));
      return;
    }
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(new Error("Token verification failed"));
        return;
      } else if (!decoded || typeof decoded !== "object") {
        reject(new Error("Invalid token payload"));
        return;
      } else {
        resolve(decoded);
      }
    });
  });
};
