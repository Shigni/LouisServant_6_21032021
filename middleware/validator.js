const passwordSchema = require('../models/password');

module.exports = (req, res, next) => {
    const passwordTrue = /[§!@#$%^&*().?{}|<>]/;
	const passwordFalse = /[='":]/;
	if (
		!passwordSchema.validate(req.body.password) ||
		!passwordTrue.test(req.body.password) ||
		passwordFalse.test(req.body.password)
	) {
		res.writeHead(
			400,
			'{"message":"Mot de passe requis : 8 caractères minimun. Au moins 1 majuscule, 1 minuscule, 1 chiffre , un caractère spécial et sans espaces !"}',
			{
				'content-type': 'application/json',
			},
		);
		res.end('Format de mot de passe incorrect !');
	} else {
		next();
	}
};