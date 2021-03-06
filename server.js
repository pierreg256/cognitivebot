var restify = require('restify')
  , builder = require('botbuilder')
  , dialog  = require('./dialog.js')
  , identifyWhoDialog = require('./identifyWhoDialog.js')
  , analyzeFaceDialog = require('./analyzeFaceDialog.js')
  ;

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: process.env.BOT_ID, appSecret: process.env.BOT_SECRET });
/*bot.add('/', function (session) {
    session.send('Hello World');
});
*/
bot.add('/', dialog)
bot.add('/identifyWho/', identifyWhoDialog)
bot.add('/analyzeFace/', analyzeFaceDialog)
// Setup Restify Server


var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': './home/',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});