// Client-side helper to trigger SMS sending via our serverless function.
// This never touches the Fast2SMS API key directly — that stays server-side.

export async function sendSms(phone, message) {
  try {
    const response = await fetch('/api/sendSms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('SMS send failed (likely offline):', err.message);
    return { success: false, error: 'offline' };
  }
}
