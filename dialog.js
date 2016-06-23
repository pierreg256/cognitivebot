var builder = require('botbuilder')
  , prompts = require('./prompts.js')
  , computerVision = require('./computervision.js')
  , inspect = require('util').inspect
  ;


/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model.replace(/"/g,'') || 'https://api.projectoxford.ai/luis/v1/application?id=597f02c4-0aac-47e2-a64c-790c54f43e98&subscription-key=6d0966209c6e4f6b835ce34492f3e6d9&q=';
var dialog = new builder.LuisDialog(model);

module.exports = dialog;

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.onDefault(function(session,args){
	var imageUrl = session.message.text.match(/https?:\/\/[A-Za-z0-9-%_\/.&?=]+/);
console.log("imageUrl:", imageUrl);
	if (session.message.attachments && (session.message.attachments.length>0)) {
		console.log('Trying ton analyze the image located at: ', session.message.attachments[0].contentUrl);
		analyzeImage(session, session.message.attachments[0].contentUrl);
	} else {
		session.send(prompts.misunderstood);
	}
});

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.on('Greet', builder.DialogAction.send(prompts.demandePhoto));

dialog.on('Yes', function(session, args){
	//session.userData.save('clef', 'valeur');
	console.log(inspect(session.userData, {depth:5}));
	if (session.userData && session.userData.computerVisionResult) {
		var faces = session.userData.computerVisionResult.faces;

		switch (faces.length) {
			case 0:
				session.send('Moi aussi :-)');
				session.send('<AJOUTER UNE DESCRIPTION DE L\'IMAGE>');
				break;
			case 1:
				if (faces[0].Gender == 'Male') {
					session.send('Etes vous un homme ?')
				} else {
					session.send('Etes vous une femme ?')
				}
				break;
			default:
				session.send('Il y a '+countMales(faces)+' hommes, et '+countFemales(faces)+'femmes sur cette image.');
		}
	} else {
		session.send('Je ne sais pas quoi vous répondre...');
	}
});

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.on('Help', function(session, args){
	var imageUrl = session.message.text.match(/https?:\/\/[A-Za-z0-9-%_\/.&?=]+/);
	if (imageUrl) {
		imageUrl = imageUrl[0].replace(/ /g, '%20');
		console.log('Trying ton analyze the image located at: ', imageUrl);
		analyzeImage(session, imageUrl);
	} else {
		session.send(prompts.helpMessage)
	}

	
});

///////////////////// Dialog general functions ////////////////////////////
function analyzeImage(session, imageUrl) {
	computerVision.analyzeImage(imageUrl, session, function(err, data){
		session.send(prompts.thanks);
		console.log('getting results from computerVision');
		if (err) {
			session.send(prompts.apiProblems);
		} else {
			session.userData.computerVisionResult = data;
			var faces = session.userData.computerVisionResult.faces

			switch(faces.length) {
				case 0:
					session.send(prompts.doYouLikeIt)
					break;
				case 1:
					session.send(prompts.areYouTheOne)
					break;
				default:
					session.send(prompts.areYouOneOf)
			} 
		}
	});
}

function countMales(faces) {
	var result=0
	faces.forEach(function(face){
		if (face.gender == 'Male')
			result++
	});
	return result;
}

function countFemales(faces) {
	return faces.length - countMales(faces);
}