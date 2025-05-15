import { Router } from 'express';

import { authorize } from '../middlewares/authorize';
import { protect } from '../middlewares/protect';
import adminRoute from './admin/index';
import authRoute from './auth';
import fileRoute from './file';
import productRoute from './product';

const router = Router();

router.use('/', authRoute);
router.use('/admin', protect, authorize, adminRoute);
router.use('/product', protect, productRoute);
router.use('/file', protect, fileRoute);

export default router;
