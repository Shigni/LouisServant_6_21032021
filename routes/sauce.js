const express = require('express');
const router = express.Router();

// Importation des middleware et du controller de sauce
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const stuffCtrl = require('../controllers/sauce');

// Routes pour la création, modification, supression, récupération et like
router.post('/:id/like', auth, stuffCtrl.likeSauce);
router.post('/', auth, multer, stuffCtrl.createSauce);
router.put('/:id', auth, multer, stuffCtrl.modifySauce);
router.delete('/:id', auth, stuffCtrl.deleteSauce);
router.get('/:id', auth, stuffCtrl.getOneSauce);
router.get('/', auth, stuffCtrl.getAllSauce);

module.exports = router;