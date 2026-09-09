// Serverless function: sends an SMS via Fast2SMS Quick SMS route (no DLT needed).
// The API key stays server-side only — never exposed to the browser.

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Defensive body parsing — handles both already-parsed objects and raw strings
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const { phone, message } = body;

    if (!phone || !message) {
      res.status(400).json({ success: false, error: 'Missing phone or message' });
      return;
    }

    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.error('FAST2SMS_API_KEY is not set in environment variables');
      res.status(500).json({ success: false, error: 'SMS service not configured' });
      return;
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

    const params = new URLSearchParams({
      authorization: apiKey,
      message: String(message),
      language: 'english',
      route: 'q',
      numbers: cleanPhone
    });

    const fast2smsUrl = 'https://www.fast2sms.com/dev/bulkV2?' + params.toString();

    const response = await fetch(fast2smsUrl, { method: 'GET' });
    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error('Fast2SMS returned non-JSON response:', rawText.slice(0, 300));
      res.status(502).json({ success: false, error: 'SMS provider returned an unexpected response' });
      return;
    }

    if (data && data.return === true) {
      res.status(200).json({ success: true, requestId: data.request_id });
    } else {
      console.error('Fast2SMS rejected the request:', JSON.stringify(data));
      res.status(200).json({ success: false, error: (data && data.message) || 'SMS provider rejected the request' });
    }
  } catch (err) {
    console.error('sendSms handler crashed:', err && err.message, err && err.stack);
    res.status(200).json({ success: false, error: 'Server error while sending SMS' });
  }
}
