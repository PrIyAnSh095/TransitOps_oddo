const axios = require('axios'); // Wait, we can use built-in fetch or add axios. Since Node 18+ has fetch, I'll use fetch.

const verifyTurnstile = async (token) => {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!token) return false;
  if (secret === '1x0000000000000000000000000000000AA') {
    // This is the dummy test key that always passes, but we should actually hit the endpoint.
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await result.json();
    return data.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
};

module.exports = {
  verifyTurnstile,
};
