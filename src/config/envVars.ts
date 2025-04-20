import 'dotenv/config';

export const ENV_VARS = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  BASE_URL: process.env.BASE_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  TWILIO_ACC_SID: process.env.TWILIO_ACC_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  PHONE_NUMBER: process.env.PHONE_NUMBER,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  GOOGLE_APP_PASSEWORD: process.env.GOOGLE_APP_PASSEWORD,
};
