const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Establishment = require('../src/models/Establishment');
const Review = require('../src/models/Review');
const BusinessClaim = require('../src/models/BusinessClaim');
const EstablishmentManager = require('../src/models/EstablishmentManager');
const EstablishmentChangeRequest = require('../src/models/EstablishmentChangeRequest');
const EstablishmentAuditLog = require('../src/models/EstablishmentAuditLog');
const AdminAction = require('../src/models/AdminAction');
const {
  EstablishmentAnalyticsEvent,
} = require('../src/models/EstablishmentAnalyticsEvent');

const TEST_URI = process.env.MONGODB_TEST_URI;
const JWT_SECRET = 'glutenfri-isolated-integration-secret-000000';

async function jsonRequest(baseUrl, path, { token, method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
}

function tokenFor(user) {
  return jwt.sign({ id: user._id.toString(), name: user.name }, JWT_SECRET, {
    expiresIn: '1h',
  });
}

test(
  'flujos comerciales aislados: reclamación, IDOR, publicación, analítica, patrocinio y GDPR',
  { skip: !TEST_URI },
  async (t) => {
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.PUBLIC_SITE_URL = 'https://glutenfri.test';
    await mongoose.connect(TEST_URI);
    await mongoose.connection.dropDatabase();

    const [admin, managerA, managerB, regular] = await User.create([
      {
        name: 'Admin Test',
        email: 'admin@test.invalid',
        passwordHash: 'not-used',
        privacyAcceptedAt: new Date(),
        isAdmin: true,
      },
      {
        name: 'Manager A',
        email: 'a@test.invalid',
        passwordHash: 'not-used',
        privacyAcceptedAt: new Date(),
      },
      {
        name: 'Manager B',
        email: 'b@test.invalid',
        passwordHash: 'not-used',
        privacyAcceptedAt: new Date(),
      },
      {
        name: 'Regular User',
        email: 'regular@test.invalid',
        passwordHash: 'not-used',
        privacyAcceptedAt: new Date(),
      },
    ]);
    const [placeA, placeB, placeC] = await Establishment.create([
      {
        name: 'Fixture A',
        type: 'store',
        source: 'user',
        trustStatus: 'COMMUNITY_REPORTED',
        certified: false,
        riskLevel: 'moderate',
        businessDescription: 'Published original',
      },
      {
        name: 'Fixture B',
        type: 'restaurant',
        source: 'user',
        trustStatus: 'PENDING_VALIDATION',
      },
      {
        name: 'Fixture C',
        type: 'bakery',
        source: 'user',
        trustStatus: 'PENDING_VALIDATION',
      },
    ]);
    await EstablishmentManager.create({
      establishment: placeB._id,
      user: managerB._id,
      role: 'owner',
      status: 'active',
      grantedBy: admin._id,
    });
    await Review.create({
      establishment: placeB._id,
      user: managerB._id,
      rating: 4,
      staffUnderstanding: 'okay',
      hasDedicatedMenu: true,
      dedicatedKitchen: false,
      riskLevel: 'moderate',
    });
    await Promise.all([
      BusinessClaim.init(),
      EstablishmentManager.init(),
      EstablishmentAnalyticsEvent.init(),
    ]);

    const tokens = {
      admin: tokenFor(admin),
      a: tokenFor(managerA),
      b: tokenFor(managerB),
      regular: tokenFor(regular),
    };
    const app = createApp({
      corsOrigins: 'http://127.0.0.1:5173',
      environment: 'test',
      trustProxyHops: false,
    });
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    let claimAId;

    try {
      await t.test('la reclamación valida privacidad, duplicados y permisos administrativos', async () => {
        const claimPayload = {
          responsibleName: 'Manager A',
          relationship: 'Proprietária',
          professionalEmail: 'manager@fixture-a.invalid',
          officialUrl: 'https://FIXTURE-A.invalid/contacto#equipa',
          verificationMethod: 'official_domain_email',
          evidenceDescription: 'O email profissional pertence ao domínio público do negócio.',
          additionalComment: 'Privado para revisão',
          consent: true,
        };
        const invalidConsent = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/claims`,
          { token: tokens.a, method: 'POST', body: { ...claimPayload, consent: false } }
        );
        assert.equal(invalidConsent.response.status, 400);

        const created = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/claims`,
          { token: tokens.a, method: 'POST', body: claimPayload }
        );
        assert.equal(created.response.status, 201);
        assert.equal(created.body.status, 'pending');
        assert.equal(created.body.officialUrl, 'https://fixture-a.invalid/contacto');
        assert.equal('professionalEmail' in created.body, false);
        assert.equal('evidenceDescription' in created.body, false);
        claimAId = created.body._id;

        const duplicate = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/claims`,
          { token: tokens.a, method: 'POST', body: claimPayload }
        );
        assert.equal(duplicate.response.status, 409);

        const publicPlace = await jsonRequest(baseUrl, `/api/establishments/${placeA._id}`);
        assert.equal(JSON.stringify(publicPlace.body).includes('Privado para revisión'), false);

        const normalAdminAttempt = await jsonRequest(baseUrl, '/api/admin/business/claims', {
          token: tokens.regular,
        });
        assert.equal(normalAdminAttempt.response.status, 403);

        const adminList = await jsonRequest(baseUrl, '/api/admin/business/claims?status=pending', {
          token: tokens.admin,
        });
        assert.equal(adminList.response.status, 200);
        assert.equal(adminList.body.data.length, 1);
        assert.match(adminList.body.data[0].evidenceDescription, /domínio público/);
        const ownList = await jsonRequest(baseUrl, '/api/business/claims', { token: tokens.a });
        assert.equal('professionalEmail' in ownList.body.data[0], false);
        assert.equal('evidenceDescription' in ownList.body.data[0], false);

        const approved = await jsonRequest(
          baseUrl,
          `/api/admin/business/claims/${adminList.body.data[0]._id}`,
          {
            token: tokens.admin,
            method: 'PATCH',
            body: { status: 'approved', reason: 'Evidência confirmada manualmente' },
          }
        );
        assert.equal(approved.response.status, 200);
        assert.equal(
          await EstablishmentManager.countDocuments({
            establishment: placeA._id,
            user: managerA._id,
            status: 'active',
          }),
          1
        );

        const invalidTransition = await jsonRequest(
          baseUrl,
          `/api/admin/business/claims/${adminList.body.data[0]._id}`,
          {
            token: tokens.admin,
            method: 'PATCH',
            body: { status: 'rejected', reason: 'No debe permitirse después de aprobar' },
          }
        );
        assert.equal(invalidTransition.response.status, 409);
      });

      await t.test('solicitar información y rechazar conserva una traza sin exponer evidencia', async () => {
        const created = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeC._id}/claims`,
          {
            token: tokens.regular,
            method: 'POST',
            body: {
              responsibleName: 'Regular User',
              relationship: 'Gerente',
              professionalEmail: 'regular@fixture-c.invalid',
              officialUrl: 'https://fixture-c.invalid',
              verificationMethod: 'administrative_review',
              evidenceDescription: 'Primeira descrição para revisão administrativa.',
              consent: true,
            },
          }
        );
        assert.equal(created.response.status, 201);
        assert.equal(
          (await jsonRequest(baseUrl, `/api/admin/business/claims/${created.body._id}`, {
            token: tokens.admin,
            method: 'PATCH',
            body: { status: 'needs_information', reason: 'Falta confirmar o contacto público' },
          })).response.status,
          200
        );
        const additional = await jsonRequest(
          baseUrl,
          `/api/business/claims/${created.body._id}/information`,
          {
            token: tokens.regular,
            method: 'PATCH',
            body: { evidenceDescription: 'Contacto público confirmado na página oficial.' },
          }
        );
        assert.equal(additional.response.status, 200);
        assert.equal(additional.body.status, 'pending');
        assert.equal('evidenceDescription' in additional.body, false);
        assert.equal(
          (await jsonRequest(baseUrl, `/api/admin/business/claims/${created.body._id}`, {
            token: tokens.admin,
            method: 'PATCH',
            body: { status: 'rejected', reason: 'A relação comercial não ficou demonstrada' },
          })).response.status,
          200
        );
      });

      await t.test('la autorización por recurso bloquea IDOR entre negocios', async () => {
        assert.equal(
          (await jsonRequest(baseUrl, `/api/business/establishments/${placeA._id}`, { token: tokens.a })).response.status,
          200
        );
        assert.equal(
          (await jsonRequest(baseUrl, `/api/business/establishments/${placeB._id}`, { token: tokens.b })).response.status,
          200
        );
        assert.equal(
          (await jsonRequest(baseUrl, `/api/business/establishments/${placeB._id}`, { token: tokens.a })).response.status,
          403
        );
        assert.equal(
          (await jsonRequest(baseUrl, `/api/business/establishments/${placeB._id}/changes`, {
            token: tokens.a,
            method: 'POST',
            body: { changes: { phone: '+351 210 000 000' }, submit: true },
          })).response.status,
          403
        );
        assert.equal(
          (await jsonRequest(baseUrl, `/api/business/establishments/${placeB._id}/analytics`, { token: tokens.a })).response.status,
          403
        );
        assert.equal(
          (await jsonRequest(baseUrl, `/api/business/establishments/${placeA._id}`, { token: tokens.regular })).response.status,
          403
        );
        assert.equal(
          (await jsonRequest(baseUrl, `/api/admin/business/establishments/${placeA._id}/sponsorship`, {
            token: tokens.a,
            method: 'PATCH',
            body: { active: true, reason: 'Intento no autorizado' },
          })).response.status,
          403
        );
      });

      await t.test('borradores, rechazo y publicación mantienen separados los datos protegidos', async () => {
        const protectedAttempt = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/changes`,
          {
            token: tokens.a,
            method: 'POST',
            body: { changes: { certified: true, riskLevel: 'none' }, submit: true },
          }
        );
        assert.equal(protectedAttempt.response.status, 400);

        const draft = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/changes`,
          {
            token: tokens.a,
            method: 'POST',
            body: {
              changes: {
                businessDescription: 'Draft private',
                websiteUrl: 'https://EXAMPLE.invalid/menu#today',
              },
              submit: false,
            },
          }
        );
        assert.equal(draft.response.status, 201);
        assert.equal(draft.body.status, 'draft');
        assert.equal(draft.body.changes.websiteUrl, 'https://example.invalid/menu');
        assert.equal(
          (await Establishment.findById(placeA._id).lean()).businessDescription,
          'Published original'
        );

        const rejectedRequest = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/changes`,
          {
            token: tokens.a,
            method: 'POST',
            body: { changes: { businessDescription: 'Must remain rejected' }, submit: true },
          }
        );
        const regularApproval = await jsonRequest(
          baseUrl,
          `/api/admin/business/changes/${rejectedRequest.body._id}`,
          {
            token: tokens.a,
            method: 'PATCH',
            body: { status: 'published', reason: 'Intento propio' },
          }
        );
        assert.equal(regularApproval.response.status, 403);
        assert.equal(
          (await jsonRequest(baseUrl, `/api/admin/business/changes/${rejectedRequest.body._id}`, {
            token: tokens.admin,
            method: 'PATCH',
            body: { status: 'rejected', reason: 'Información insuficiente' },
          })).response.status,
          200
        );
        assert.equal(
          (await Establishment.findById(placeA._id).lean()).businessDescription,
          'Published original'
        );

        const publishRequest = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/changes`,
          {
            token: tokens.a,
            method: 'POST',
            body: { changes: { businessDescription: 'Published approved', name: 'Fixture A Updated' }, submit: true },
          }
        );
        assert.equal(
          (await jsonRequest(baseUrl, `/api/admin/business/changes/${publishRequest.body._id}`, {
            token: tokens.admin,
            method: 'PATCH',
            body: { status: 'published', reason: 'Contenido comercial comprobado' },
          })).response.status,
          200
        );
        const published = await Establishment.findById(placeA._id).lean();
        assert.equal(published.businessDescription, 'Published approved');
        assert.equal(published.name, 'Fixture A Updated');
        assert.equal(published.certified, false);
        assert.equal(published.trustStatus, 'COMMUNITY_REPORTED');
        assert.equal(published.riskLevel, 'moderate');
      });

      await t.test('la analítica deduplica, limita tipos y no persiste datos del dispositivo', async () => {
        const event = {
          eventId: `detail:${placeA._id}:fixture-event-0001`,
          type: 'detail_impression',
        };
        const first = await jsonRequest(
          baseUrl,
          `/api/business/analytics/establishments/${placeA._id}/events`,
          { method: 'POST', body: event, headers: { 'User-Agent': 'Fixture Browser/1.0' } }
        );
        const duplicate = await jsonRequest(
          baseUrl,
          `/api/business/analytics/establishments/${placeA._id}/events`,
          { method: 'POST', body: event, headers: { 'User-Agent': 'Fixture Browser/1.0' } }
        );
        assert.equal(first.response.status, 201);
        assert.equal(duplicate.response.status, 200);
        assert.equal(duplicate.body.duplicate, true);
        assert.equal(
          (await jsonRequest(
            baseUrl,
            `/api/business/analytics/establishments/${placeA._id}/events`,
            { method: 'POST', body: { ...event, eventId: `${event.eventId}-unknown`, type: 'unknown' } }
          )).response.status,
          400
        );
        const stored = await EstablishmentAnalyticsEvent.findOne({ eventId: event.eventId }).lean();
        assert.equal('ip' in stored, false);
        assert.equal('userAgent' in stored, false);
        assert.equal('fingerprint' in stored, false);

        const own = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/analytics?period=30d`,
          { token: tokens.a }
        );
        assert.equal(own.response.status, 200);
        assert.equal(own.body.impressions, 1);
        assert.equal(own.body.conversionRate, 0);
        assert.match(own.body.definition, /divididas por impresiones/);
        assert.equal(
          (await jsonRequest(baseUrl, `/api/business/establishments/${placeA._id}/analytics?period=365d`, { token: tokens.a })).response.status,
          400
        );
      });

      await t.test('patrocinio, sello y kit solo usan estado administrativo y datos publicados', async () => {
        const sponsored = await jsonRequest(
          baseUrl,
          `/api/admin/business/establishments/${placeA._id}/sponsorship`,
          {
            token: tokens.admin,
            method: 'PATCH',
            body: {
              active: true,
              startsAt: '2026-01-01T00:00:00.000Z',
              endsAt: '2027-01-01T00:00:00.000Z',
              reason: 'Campaña manual de test',
            },
          }
        );
        assert.equal(sponsored.response.status, 200);
        const publicPlace = await jsonRequest(baseUrl, `/api/establishments/${placeA._id}`);
        assert.equal(publicPlace.body.sponsorship.status, 'active');
        assert.equal(publicPlace.body.certified, false);
        assert.equal(publicPlace.body.riskLevel, 'moderate');

        const promotion = await jsonRequest(
          baseUrl,
          `/api/business/establishments/${placeA._id}/promotion`,
          { token: tokens.a }
        );
        assert.equal(promotion.response.status, 200);
        assert.equal(
          promotion.body.canonicalUrl,
          `https://glutenfri.test/lugar/${placeA._id}`
        );
        assert.match(promotion.body.badge.svg, /role="img"/);
        assert.doesNotMatch(promotion.body.badge.svg, /certificado pelo|100% seguro/i);
        assert.equal(promotion.body.googleProfileKit.longDescription, 'Published approved');
        assert.doesNotMatch(JSON.stringify(promotion.body), /Draft private|Must remain rejected/);
        assert.equal(
          (await jsonRequest(
            baseUrl,
            `/api/admin/business/establishments/${placeA._id}/sponsorship`,
            {
              token: tokens.admin,
              method: 'PATCH',
              body: {
                active: true,
                startsAt: '2027-02-01T00:00:00.000Z',
                endsAt: '2027-01-01T00:00:00.000Z',
                reason: 'Fechas inválidas de prueba',
              },
            }
          )).response.status,
          400
        );
      });

      await t.test('la revocación retira el acceso y queda auditada', async () => {
        const revoked = await jsonRequest(
          baseUrl,
          `/api/admin/business/claims/${claimAId}`,
          {
            token: tokens.admin,
            method: 'PATCH',
            body: { status: 'revoked', reason: 'Revocación controlada de prueba' },
          }
        );
        assert.equal(revoked.response.status, 200);
        assert.equal(
          (await jsonRequest(baseUrl, `/api/business/establishments/${placeA._id}`, { token: tokens.a })).response.status,
          403
        );
        assert.ok(
          await EstablishmentAuditLog.exists({
            targetId: claimAId,
            action: 'claim_revoked',
            fromStatus: 'approved',
            toStatus: 'revoked',
          })
        );
      });

      await t.test('la administración edita y elimina usuarios con confirmación y auditoría', async () => {
        const forbidden = await jsonRequest(baseUrl, `/api/admin/users/${regular._id}`, {
          token: tokens.regular,
          method: 'PATCH',
          body: { name: 'Cambio indebido' },
        });
        assert.equal(forbidden.response.status, 403);

        const updated = await jsonRequest(baseUrl, `/api/admin/users/${regular._id}`, {
          token: tokens.admin,
          method: 'PATCH',
          body: { name: 'Regular Editado', email: 'regular-edited@test.invalid' },
        });
        assert.equal(updated.response.status, 200);
        assert.equal(updated.body.user.name, 'Regular Editado');
        assert.equal(updated.body.user.email, 'regular-edited@test.invalid');

        const duplicate = await jsonRequest(baseUrl, `/api/admin/users/${regular._id}`, {
          token: tokens.admin,
          method: 'PATCH',
          body: { email: managerB.email },
        });
        assert.equal(duplicate.response.status, 409);

        const selfDelete = await jsonRequest(baseUrl, `/api/admin/users/${admin._id}`, {
          token: tokens.admin,
          method: 'DELETE',
          body: { confirmEmail: admin.email, reason: 'No debe poder eliminarse' },
        });
        assert.equal(selfDelete.response.status, 409);

        const wrongConfirmation = await jsonRequest(baseUrl, `/api/admin/users/${regular._id}`, {
          token: tokens.admin,
          method: 'DELETE',
          body: { confirmEmail: 'wrong@test.invalid', reason: 'Prueba de confirmación' },
        });
        assert.equal(wrongConfirmation.response.status, 400);

        const deleted = await jsonRequest(baseUrl, `/api/admin/users/${regular._id}`, {
          token: tokens.admin,
          method: 'DELETE',
          body: {
            confirmEmail: 'regular-edited@test.invalid',
            reason: 'Cuenta fixture eliminada durante la prueba',
          },
        });
        assert.equal(deleted.response.status, 204);
        assert.equal(await User.exists({ _id: regular._id }), null);
        assert.ok(
          await AdminAction.exists({
            actor: admin._id,
            action: 'user_deleted',
            targetType: 'user',
            targetId: { $exists: false },
          })
        );
      });

      await t.test('la exportación incluye datos propios y el borrado anonimiza auditoría sin borrar comunidad ajena', async () => {
        const exported = await jsonRequest(baseUrl, '/api/users/me/export', { token: tokens.a });
        assert.equal(exported.response.status, 200);
        assert.ok(exported.body.businessClaims.length >= 1);
        assert.ok(exported.body.managedEstablishments.length >= 1);
        assert.ok(exported.body.businessChanges.length >= 3);
        assert.ok(exported.body.businessAudit.length >= 1);
        assert.equal(
          exported.body.businessClaims.some((claim) => claim.claimant !== managerA._id.toString()),
          false
        );

        const beforeReviews = await Review.countDocuments({ establishment: placeB._id });
        const deleted = await jsonRequest(baseUrl, '/api/users/me', {
          token: tokens.a,
          method: 'DELETE',
        });
        assert.equal(deleted.response.status, 204);
        assert.equal(await User.exists({ _id: managerA._id }), null);
        assert.equal(await BusinessClaim.countDocuments({ claimant: managerA._id }), 0);
        assert.equal(await EstablishmentManager.countDocuments({ user: managerA._id }), 0);
        assert.equal(await EstablishmentChangeRequest.countDocuments({ requestedBy: managerA._id }), 0);
        assert.equal(await Review.countDocuments({ establishment: placeB._id }), beforeReviews);
        assert.ok(
          await EstablishmentAuditLog.exists({ actorDeleted: true, actor: { $exists: false } })
        );
      });
    } finally {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      );
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
      delete process.env.PUBLIC_SITE_URL;
    }
  }
);
