import jwt from 'jsonwebtoken';
import { env } from "../../config/env";

type JwtPayload = {
    userId: string;
};

export function generateToken(payload: JwtPayload) {
    return jwt.sign(payload, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
    });
}

export function verifyToken(token: string) {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
}