// src/routes/dashboardRoutes.js
// ----------------------------------------------------------------------------
// /api/dashboard/* — both endpoints require authentication.
// ----------------------------------------------------------------------------

const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', DashboardController.stats);
router.get('/recent', DashboardController.recent);

module.exports = router;
