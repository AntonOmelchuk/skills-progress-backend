import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/index.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, avatarName } = req.body;

    // Strict validation proves these are strings, not 'any'
    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string" ||
      !avatarName ||
      typeof avatarName !== "string"
    ) {
      res
        .status(400)
        .json({ error: "Valid email, password, and avatarName are required" });
      return;
    }

    // 1. Check if the email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email is already in use" });
      return;
    }

    // 2. Hash the password mathematically (10 rounds of salting)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the User AND their Avatar in one database query
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        avatar: {
          create: {
            name: avatarName,
            authUid: crypto.randomUUID(),
          },
        },
      },
      include: { avatar: true },
    });

    // 4. Generate the digital key (JWT)
    const secret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign({ userId: newUser.id }, secret, { expiresIn: "7d" });

    // 5. Send back the token and data (but NEVER send the password back!)
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("[ERROR] Registration failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // 2. Compare the password with the hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // 3. Issue a new token
    const secret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("[ERROR] Login failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
