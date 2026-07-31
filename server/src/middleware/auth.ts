import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

import { verifyAccessToken } from "../auth/jwt";
import {
  UnauthorizedError,
  ForbiddenError,
} from "../utils/errors";

export type AuthUser = {
  id: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new UnauthorizedError("Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

export function authorize(...roles: Role[]) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError("Insufficient permissions")
      );
    }

    next();
  };
}