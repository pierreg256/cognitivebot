var builder = require('botbuilder')
  , prompts = require('./prompts.js')
  , computerVision = require('./computervision.js')
  , inspect = require('util').inspect
  , utils = require('./conversationUtils.js')
  ;


/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=597f02c4-0aac-47e2-a64c-790c54f43e98&subscription-key=6d0966209c6e4f6b835ce34492f3e6d9&q=';
var model = model.replace(/"/g,'') ;
var dialog = new builder.LuisDialog(model);

module.exports = dialog;

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.onDefault(function(session, args, next){
	utils.log('onDefault', session.message.text);
	var imageUrl = session.message.text.match(/https?:\/\/[A-Za-z0-9-%_\/.&?=]+/);
	if (imageUrl) {
		analyzeImage(session, imageUrl[0]);
	} else {
		if (session.message.attachments && (session.message.attachments.length>0)) {
			console.log('Trying to analyze the image located at: ', session.message.attachments[0].contentUrl);
			analyzeImage(session, session.message.attachments[0].contentUrl);
		} else {
			session.send(prompts.misunderstood);
		}
	}

});

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.on('Greet', function(session, args, next){
	utils.log('Greet', session.message.text);
	session.send(prompts.demandePhoto);
});

dialog.on('Yes', function(session, args){
	utils.log('Yes', session.message.text);
	//session.userData.save('clef', 'valeur');
	//console.log(inspect(session.userData, {depth:5}));
	var faces, desc;
	if (faces = utils.getValue(session, "faces")) {

		switch (faces.length) {
			case 0:
				if (utils.getValue(session, "targetType")) {
					session.send('That was a nice picture! Would you like to try another one ? Maybe with some faces ?');
					utils.clearData(session);
				} else {
					if ((desc = utils.getValue(session, "description")) && (desc.captions.length>0))
						session.send('Me too... \nIt makes me think of '+desc.captions[0].text);
					else
						session.send('Me too...');
					utils.setValue(session, "targetType", 'Landscape');
				}
				break;
			case 1:
				utils.log('targetGender:', utils.getValue(session, 'targetGender'));
				utils.log('faceId:', utils.getValue(session, 'faceId'));
				if ((utils.getValue(session, 'targetGender')!=undefined) && (utils.getValue(session, 'faceId')!=undefined))
					session.beginDialog('/analyzeFace/');
				else {
					utils.setValue(session, "faceId", 0);
					if (faces[0].gender == 'Male') {
						utils.setValue(session, 'targetGender', 'Male');
						session.send('Are you a man ?')
					} else {
						utils.setValue(session, 'targetGender', 'Female');
						session.send('Are you a woman ?')
					}
				}
				break;
			default:
				var m = utils.countMales(session);
				var f = utils.countFemales(session);
				session.send('I can see '+session.ngettext('%d man', '%d men', m)+', and '+session.ngettext('%d woman', '%d women', f)+' on this picture.');
				if (m>0 && f>0 && m<=f)
                   	session.send("Are you a man ?");
                if (m>0 && f>0 && f<m)
                    session.send("Are you a woman ?");
                if (f == 0) {
					utils.setValue(session, 'targetGender', 'Male');
                    session.send("Are you the eldest man ?");
                }
                if (m == 0){
					utils.setValue(session, 'targetGender', 'Female');
                    session.send("Are you the eldest woman ?");
                }
                session.beginDialog('/identifyWho/');
		}
	} else {
		session.send("I just don't know what to answer... Sorry!");
	}
});

dialog.on('No', function(session, args){
	utils.log('No', session.message.text);
	var imageUrl = session.message.text.match(/https?:\/\/[A-Za-z0-9-%_\/.&?=]+/);
	if (imageUrl) {
		analyzeImage(session, imageUrl[0]);
	} else {

		var faces;
		if (faces = utils.getValue(session, "faces")) {
			switch (faces.length) {
				case 1:
					if ((utils.getValue(session, 'targetGender')!=undefined) && (utils.getValue(session, 'faceId')!=undefined))
						session.beginDialog('/analyzeFace/');
					else {
						if ((desc = utils.getValue(session, "description")) && (desc.captions.length>0)) {
							session.send('Let just describe this picture then... It makes me think of '+desc.captions[0].text);
							utils.setValue(session, "targetType", 'Landscape');
						} else {
							session.send("Something went wrong... I'd like to start over, if you don't mind...");
						}						
					}
					break;
				default:
						if ((desc = utils.getValue(session, "description")) && (desc.captions.length>0)) {
							session.send('Let just describe this picture then... It makes me think of '+desc.captions[0].text);
							utils.setValue(session, "targetType", 'Landscape');
						} else {
							session.send("Something went wrong... I'd like to start over, if you don't mind...");
						}

			}
		} else {
			session.send(prompts.misunderstood);
		}
	}
});

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.on('Help', function(session, args){
	utils.log('Help', session.message.text);
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
	utils.clearData(session);
	computerVision.analyzeImage(imageUrl, session, function(err, data){
		//session.send(prompts.thanks);
		console.log('getting results from computerVision');
		if (err) {
			console.log('error from computerVision api');
			session.send(prompts.apiProblems);
		} else {
			//console.log('got an answer', data);
			if (data && data.faces) {
				//session.userData.computerVisionResult = data;
				var faces = utils.setValue(session, "faces", data.faces);
				utils.setValue(session, 'description', data.description);
				switch(faces.length) {
					case 0:
						session.send(prompts.thanks+'\n'+prompts.doYouLikeIt)
						break;
					case 1:
						session.send(prompts.thanks+'\n'+prompts.areYouTheOne)
						break;
					default:
						session.send(prompts.thanks+'\n'+prompts.areYouOneOf)
				} 
			} else {
				session.send(prompts.apiProblems);
			}
		}
	});
}

