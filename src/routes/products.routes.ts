import { Router } from 'express';
import {
  createProduct,
  getProducts,
  removeProduct,
  updateProductStatus,
} from '../controllers/products.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const productsRouter = Router();

productsRouter.use(authMiddleware);
productsRouter.get('/', getProducts);
productsRouter.post('/', createProduct);
productsRouter.patch('/:id/toggle', updateProductStatus);
productsRouter.delete('/:id', removeProduct);

export default productsRouter;
