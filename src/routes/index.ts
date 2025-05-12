import { Router } from 'express';

import { protect } from '../middlewares/protect';
import adminRoute from './admin/index';
import authRoute from './auth';
import publicProductRoute from './product';

const router = Router();

router.use('/api/v1', authRoute);
router.use('/api/v1/admin', protect, adminRoute);
router.use('/api/v1/public-product', publicProductRoute);

export default router;
