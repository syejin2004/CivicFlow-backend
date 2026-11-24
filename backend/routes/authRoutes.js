const express = require('express');
const router = express.Router();
const { register, login, getUsers } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

router.post('/register', register);
router.post('/login', login);
router.get('/users', auth, checkRole(['ADMIN']), getUsers);

module.exports = router;