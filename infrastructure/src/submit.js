'use strict';

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({});
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN,
      Vary: 'Origin',
    },
    body: JSON.stringify(body),
  };
}

function text(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/\u0000/g, '').trim().slice(0, maxLength)
    : '';
}

exports.handler = async (event) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin;
  if (event.requestContext?.identity?.sourceIp && origin !== process.env.ALLOWED_ORIGIN) {
    return response(403, { error: 'This form can only be submitted from the Travel Bug Tours website.' });
  }

  if (!event.body || Buffer.byteLength(event.body, 'utf8') > 20_000) {
    return response(400, { error: 'Please shorten your enquiry and try again.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return response(400, { error: 'We could not read that enquiry. Please try again.' });
  }

  // Bots commonly fill every visible and hidden field. Pretend to succeed so
  // they do not retry, but never send an email.
  if (text(payload.website, 200)) return response(200, { ok: true });

  const name = text(payload.name, 120);
  const email = text(payload.email, 254);
  const trip = text(payload.trip, 180);
  const people = text(payload.people, 80);
  const message = text(payload.message, 5_000);

  if (!name || !emailPattern.test(email)) {
    return response(400, { error: 'Please enter your name and a valid email address.' });
  }

  const emailBody = [
    'New Travel Bug Tours enquiry',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Trip: ${trip || 'Not sure yet'}`,
    `Travellers: ${people || 'Not provided'}`,
    '',
    'Message:',
    message || '(No additional details)',
  ].join('\n');

  try {
    await ses.send(new SendEmailCommand({
      Source: process.env.SENDER_EMAIL,
      Destination: { ToAddresses: [process.env.RECIPIENT_EMAIL] },
      ReplyToAddresses: [email],
      Message: {
        Subject: { Charset: 'UTF-8', Data: `Trip enquiry — ${name}` },
        Body: { Text: { Charset: 'UTF-8', Data: emailBody } },
      },
    }));
  } catch (error) {
    // Do not log enquiry content or expose SES configuration details to a visitor.
    console.error('Unable to send enquiry:', error.name || 'UnknownError');
    return response(500, { error: 'We could not send that just now. Please email us directly instead.' });
  }

  return response(200, { ok: true });
};
