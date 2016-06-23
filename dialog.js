var builder = require('botbuilder')
  , prompts = require('./prompts.js')
  , computerVision = require('./computervision.js');


/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model.replace(/"/g,'') || 'https://api.projectoxford.ai/luis/v1/application?id=597f02c4-0aac-47e2-a64c-790c54f43e98&subscription-key=6d0966209c6e4f6b835ce34492f3e6d9&q=';
var dialog = new builder.LuisDialog(model);

module.exports = dialog;

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.onDefault(function(session,args){
	if (session.message.attachments && (session.message.attachments.length>0)) {
		console.log('Trying ton analyze the image located at: ', session.message.attachments[0].contentUrl);
		computerVision.analyzeImage(session.message.attachments[0], session, function(err, data){
			console.log('getting results from computerVision');
			if (err) {
				session.send(prompts.apiProblems);
			} else {
				session.send(prompts.thanks);
				console.log(data);
				session.send(data);
			}
		});
	} else {
		session.send(prompts.misunderstood);
	}
});

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.on('Greet', builder.DialogAction.send(prompts.demandePhoto));

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.on('Help', builder.DialogAction.send(prompts.helpMessage));

