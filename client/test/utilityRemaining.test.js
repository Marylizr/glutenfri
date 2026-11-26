import test from 'node:test';
import assert from 'node:assert/strict';
import { booleanFact, decisionFacts } from '../src/utils/placeDecision.js';
import { editorialQueue, loadEditorialCatalogue } from '../src/utils/editorialQueue.js';
import { studyEvent, summarizeStudy } from '../src/utils/utilityStudy.js';
import { getOpenStatus } from '../src/utils/openingHours.js';
import { clearRefinements, filterEstablishments, parseExploreParams, serializeExploreParams } from '../src/utils/establishmentFilters.js';
import { normalizeWeeklyHours } from '../src/utils/establishmentData.js';
import { normalizeEstablishmentRecord } from '../src/utils/trustStatus.js';

test('decision facts preserve unknown, false, provenance and distinct dates', () => {
  assert.equal(booleanFact(null), 'factUnknown'); assert.equal(booleanFact(false), 'factNo'); assert.equal(booleanFact(true), 'factYes');
  const facts = decisionFacts({ informationUpdatedAt: '2026-11-26', lastPublishedUpdateAt: '2026-11-25', sourceReviewedAt: '2026-01-01' });
  assert.equal(facts.sourceReviewedAt, '2026-01-01'); assert.equal(facts.businessUpdatedAt, '2026-11-25');
  assert.equal(decisionFacts({ updatedAt: '2026-11-26' }).sourceReviewedAt, null);
  assert.equal(decisionFacts({ temporarilyClosed: true }).closed, true);
  assert.equal(normalizeEstablishmentRecord({ lastInformationUpdate: new Date().toISOString() }).confidenceLevel, 'source_pending_review');
  assert.equal(normalizeEstablishmentRecord({ confidenceLevel: 'source_verified' }).confidenceLevel, 'source_pending_review');
  assert.equal(normalizeEstablishmentRecord({ confidenceLevel: 'source_verified', sourceName: 'Synthetic source', sourceUrl: 'https://example.invalid' }).confidenceLevel, 'source_verified');
});

test('intents round-trip in a single shareable URL contract and preserve query on clear', () => {
  const items = [{ type: 'restaurant', city: 'Évora' }, { type: 'bakery', name: 'Pão', city: 'Évora' }, { type: 'pharmacy', city: 'Porto' }, { type: 'store', city: 'Évora' }, { type: 'supermarket', city: 'Évora' }];
  const state = parseExploreParams(new URLSearchParams('q=evora&intencion=shop&fuente_revisada=true'));
  assert.equal(serializeExploreParams(state).toString(), 'q=evora&intencion=shop&fuente_revisada=true');
  assert.equal(filterEstablishments(items, { ...state, sourceVerifiedOnly: false }).length, 2);
  assert.equal(filterEstablishments(items, { query: 'pao' }).length, 1);
  assert.equal(filterEstablishments(items, { intent: 'eat' }).length, 1);
  assert.equal(filterEstablishments(items, { intent: 'bakery' }).length, 1);
  const cleared = clearRefinements(state); assert.equal(cleared.query, 'evora'); assert.equal(cleared.intent, undefined); assert.equal(cleared.sourceVerifiedOnly, false);
  assert.equal(parseExploreParams(new URLSearchParams('intencion=__proto__')).intent, undefined);
});

test('opening hours respect special closures, partial days, Azores, midnight and malformed intervals', () => {
  const place = { timezone: 'Atlantic/Azores', weeklyHours: { sun: [], mon: [{ start: '22:00', end: '02:00' }], tue: [] } };
  assert.equal(getOpenStatus(place, new Date('2026-01-06T02:00:00Z')).status, 'open');
  assert.equal(getOpenStatus(place, new Date('2026-01-06T04:00:00Z')).status, 'closed');
  assert.equal(getOpenStatus({ ...place, specialHours: [{ date: '2026-01-06', closed: true }] }, new Date('2026-01-06T02:00:00Z')).status, 'closed');
  assert.equal(getOpenStatus({ ...place, weeklyHours: { tue: [] } }, new Date('2026-01-06T04:00:00Z')).status, 'unavailable');
  assert.equal(getOpenStatus({ timezone: 'Europe/Lisbon', specialHours: [{ date: '2026-12-25', intervals: [{ start: '10:00', end: '12:00' }] }] }, new Date('2026-12-25T11:00:00Z')).status, 'open');
  assert.equal(getOpenStatus({ ...place, weeklyHours: { mon: [], tue: [{ start: 'bad', end: '12:00' }] } }, new Date('2026-01-06T10:00:00Z')).status, 'unavailable');
  assert.deepEqual(normalizeWeeklyHours({ tue: [] }), { tue: [] });
  assert.equal(getOpenStatus({ ...place, temporarilyClosed: true }, new Date('2026-01-06T02:00:00Z')).status, 'unavailable');
  const spring = { timezone: 'Europe/Lisbon', weeklyHours: { sat: [], sun: [{ start: '01:30', end: '03:00' }] } };
  assert.equal(getOpenStatus(spring, new Date('2026-03-29T01:45:00Z')).status, 'open');
  assert.equal(getOpenStatus(spring, new Date('2026-03-29T02:30:00Z')).status, 'closed');
  const autumn = { timezone: 'Europe/Lisbon', weeklyHours: { sat: [], sun: [{ start: '01:00', end: '02:00' }] } };
  assert.equal(getOpenStatus(autumn, new Date('2026-10-25T00:30:00Z')).status, 'open');
  assert.equal(getOpenStatus(autumn, new Date('2026-10-25T01:30:00Z')).status, 'open');
});

test('editorial queue is evidence-driven, stable and never changes organic records', () => {
  const places = [{ _id: 'a', name: 'A' }, { _id: 'b', name: 'B', sourceReviewedAt: '2026-11-25', nextReviewDueAt: '2026-11-20' }];
  const before = structuredClone(places);
  const queue = editorialQueue(places, [{ establishment: { _id: 'b' }, status: 'pending' }], new Date('2026-11-26'));
  assert.equal(queue[0].place._id, 'b'); assert.ok(queue[0].issues.includes('qualityReports')); assert.ok(queue[0].issues.includes('qualityOverdue'));
  assert.deepEqual(places, before);
});

test('study events drop personal and free text; no fabricated outcomes for an empty study', () => {
  assert.deepEqual(studyEvent('results', { results: 'many', query: 'private', email: 'private', lat: 1, placeId: 'private' }), { type: 'results', results: 'many' });
  assert.equal(studyEvent('unknown'), null);
  assert.ok(summarizeStudy().every((row) => row.attempts === 0 && row.medianSeconds === null));
  const rows = summarizeStudy([{ task: 'city', success: true, understoodSource: false, seconds: 5 }, { task: 'city', success: false, understoodSource: true, seconds: 15 }]);
  assert.deepEqual(rows[0], { task: 'city', attempts: 2, success: 1, understoodSource: 1, medianSeconds: 10 });
});

test('editorial catalogue loads every bounded page and refuses silent truncation', async () => {
  const called = [];
  const records = await loadEditorialCatalogue(async ({ page }) => { called.push(page); return { data: [{ _id: String(page) }], totalPages: 3 }; });
  assert.equal(records.length, 3); assert.deepEqual(called, [1, 2, 3]);
  await assert.rejects(loadEditorialCatalogue(async () => ({ data: [], totalPages: 21 })), TypeError);
  await assert.rejects(loadEditorialCatalogue(async () => ({ data: null, totalPages: 1 })), TypeError);
});
