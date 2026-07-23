const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  listSaved,
  saveEstablishment,
  unsaveEstablishment,
} = require('../controllers/usersController');

router.get('/me/saved', requireAuth, listSaved);
router.post('/me/saved/:id', requireAuth, saveEstablishment);
router.delete('/me/saved/:id', requireAuth, unsaveEstablishment);

module.exports = router;
