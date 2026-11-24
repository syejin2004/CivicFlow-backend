const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { classifyComplaint, confirmClassify } = require('../controllers/classifyController');

router.post('/:id/classify', auth, checkRole(['OFFICER', 'ADMIN']), classifyComplaint);
router.patch('/:id/confirm', auth, checkRole(['OFFICER', 'ADMIN']), confirmClassify);

module.exports = router;