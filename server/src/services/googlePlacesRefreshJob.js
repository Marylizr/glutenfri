const Establishment = require('../models/Establishment');
const { getPlaceLocation } = require('./googlePlaces');

const REFRESH_AFTER_MS = 23 * 24 * 60 * 60 * 1000;
const state = {
  status: 'idle',
  startedAt: null,
  finishedAt: null,
  total: 0,
  updated: 0,
  errors: 0,
  lastError: null,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getRefreshJobState() {
  return { ...state };
}

function startGooglePlacesRefresh() {
  if (state.status === 'running') return false;

  Object.assign(state, {
    status: 'running',
    startedAt: new Date(),
    finishedAt: null,
    total: 0,
    updated: 0,
    errors: 0,
    lastError: null,
  });

  void runRefresh();
  return true;
}

async function runRefresh() {
  try {
    const cutoff = new Date(Date.now() - REFRESH_AFTER_MS);
    const stale = await Establishment.find({
      placeId: { $exists: true, $ne: null },
      $or: [
        { googlePlaceRefreshedAt: { $lt: cutoff } },
        { googlePlaceRefreshedAt: { $exists: false } },
      ],
    });
    state.total = stale.length;

    for (const establishment of stale) {
      try {
        const location = await getPlaceLocation(establishment.placeId);
        if (location) {
          establishment.lat = location.latitude;
          establishment.lng = location.longitude;
        }
        establishment.googlePlaceRefreshedAt = new Date();
        await establishment.save();
        state.updated += 1;
      } catch (error) {
        state.errors += 1;
        state.lastError = error.message;
      }
      await sleep(200);
    }
    state.status = state.errors > 0 ? 'completed_with_errors' : 'completed';
  } catch (error) {
    state.status = 'failed';
    state.lastError = error.message;
  } finally {
    state.finishedAt = new Date();
  }
}

module.exports = { getRefreshJobState, startGooglePlacesRefresh };
