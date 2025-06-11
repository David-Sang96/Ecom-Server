import { Router } from 'express';
import {
  deleteOrder,
  getAllOrders,
  getOneOrder,
  updateOrder,
} from '../../controllers/admin/order';
import {
  mongoIdValidator,
  updateOrderValidator,
} from '../../validations/orderValidation';

const router = Router();

router.get('/', getAllOrders);

router.get('/:orderId', mongoIdValidator, getOneOrder);

router.put('/:orderId', updateOrderValidator, updateOrder);

router.delete('/:orderId', mongoIdValidator, deleteOrder);

export default router;
