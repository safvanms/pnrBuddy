// Vercel Serverless Function: /api/pnr?pnr=... or /api/pnr/:pnr
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const queryPnr = req.query?.pnr;
  const match = req.url ? req.url.match(/\/api\/pnr\/?(\d{10})/) : null;
  const pnr = queryPnr || (match ? match[1] : null);

  if (!pnr || !/^\d{10}$/.test(pnr)) {
    return res.status(400).json({
      success: false,
      error: 'Valid 10-digit Indian Railway PNR number is required.'
    });
  }

  try {
    const ctUrl = `https://cttrainsapi.confirmtkt.com/api/v2/ctpro/mweb/${pnr}?querysource=ct-web&locale=en&getHighChanceText=true&livePnr=true`;
    const ctRes = await fetch(ctUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://www.confirmtkt.com',
        'Referer': 'https://www.confirmtkt.com/'
      },
      body: JSON.stringify({
        proPlanName: 'CP7',
        emailId: '',
        tempToken: ''
      })
    });

    if (ctRes.ok) {
      const json = await ctRes.json();
      const pnrRes = json.data?.pnrResponse;

      if (!pnrRes || pnrRes.error || !pnrRes.trainNo) {
        return res.status(404).json({
          success: false,
          pnr,
          error: typeof pnrRes?.error === 'string' ? pnrRes.error : (pnrRes?.error?.message || 'Flushed PNR / PNR not yet generated in Indian Railways reservation database.')
        });
      }

      return res.status(200).json({
        success: true,
        pnr,
        data: json.data
      });
    }

    return res.status(ctRes.status).json({
      success: false,
      pnr,
      error: 'Indian Railways PRS gateway returned an error.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      pnr,
      error: err.message || 'Error communicating with Indian Railways PRS gateway.'
    });
  }
}
