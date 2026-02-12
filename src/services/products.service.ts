import { pool } from '../db';

const EDIT_COOLDOWN_SECONDS = 20;

export interface Product {
  id: number;
  nombre: string;
  completado: boolean;
  created_at: Date;
  updated_at: Date;
  creado_por: number;
}

interface ProductWithWait extends Product {
  wait_seconds: number;
}

function assertValidName(nombre: string): string {
  const normalized = nombre.trim();

  if (!normalized) {
    throw new Error('El nombre no puede estar vacío');
  }

  return normalized;
}

export async function listProducts(): Promise<Product[]> {
  const result = await pool.query<Product>('SELECT * FROM products ORDER BY created_at ASC');
  return result.rows;
}

export async function addProduct(nombre: string, userId: number): Promise<Product> {
  const normalized = assertValidName(nombre);

  const existingProduct = await pool.query('SELECT id FROM products WHERE nombre = $1', [normalized]);

  if (existingProduct.rowCount && existingProduct.rowCount > 0) {
    throw new Error('Ya existe un producto con ese nombre');
  }

  const result = await pool.query<Product>(
    'INSERT INTO products (nombre, completado, creado_por) VALUES ($1, false, $2) RETURNING *',
    [normalized, userId]
  );

  return result.rows[0];
}

export async function toggleProductCompleted(productId: number): Promise<Product> {
  const productResult = await pool.query<ProductWithWait>(
    `SELECT *,
      GREATEST(
        0,
        $2 - EXTRACT(EPOCH FROM (NOW() - updated_at))
      )::INT AS wait_seconds
     FROM products
     WHERE id = $1`,
    [productId, EDIT_COOLDOWN_SECONDS]
  );

  if (!productResult.rowCount || productResult.rowCount === 0) {
    throw new Error('Producto no encontrado');
  }

  const product = productResult.rows[0];

  if (product.wait_seconds > 0) {
    throw new Error(`Debes esperar ${product.wait_seconds} segundos antes de editar este producto`);
  }

  const updateResult = await pool.query<Product>(
    `UPDATE products
      SET completado = NOT completado,
          updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [productId]
  );

  return updateResult.rows[0];
}

export async function deleteProduct(productId: number): Promise<void> {
  const result = await pool.query('DELETE FROM products WHERE id = $1', [productId]);

  if (!result.rowCount || result.rowCount === 0) {
    throw new Error('Producto no encontrado');
  }
}
