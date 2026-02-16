const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/searchController');

router.get('/jobs', ctrl.searchJobs);
router.get('/suggest', ctrl.suggest);
router.get('/trending', ctrl.trending);

module.exports = router;
