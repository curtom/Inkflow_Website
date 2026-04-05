import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashPassword: string) {
    return bcrypt.compare(password, hashPassword);
}