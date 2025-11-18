import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const env = {
  JWT_SECRET: process.env.JWT_SECRET || "",
};

if (!env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Set it in your environment.");
}

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(userId: string, email: string) {
  return jwt.sign({ sub: userId, email }, env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req: Request, res: Response) {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }

  const { email, password, name } = parse.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({ email, passwordHash, name });
  const token = signToken(user.id, user.email);
  return res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response) {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }

  const { email, password } = parse.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user.id, user.email);
  return res.status(200).json({ token, user });
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers["authorization"] || req.headers["Authorization"]; 
  if (!header || typeof header !== "string") {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email?: string };
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function me(req: Request, res: Response) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
}
