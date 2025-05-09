import { Router } from 'express';

import adminRoute from './admin/index';
import authRoute from './auth';

const router = Router();

router.use('/api/v1', authRoute);
router.use('/api/v1/admin', adminRoute);

export default router;
