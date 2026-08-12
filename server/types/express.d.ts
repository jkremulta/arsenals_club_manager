import "express";

declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: InstanceType<typeof import("../models/user").default>;
    }
  }
}
