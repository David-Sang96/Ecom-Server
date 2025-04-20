import ejs from 'ejs';
import path from 'path';

import { ENV_VARS } from '../config/envVars';
import { transporter } from '../config/transporter';

const mailOptions = (receiverEmail: string, subject: string, html: string) => ({
  from: {
    name: 'Convinence Ecom',
    address: ENV_VARS.SENDER_EMAIL!,
  },
  to: receiverEmail,
  subject,
  html,
});

export const sendForgetEMail = (
  receiverEmail: string,
  subject: string,
  name: string,
  token: string
) => {
  const resetLink = `${ENV_VARS.BASE_URL}/forget-password?token=${token}`;

  ejs.renderFile(
    path.join(__dirname, '..', 'views', 'forgetTemplate.ejs'),
    { name, resetLink },
    async (err: Error | null, str: string) => {
      try {
        if (err) {
          console.error('EJS render error:', err);
          return;
        }
        await transporter.sendMail(mailOptions(receiverEmail, subject, str));
        console.log('Forget-Email has been sent');
      } catch (error) {
        console.error(error);
      }
    }
  );
};
