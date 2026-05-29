import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      (req as Request & { user: JwtPayload }).user = payload;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
