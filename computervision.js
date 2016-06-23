var https = require('https')
  ;
const computerVisionAPI = "api.projectoxford.ai";
const computerVisionPath = "/vision/v1.0/analyze";
const subscriptionKey = process.env.VISION_KEY || "<YOUR_SUBSCRIPTION_KEY>";

module.exports.analyzeImage = function(attachment, session, cb){
	var imageUrl = attachment.contentUrl;

	console.log('fetching info for: ', imageUrl);

	var postData = JSON.stringify({"url":imageUrl});

	var options = {
		hostname: computerVisionAPI,
		path: computerVisionPath,
		headers: {
			"Ocp-Apim-Subscription-Key":subscriptionKey,
			"Content-Type":"application/json",
			"Content-Length": Buffer.byteLength(postData)		
		},
		method: 'POST'
	};


	var req = https.request(options, (res) => {
		//console.log('statusCode: ', res.statusCode);
		//console.log('headers: ', res.headers);

		var response='';

		res.on('data', (d) => {
			response+=d;
		});
		res.on('end', function(){
			cb(null, response);
		});
	});
	req.write(postData);
	req.end();

	req.on('error', (e) => {
		//console.error(e);
		cb(e);
	});
};