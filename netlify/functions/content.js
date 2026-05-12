const { getStore } = require('@netlify/blobs');

const DEFAULT_DATA = {
  settings: {
    title: 'אצולת בית ירושלמי',
    subtitle: 'דירת 5 חדרים מפוארת עם 2 חצרות בלב ירושלים',
    desc: 'האחוזה ממוקמת בלב ירושלים וכוללת <b>שתי חצרות ענק</b>, עצי פרי, ערסלים, טרמפולינה ושולחן פינג פונג מקצועי.',
    logo: 'https://i.ibb.co/MypP2r2M/2026-05-04-040145.jpg',
    livingImage: 'https://i.ibb.co/cSXp8yDH/image.jpg',
    heroImages: ['https://i.ibb.co/kg5GmYVz/image.jpg', 'https://i.ibb.co/cSXp8yDH/image.jpg', 'https://i.ibb.co/99BLKjvx/2026-04-12-115528.jpg'],
    gallery: ['https://i.ibb.co/cSXp8yDH/image.jpg', 'https://i.ibb.co/kg5GmYVz/image.jpg', 'https://i.ibb.co/99BLKjvx/2026-04-12-115528.jpg', 'https://i.ibb.co/1fDRDR83/image.jpg'],
    faqs: [{ q: 'האם יש חניה באזור?', a: 'כן, ישנן אפשרויות חניה בקרבת מקום.' }],
    takenDates: []
  },
  leads: []
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-pass',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

function mergeData(data) {
  return {
    ...DEFAULT_DATA,
    ...data,
    settings: {
      ...DEFAULT_DATA.settings,
      ...(data && data.settings ? data.settings : {})
    },
    leads: data && Array.isArray(data.leads) ? data.leads : []
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  const store = getStore('site-content');

  if (event.httpMethod === 'GET') {
    const saved = await store.get('content', { type: 'json' });
    return { statusCode: 200, headers, body: JSON.stringify(mergeData(saved)) };
  }

  if (event.httpMethod === 'POST') {
    const adminPassword = process.env.ADMIN_PASSWORD || '298093';
    if (event.headers['x-admin-pass'] !== adminPassword) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const data = JSON.parse(event.body || '{}');
    await store.setJSON('content', mergeData(data));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
