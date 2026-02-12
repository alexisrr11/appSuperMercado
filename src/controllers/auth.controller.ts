import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    await registerUser(email, password);
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    const statusCode = message.includes('registrado') ? 409 : 400;
    res.status(statusCode).json({ message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.status(200).json({ token });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    const statusCode = message.includes('JWT_SECRET') ? 500 : 401;
    res.status(statusCode).json({ message });
  }
}
