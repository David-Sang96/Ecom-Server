import { Router } from 'express';
import {
  getOneOrder,
  getOrders,
  getSevenDaysAgoOrder,
} from '../controllers/order';
import { mongoIdValidator } from '../validations/orderValidation';

const router = Router();

router.get('/', getSevenDaysAgoOrder);
router.get('/all', getOrders);
router.get('/:orderId', mongoIdValidator, getOneOrder);

export default router;
