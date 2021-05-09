// Importation du model Sauce et du module fs
const Sauce = require('../models/Sauce');
const fs = require('fs');

// Créer une sauce
exports.createSauce = (req, res, next) => {
  // Récupération des informations du formulaire de création de sauce
  const sauceObject = JSON.parse(req.body.sauce);
  // Ajout des valeurs like et dislike par défaut = 0
  sauceObject.likes = 0;
  sauceObject.dislikes = 0;
  // Suppression de l'ID car généré automatiquement par MongoDB
  delete sauceObject._id;
  // Création dans la base de donnée de la sauce avec l'image associée au sauceObject
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  // Supression de l'ancienne image si modifée
  var file = req.file;
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      if (file && filename != file.filename) {
        fs.unlink(`images/${filename}`, () => {
        });
      }
    })
  // Recherche de l'image associée
  const sauceObject = req.file ?
    {
      // Récupération des informations de la sauce sélectionnée
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  // Mise à jour de la sauce
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })

    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    .catch(error => res.status(400).json({ error }));
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  // Recherche de la sauce grâce par ID
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // Suppression de l'image associée dans la base de donnée
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        // Suppression de la sauce dans la base de donnée
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};
 
// Affichage d'une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// Affichage de toutes les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

// Like et dislike d'une sauce
exports.likeSauce = (req, res, next) => {

  const userId = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;

  // Recherche de la sauce sélectionnée
  Sauce.findOne({ _id: sauceId })
    .then(sauce => {

      let usersLiked = sauce.usersLiked;
      let likes = sauce.likes;
      let usersDisliked = sauce.usersDisliked;
      let dislikes = sauce.dislikes;

      // Ajout d'un like
      if (like == 1) {
        if (!usersLiked.includes(userId)) {
          usersLiked.push(userId);
          likes++;
        }
        // Ajout d'un dislike
      } else if (like == -1) {
        if (!usersDisliked.includes(userId)) {
          usersDisliked.push(userId);
          dislikes++;
        }
        // Supression d'un like ou dislike
      } else if (like == 0) {
        if (usersLiked.includes(userId)) {
          var index = usersLiked.indexOf(userId);
          usersLiked.splice(index, 1);
          likes--;
        }
        if (usersDisliked.includes(userId)) {
          var index = usersDisliked.indexOf(userId);
          usersDisliked.splice(index, 1);
          dislikes--;
        }
      }
      // Mise à jour des champs nécessaires pour les likes et dislike
      Sauce.updateOne({ _id: sauceId },
        { dislikes: dislikes, usersDisliked: usersDisliked, likes: likes, usersLiked: usersLiked }
      )
        .then(() => res.status(200).json({ message: "L'utilisateur a mis un like ! " }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
}