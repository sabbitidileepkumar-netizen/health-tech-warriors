// Serverless function: sends an SMS via Fast2SMS Quick SMS route (no DLT needed).
// The API key stays server-side only — never exposed to the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, message } = req.body || {};

  if (!phone || !message) {
    return res.status(400).json({ error: 'Missing phone or message' });
  }

  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SMS service not configured' });
  }

  // Fast2SMS expects a 10-digit Indian number, no +91 or spaces
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  const params = new URLSearchParams({
    authorization: apiKey,
    message: message,
    language: 'english',
    route: 'q', // Quick SMS — no DLT registration required
    numbers: cleanPhone
  });

  try {
    const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
      method: 'GET'
    });
    const data = await response.json();

    if (data.return === true) {
      return res.status(200).json({ success: true, requestId: data.request_id });
    } else {
      return res.status(502).json({ success: false, error: data.message || 'SMS provider rejected the request' });
    }
  } catch (err) {
    console.error('SMS send failed:', err.message);
    return res.status(500).json({ success: false, error: 'Could not reach SMS provider' });
  }
}
