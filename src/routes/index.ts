import { Router } from 'express';

import { authorize } from '../middlewares/authorize';
import { protect } from '../middlewares/protect';
import adminRoute from './admin/index';
import orderRoute from './admin/order';
import userRoute from './admin/user';
import authRoute from './auth';
import fileRoute from './file';
import productRoute from './product';

const router = Router();

router.use('/', authRoute);
router.use('/product', protect, productRoute);
router.use('/file', protect, fileRoute);
router.use('/admin/product', protect, authorize, adminRoute);
router.use('/admin/order', protect, authorize, orderRoute);
router.use('/admin/user', protect, authorize, userRoute);

export default router;
