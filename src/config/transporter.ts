import nodemailer from 'nodemailer';

import { ENV_VARS } from './envVars';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: ENV_VARS.SENDER_EMAIL,
    pass: ENV_VARS.GOOGLE_APP_PASSEWORD,
  },
});
