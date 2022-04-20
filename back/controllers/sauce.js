const Sauce = require("../models/sauce");
const fs = require('fs');

//Ajouuter une nouvelle sauce
exports.createSauce = (req, res, next) => {

	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	const sauce = new Sauce({
		...sauceObject,
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
	});
	sauce.save()
		.then(() => res.status(201).json({ message: 'Objet enregistré !' }))
		.catch(error => res.status(400).json({ error }));
};
//Afficher toute les sauces
exports.getAllSauce = (req, res, next) => {
	Sauce.find().then(
		(sauce) => {
			res.status(200).json(sauce);
		}
	).catch(
		(error) => {
			res.status(400).json({
				error: error
			});
		}
	);
};

//Afficher une sauce grace a son id
exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({
		_id: req.params.id,
	})
		.then((sauce) => {
			res.status(200).json(sauce);
		})
		.catch((error) => {
			res.status(404).json({
				error: error,
			});
		});
};

//Modification d'une sauce
exports.modifySauce = (req, res, next) => {
	const sauceObject = req.file ?
		{
			...JSON.parse(req.body.sauce),
			imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
		} : { ...req.body };
	Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
		.then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
		.catch(error => res.status(400).json({ error }));
};

//Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => {
			const filename = sauce.imageUrl.split('/images/')[1];
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: req.params.id })
					.then(() => res.status(200).json({ message: 'Sauce supprimée!' }))
					.catch(error => res.status(400).json({ error }));
			});
		})
		.catch(error => res.status(500).json({ error }));
};


//Ajouter un Like ou un dislike.
exports.likeDislikeSauce = (req, res, next) => {
	const like = req.body.like;

	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			// Si l'utilisateur like une sauce
			if (like === 1) { 
				Sauce.updateOne(
					{ _id: req.params.id },
					{
						$push: { usersLiked: req.body.userId }, //inscrire l'utilisateur dans le tableau des likes 
						$inc: { likes: +1 },// incrementer le compteur de like
					}
				)
					.then(() => res.status(200).json({ message: 'You like this sauce' }))
					.catch(error => res.status(400).json({ error }))
			} else if (like === -1) { // Si l'utilisateur dislike une sauce
				Sauce.updateOne(
					{ _id: req.params.id },
					{
						$push: { usersDisliked: req.body.userId },
						$inc: { dislikes: +1 },
					}
				)
					.then(() => res.status(200).json({ message: 'You don\'t like this sauce' }))
					.catch(error => res.status(400).json({ error }))

			} else {   
				// Si l'utilisateur retire son like
				if (sauce.usersLiked.indexOf(req.body.userId) !== -1) { 
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							$pull: { usersLiked: req.body.userId },// retirer l'utilisateur du tableau likes
							$inc: { likes: -1 },// decremente le compteur de like
						}
					)
						.then(() => res.status(200).json({ message: 'You dont like this sauce anymore ' }))
						.catch(error => res.status(400).json({ error }))
				}
				// Si l'utilisateur retire son dislike
				else if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							$pull: { usersDisliked: req.body.userId },
							$inc: { dislikes: -1 },
						}
					)
						.then(() => res.status(200).json({ message: 'You might like this sauce now ' }))
						.catch(error => res.status(400).json({ error }))
				}

			}
		})
		.catch(error => res.status(400).json({ error }))

};



