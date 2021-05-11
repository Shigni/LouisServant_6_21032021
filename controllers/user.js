// Importation du module bcrypt
const bcrypt = require('bcrypt');
// Importation du modèle de création d'utilisateur
const User = require('../models/User');
// Importation du module JWT
const jwt = require('jsonwebtoken');

var crypto = require('crypto');
var algorithm = 'aes256';
var token = process.env.TOKENEMAIL;

// Création d'un utilisateur
exports.signup = (req, res, next) => {
  
  // Hashage du mot de passe récupéré dans le formulaire d'inscription
  var cipher = crypto.createCipher(algorithm, token);
  var crypted = cipher.update(req.body.email, 'utf8', 'hex');
  crypted += cipher.final('hex');

  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      // Création d'un nouvel utilisateur dans la base de donnée
      
      const user = new User({
        // Récupération de l'adresse mail écrite dans le formulaire d'inscription
        
        email: crypted,
        // Récupération du mot de passe hashé
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// Connexion d'un utilisateur  
exports.login = (req, res, next) => {
  // Recherche de l'utilisateur dans la base de donnée via son email
  
  var cipher = crypto.createCipher(algorithm, token);
  var crypted = cipher.update(req.body.email, 'utf8', 'hex');
  crypted += cipher.final('hex');
  
  User.findOne({ email: crypted })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      // Comparaison du mot de passe hashé si présent dans la base donnée
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.TOKEN,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};