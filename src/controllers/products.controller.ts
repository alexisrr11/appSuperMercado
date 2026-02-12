import { Response } from 'express';
import {
  addProduct,
  deleteProduct,
  listProducts,
  toggleProductCompleted,
} from '../services/products.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function getProducts(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const products = await listProducts();
    res.status(200).json(products);
  } catch {
    res.status(500).json({ message: 'Error al listar productos' });
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { nombre } = req.body;

    if (!req.userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const product = await addProduct(nombre, req.userId);
    res.status(201).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    const statusCode =
      message.includes('vacío') || message.includes('existe') ? 400 : 500;
    res.status(statusCode).json({ message });
  }
}

export async function updateProductStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const productId = Number(req.params.id);
    const updatedProduct = await toggleProductCompleted(productId);
    res.status(200).json(updatedProduct);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';

    if (message.includes('Debes esperar')) {
      res.status(403).json({ message });
      return;
    }

    const statusCode = message.includes('no encontrado') ? 404 : 400;
    res.status(statusCode).json({ message });
  }
}

export async function removeProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const productId = Number(req.params.id);
    await deleteProduct(productId);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    const statusCode = message.includes('no encontrado') ? 404 : 400;
    res.status(statusCode).json({ message });
  }
}
