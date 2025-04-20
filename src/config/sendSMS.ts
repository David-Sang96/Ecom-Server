import twilio from 'twilio';

import { ENV_VARS } from './envVars';

const twilioClient = twilio(
  ENV_VARS.TWILIO_ACC_SID,
  ENV_VARS.TWILIO_AUTH_TOKEN
);

export const sendSMS = async () => {
  await twilioClient.messages.create({
    body: 'Hello! This is a text message using twilio',
    from: '+16205828030',
    to: ENV_VARS.PHONE_NUMBER!,
  });
};
