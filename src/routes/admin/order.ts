import { Router } from 'express';
import {
  deleteOrder,
  getAllOrders,
  getLastSevenDaysOrders,
  getOneOrder,
  updateOrder,
} from '../../controllers/admin/order';
import {
  mongoIdValidator,
  updateOrderValidator,
} from '../../validations/orderValidation';

const router = Router();

router.get('/', getLastSevenDaysOrders);
router.get('/all', getAllOrders);

router.get('/:orderId', mongoIdValidator, getOneOrder);

router.put('/:orderId', updateOrderValidator, updateOrder);

router.delete('/:orderId', mongoIdValidator, deleteOrder);

export default router;
