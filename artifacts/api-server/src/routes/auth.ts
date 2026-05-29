import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { signToken, requireAuth } from "../lib/auth";
import { logger } from "../lib/logger";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
    role: "user",
  }).returning();

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.status(201).json({
    user: {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      watchlistCount: user.watchlistCount,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.json({
    user: {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      watchlistCount: user.watchlistCount,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const authReq = req as typeof req & { user: { userId: number } };
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authReq.user.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    watchlistCount: user.watchlistCount,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
