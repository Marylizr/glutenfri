import http from 'node:http';

const HOST = '127.0.0.1';
const PORT = Number(process.env.QA_API_PORT || 4174);
const ADMIN = {
  _id: 'qa-admin-local',
  name: 'Admin QA Local',
  email: 'qa-admin@glutenfri.test',
  isAdmin: true,
};

let reports = [
  {
    _id: 'report-closed',
    establishment: { _id: 'est-closed', name: 'Mesa do Norte', type: 'restaurant', address: 'Rua Fictícia 10, Porto' },
    reason: 'closed_business',
    comment: 'A porta tem um aviso de encerramento desde julho.',
    status: 'pending',
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    _id: 'report-address',
    establishment: { _id: 'est-review', name: 'Pão Claro', type: 'bakery', address: 'Avenida de Teste 24, Braga' },
    reason: 'incorrect_address',
    comment: 'A ficha aponta para o número anterior.',
    status: 'reviewing',
    createdAt: '2026-08-21T12:00:00.000Z',
  },
];

let establishments = [
  {
    _id: 'est-review', name: 'Pão Claro', type: 'bakery', address: 'Avenida de Teste 24, Braga',
    informationCategory: 'specialized_gluten_free_business', sourceType: 'public_source',
    confidenceLevel: 'source_outdated', informationStatus: 'active', qualityReviewStatus: 'in_review',
    sourceName: 'Diretório municipal de demonstração', sourceUrl: 'https://example.test/fonte-publica',
    updatedAt: '2026-08-15T09:00:00.000Z',
  },
  {
    _id: 'est-closed', name: 'Mesa do Norte', type: 'restaurant', address: 'Rua Fictícia 10, Porto',
    informationCategory: 'community_information', sourceType: 'community_experience',
    confidenceLevel: 'source_pending_review', informationStatus: 'active', qualityReviewStatus: 'pending',
    sourceName: null, sourceUrl: null, updatedAt: '2026-08-10T09:00:00.000Z',
  },
  {
    _id: 'est-duplicate-a', name: 'Loja Verde', type: 'store', address: 'Praça QA 3, Viana do Castelo',
    informationCategory: 'retail_store', sourceType: 'business_provided',
    confidenceLevel: 'source_verified', informationStatus: 'active', qualityReviewStatus: 'reviewed',
    sourceName: 'Informação fornecida pelo estabelecimento', sourceUrl: 'https://example.test/loja-verde',
    updatedAt: '2026-08-22T09:00:00.000Z',
  },
  {
    _id: 'est-duplicate-b', name: 'Loja Verde', type: 'store', address: 'Praça QA 3, Viana do Castelo',
    informationCategory: 'community_information', sourceType: 'source_not_identified',
    confidenceLevel: 'source_pending_review', informationStatus: 'active', qualityReviewStatus: 'pending',
    sourceName: null, sourceUrl: null, updatedAt: '2026-08-18T09:00:00.000Z',
  },
];

const history = {
  'est-review': [
    {
      _id: 'history-1', channel: 'administrative', action: 'establishment_quality_reviewed',
      actor: ADMIN, reason: 'Revisão QA anterior', createdAt: '2026-08-19T14:30:00.000Z',
    },
    {
      _id: 'history-2', channel: 'commercial', action: 'establishment_updated',
      actor: ADMIN, reason: 'Morada confirmada em ambiente QA', createdAt: '2026-08-18T10:00:00.000Z',
    },
  ],
};

const duplicateCandidates = () => establishments.some((item) => item._id === 'est-duplicate-b' && !item.duplicateOf)
  ? [{
      first: establishments.find((item) => item._id === 'est-duplicate-a'),
      second: establishments.find((item) => item._id === 'est-duplicate-b'),
      reasons: ['same_name_address'],
      distanceMeters: 12,
    }]
  : [];

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readBody(req);
    if (body.email !== ADMIN.email || body.password !== 'LocalQA-Only-2026!') {
      return json(res, 401, { error: 'Credenciais QA inválidas' });
    }
    return json(res, 200, { token: 'qa-local-token', user: ADMIN });
  }
  if (req.method === 'GET' && url.pathname === '/api/auth/me') return json(res, 200, { user: ADMIN });
  if (req.method === 'GET' && url.pathname === '/api/users/me/saved') return json(res, 200, []);
  if (req.method === 'GET' && url.pathname === '/api/admin/establishment-reports') return json(res, 200, reports);
  if (req.method === 'GET' && url.pathname === '/api/admin/data-quality/duplicates') return json(res, 200, duplicateCandidates());
  if (req.method === 'GET' && url.pathname === '/api/admin/establishments') {
    return json(res, 200, { data: establishments, page: 1, limit: 100, total: establishments.length, totalPages: 1 });
  }
  const historyMatch = url.pathname.match(/^\/api\/admin\/establishments\/([^/]+)\/history$/);
  if (req.method === 'GET' && historyMatch) return json(res, 200, history[historyMatch[1]] || []);

  const reportMatch = url.pathname.match(/^\/api\/admin\/establishment-reports\/([^/]+)$/);
  if (req.method === 'PATCH' && reportMatch) {
    const body = await readBody(req);
    reports = reports.map((report) => report._id === reportMatch[1] ? { ...report, status: body.status, resolutionNote: body.reason, reviewedBy: ADMIN, reviewedAt: new Date().toISOString() } : report);
    if (body.markClosed) establishments = establishments.map((item) => item._id === 'est-closed' ? { ...item, informationStatus: 'closed_or_removed', qualityReviewStatus: 'reviewed' } : item);
    return json(res, 200, reports.find((report) => report._id === reportMatch[1]));
  }

  const qualityMatch = url.pathname.match(/^\/api\/admin\/establishments\/([^/]+)\/quality$/);
  if (req.method === 'PATCH' && qualityMatch) {
    const body = await readBody(req);
    establishments = establishments.map((item) => item._id === qualityMatch[1] ? { ...item, ...body, updatedAt: new Date().toISOString() } : item);
    const updated = establishments.find((item) => item._id === qualityMatch[1]);
    history[qualityMatch[1]] = [{ _id: `history-${Date.now()}`, channel: 'administrative', action: body.duplicateOf ? 'establishment_duplicate_marked' : 'establishment_quality_reviewed', actor: ADMIN, reason: body.reason, createdAt: new Date().toISOString() }, ...(history[qualityMatch[1]] || [])];
    return json(res, 200, updated);
  }
  return json(res, 404, { error: `QA route not found: ${req.method} ${url.pathname}` });
});

server.listen(PORT, HOST, () => {
  console.log(`GlutenFri data-quality QA API: http://${HOST}:${PORT}/api`);
});
