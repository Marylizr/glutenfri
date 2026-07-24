const Establishment = require('../models/Establishment');
const SystemJob = require('../models/SystemJob');
const { getPlaceLocation } = require('./googlePlaces');

const JOB_KEY = 'google-places-refresh';
const REFRESH_AFTER_MS = 23 * 24 * 60 * 60 * 1000;
const RUNNING_TIMEOUT_MS = 20 * 60 * 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function idleState() {
  return {
    status: 'idle',
    startedAt: null,
    finishedAt: null,
    total: 0,
    updated: 0,
    errors: 0,
    lastError: null,
  };
}

async function getRefreshJobState() {
  const job = await SystemJob.findOne({ key: JOB_KEY }).lean();
  if (!job) return idleState();
  return {
    status: job.status,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    total: job.total,
    updated: job.updated,
    errors: job.errorCount,
    lastError: job.lastError,
  };
}

async function claimGooglePlacesRefresh() {
  const staleBefore = new Date(Date.now() - RUNNING_TIMEOUT_MS);
  const initialState = {
    status: 'running',
    startedAt: new Date(),
    finishedAt: null,
    total: 0,
    updated: 0,
    errorCount: 0,
    lastError: null,
  };
  const claimed = await SystemJob.findOneAndUpdate(
    {
      key: JOB_KEY,
      $or: [
        { status: { $ne: 'running' } },
        { startedAt: { $lt: staleBefore } },
        { startedAt: null },
      ],
    },
    { $set: initialState },
    { new: true, runValidators: true }
  );
  if (claimed) return true;

  try {
    await SystemJob.create({
      key: JOB_KEY,
      ...initialState,
    });
    return true;
  } catch (error) {
    if (error?.code === 11000) return false;
    throw error;
  }
}

async function markRefreshFailed(error) {
  await SystemJob.findOneAndUpdate(
    { key: JOB_KEY },
    {
      $set: {
        status: 'failed',
        finishedAt: new Date(),
        lastError: error?.message || String(error),
      },
    },
    { upsert: true }
  );
}

async function runGooglePlacesRefresh() {
  try {
    const cutoff = new Date(Date.now() - REFRESH_AFTER_MS);
    const stale = await Establishment.find({
      placeId: { $exists: true, $ne: null },
      $or: [
        { googlePlaceRefreshedAt: { $lt: cutoff } },
        { googlePlaceRefreshedAt: { $exists: false } },
      ],
    });
    await SystemJob.updateOne({ key: JOB_KEY }, { $set: { total: stale.length } });

    let updated = 0;
    let errors = 0;
    let lastError = null;

    for (const establishment of stale) {
      try {
        const location = await getPlaceLocation(establishment.placeId);
        if (location) {
          establishment.lat = location.latitude;
          establishment.lng = location.longitude;
        }
        establishment.googlePlaceRefreshedAt = new Date();
        await establishment.save();
        updated += 1;
      } catch (error) {
        errors += 1;
        lastError = error.message;
      }
      await SystemJob.updateOne(
        { key: JOB_KEY },
        { $set: { updated, errorCount: errors, lastError } }
      );
      await sleep(200);
    }

    await SystemJob.updateOne(
      { key: JOB_KEY },
      {
        $set: {
          status: errors > 0 ? 'completed_with_errors' : 'completed',
          finishedAt: new Date(),
          updated,
          errorCount: errors,
          lastError,
        },
      }
    );
  } catch (error) {
    await markRefreshFailed(error);
    throw error;
  }
}

async function startGooglePlacesRefresh() {
  const claimed = await claimGooglePlacesRefresh();
  if (!claimed) return false;
  void runGooglePlacesRefresh();
  return true;
}

module.exports = {
  getRefreshJobState,
  claimGooglePlacesRefresh,
  markRefreshFailed,
  runGooglePlacesRefresh,
  startGooglePlacesRefresh,
};
