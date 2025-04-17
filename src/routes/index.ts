import { Router } from 'express';

import authRoute from './auth';

const router = Router();

router.use('/api/v1', authRoute);

export default router;
