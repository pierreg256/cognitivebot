var builder = require('botbuilder')
  , prompts = require('./prompts.js')
  , inspect = require('util').inspect
  , utils   = require('./conversationUtils.js')
  ;


/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model.replace(/"/g,'') || 'https://api.projectoxford.ai/luis/v1/application?id=597f02c4-0aac-47e2-a64c-790c54f43e98&subscription-key=6d0966209c6e4f6b835ce34492f3e6d9&q=';
var dialog = new builder.LuisDialog(model);

module.exports = dialog;

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.onDefault(function(session,args){
	utils.log('IdentifyWhoDialog|Default', session.message.text);
	session.send('Ok');
});

dialog.on('Yes', function(session,args){
	utils.log('IdentifyWhoDialog|Yes', session.message.text);
	session.send('Ok');
});

dialog.on('No', function(session,args){
	utils.log('IdentifyWhoDialog|No', session.message.text);
	session.send('Ok');
});

dialog.on('Bye', function(session,args){
	utils.log('IdentifyWhoDialog|Bye', session.message.text);
	session.send('Bye');
});

