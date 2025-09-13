import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export const UGenerateToken = (payload: {
  id: number;
  username: string;
  email: string;
  name: string;
}): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const UVerifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
