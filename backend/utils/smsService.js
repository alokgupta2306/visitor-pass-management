import twilio from 'twilio';

const sid = process.env.TWILIO_SID;
const token = process.env.TWILIO_TOKEN;
const from = process.env.TWILIO_FROM;

const client = sid && token ? twilio(sid, token) : null;

export const sendSms = async ({ to, body }) => {
  if (!client || !from) {
    console.log('[sms:dev] skipping send', { to, body });
    return;
  }
  await client.messages.create({ from, to, body });
};


