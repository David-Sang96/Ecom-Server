import ejs from 'ejs';
import path from 'path';

import { Types } from 'mongoose';
import { ENV_VARS } from '../config/envVars';
import { transporter } from '../config/transporter';
import AppError from './AppError';

const mailOptions = (receiverEmail: string, subject: string, html: string) => ({
  from: {
    name: 'Convinence Ecom',
    address: ENV_VARS.SENDER_EMAIL!,
  },
  to: receiverEmail,
  subject,
  html,
});

export const sendEmailVerificationEmail = (
  receiverEmail: string,
  subject: string,
  name: string,
  role: string,
  token: string,
  userId: Types.ObjectId
) => {
  const emailVerificationLink = `${ENV_VARS.CLIENT_URL}/auth/verify-email?token=${token}&userId=${userId}`;
  const pdfLink = `${ENV_VARS.BASE_URL}/public/Welcome.pdf`;

  ejs.renderFile(
    path.join(__dirname, '..', 'views', 'emailVerifyTemplate.ejs'),
    { role, name, emailVerificationLink, pdfLink },
    async (err: Error | null, str: string) => {
      try {
        if (err) {
          console.error('EJS render error:', err);
          return;
        }
        await transporter.sendMail(mailOptions(receiverEmail, subject, str));
        console.log('Verification-Email has been sent');
      } catch (error) {
        console.log(`Error sending verificaiton`, error);
        throw new AppError('Error sending email verification', 500);
      }
    }
  );
};
