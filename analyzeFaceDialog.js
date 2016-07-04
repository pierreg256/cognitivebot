var builder = require('botbuilder')
  , prompts = require('./prompts.js')
  , inspect = require('util').inspect
  , utils   = require('./conversationUtils.js')
  ;


/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=597f02c4-0aac-47e2-a64c-790c54f43e98&subscription-key=6d0966209c6e4f6b835ce34492f3e6d9&q=';
var model = model.replace(/"/g,'') ;
var dialog = new builder.LuisDialog(model);

module.exports = dialog;

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.onDefault(function(session,args){
	utils.log('AnalyzeFaceDialog|Default', session.message.text);
	utils.log('AnalyzeFaceDialog|Default', inspect(utils.getValue(session, 'faces')));

	session.send("Sorry, I didn't get what you asked for...");
	session.endDialog();
});

dialog.on('Yes', function(session,args){
	utils.log('AnalyzeFaceDialog|Yes', session.message.text);
	var faceId = utils.getValue(session, 'faceId');
	var faces = utils.getValue(session, "faces");
	var gender = faces[faceId].gender;
	var age = faces[faceId].age;

	if ((utils.getValue(session, 'targetGender') != undefined)
	&&(utils.getValue(session, 'targetAge')===undefined)) {
		utils.setValue(session, 'targetAge', age);
		session.send('Are you '+age+' years old?');
	} else {
	if ((utils.getValue(session, 'targetGender') != undefined)
	&& (utils.getValue(session, 'targetAge') != undefined)) {
			session.send('I did it!');
			session.endDialog();
		}
	}
	//session.send('Ok');
});

dialog.on('No', function(session,args){
	utils.log('AnalyzeFaceDialog|No', session.message.text);
	var faceId = utils.getValue(session, 'faceId');
	var faces = utils.getValue(session, "faces");
	var gender = faces[faceId].gender;
	var age = faces[faceId].age;

	if ((utils.getValue(session, 'targetGender') != undefined)
	&&(utils.getValue(session, 'targetAge')===undefined)) {
		utils.setValue(session, 'targetGender', (gender=='Male'?'Female':'Male'));
		utils.setValue(session, 'targetAge', age);
		session.send("Okay... I get it, you're a "+(gender=='Male'?'Female':'Male')+".\nAre you "+age+" years old?");
	} else {
		if ((utils.getValue(session, 'targetGender') != undefined)
		&& (utils.getValue(session, 'targetAge') != undefined)) {
			utils.log("AnalyzeFaceDialog|No", inspect(args));
			var found = false;
			var foundAge = -1;
			args.entities.forEach(function(entity){
				if ((found==false)&&(entity.type == "builtin.number")) {
					found = true;
					foundAge = Number(entity.entity);
				}
			});
			if (found) {
				utils.setValue(session, 'targetAge', foundAge);
				session.send("OK. So you're "+foundAge+" years old ?");
			} else {
				session.send("I'm sorry I wasn't able to guess your age... \nCan you please tell me how old you are ?");
			}
		}
	}
});

dialog.on('Bye', function(session,args){
	utils.log('AnalyzeFaceDialog|Bye', session.message.text);
	session.send("Bye! It's been a pleasure to chat with you. See you later...");
	session.endDialog();
});

