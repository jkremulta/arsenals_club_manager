import User from "../models/user";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

interface JwtPayload {
  id: string;
}

const unknownEndpoint = (_request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const tokenExtractor = (
  request: Request,
  _response: Response,
  next: NextFunction,
) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  }
  next();
};

const userExtractor = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (!request.token) {
    return response.status(401).json({ error: "token missing" });
  }

  if (!process.env.SECRET) {
    throw new Error("SECRET environment variable is not set");
  }

  const decodedToken = jwt.verify(
    request.token,
    process.env.SECRET,
  ) as JwtPayload;

  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }

  const user = await User.findById(decodedToken.id);
  request.user = user ?? undefined;
  next();
};

const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response.status(400).json({ error: "Player already exists." });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "Invalid token." });
  } else if (error.name === "TokenExpiredError") {
    return response
      .status(401)
      .json({ error: "Session Expired, please log in again." });
  }

  return response.status(400).json({ error: error.message });
};

export default { unknownEndpoint, errorHandler, tokenExtractor, userExtractor };
