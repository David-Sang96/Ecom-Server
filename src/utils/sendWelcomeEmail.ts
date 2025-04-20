import ejs from 'ejs';
import path from 'path';

import { ENV_VARS } from '../config/envVars';
import { transporter } from '../config/transporter';

const mailOptions = (receiverEmail: string, subject: string, html: string) => ({
  from: {
    name: 'Convinence Ecom',
    address: ENV_VARS.SENDER_EMAIL!,
  }, // sender address
  to: receiverEmail, // list of receivers
  subject, // Subject line
  html, // html body
});

export const sendWelcomeEMail = (
  receiverEmail: string,
  subject: string,
  name: string,
  role: string
) => {
  const pdfLink = `${ENV_VARS.BASE_URL}/public/Welcome.pdf`;

  ejs.renderFile(
    path.join(__dirname, '..', 'views', 'welcomeTemplate.ejs'),
    { role, name, pdfLink },
    async (err: Error | null, str: string) => {
      try {
        if (err) {
          console.error('EJS render error:', err);
          return;
        }
        await transporter.sendMail(mailOptions(receiverEmail, subject, str));
        console.log('Welcome-Email has been sent');
      } catch (error) {
        console.error(error);
      }
    }
  );
};
