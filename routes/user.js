const express = require('express');
const router = express.Router();

// Importation du controller user
const userCtrl = require('../controllers/user');

// Routes pour l'inscription et la connexion
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;