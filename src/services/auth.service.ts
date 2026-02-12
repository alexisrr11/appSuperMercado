import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

interface UserRecord {
  id: number;
  email: string;
  password_hash: string;
}

export async function registerUser(email: string, password: string): Promise<void> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    throw new Error('Email y password son obligatorios');
  }

  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);

  if (existingUser.rowCount && existingUser.rowCount > 0) {
    throw new Error('El email ya está registrado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [
    trimmedEmail,
    passwordHash,
  ]);
}

export async function loginUser(email: string, password: string): Promise<string> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    throw new Error('Email y password son obligatorios');
  }

  const userResult = await pool.query<UserRecord>(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [trimmedEmail]
  );

  if (!userResult.rowCount || userResult.rowCount === 0) {
    throw new Error('Credenciales inválidas');
  }

  const user = userResult.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error('Credenciales inválidas');
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET no configurado');
  }

  return jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
}
