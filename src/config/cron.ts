import axios from 'axios';
import cron from 'node-cron';
import { ENV_VARS } from './envVars';

console.log('🚀 Cron worker started');

// Runs every 14 minutes
cron.schedule('*/14 * * * *', async () => {
  try {
    console.log('⏰ Sending ping to API...');
    const res = await axios.get(ENV_VARS.API_URL!);
    console.log('✅ Ping success:', res.status);
  } catch (err: any) {
    console.error('❌ Ping failed:', err.message);
  }
});

//? EXAMPLES && EXPLANAION:
//* 14 * * * * - Every 14 minutes
//* 0 0 * * 0 - At midnight on every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th of every month
//* 0 0 1 1 * - At midnight, on January 1st
//* 0 * * * * - Every hour
