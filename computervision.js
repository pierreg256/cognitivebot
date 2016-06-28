var https = require('https')
  , backoff = require('backoff')
  ;
const computerVisionAPI = "api.projectoxford.ai";
const computerVisionPath = "/vision/v1.0/analyze?visualFeatures=Categories,Description,Faces";
const subscriptionKey = process.env.VISION_KEY || "<YOUR_SUBSCRIPTION_KEY>";

module.exports.analyzeImage = function(attachment, session, cb){
	var imageUrl = attachment;

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

	console.log('fetching info for: ', imageUrl);

	var fibonacciBackoff = backoff.fibonacci({
	    randomisationFactor: 0,
	    initialDelay: 100,
	    maxDelay: 3000
	});

	fibonacciBackoff.failAfter(10);

	fibonacciBackoff.on('backoff', function(number, delay) {
	    // Do something when backoff starts, e.g. show to the
	    // user the delay before next reconnection attempt.
	    console.log('Connection try #'+number + ', next try in ' + delay + 'ms');
	});

	fibonacciBackoff.on('ready', function(number, delay) {
	    // Do something when backoff ends, e.g. retry a failed
	    // operation (DNS lookup, API call, etc.). If it fails
	    // again then backoff, otherwise reset the backoff
	    // instance.
	    console.log('trying connection to computer vision services...');
		var req = https.request(options, (res) => {
			//console.log('statusCode: ', res.statusCode);
			//console.log('headers: ', res.headers);

			var response='';

			res.on('data', (d) => {
				response+=d;
			});
			res.on('end', function(){
				cb(null, JSON.parse(response));
			});
		});
		req.write(postData);
		req.end();

		req.on('error', (e) => {
			console.error(e);
		    fibonacciBackoff.backoff();
			//cb(e);
		});

	});

	fibonacciBackoff.on('fail', function() {
	    // Do something when the maximum number of backoffs is
	    // reached, e.g. ask the user to check its connection.
	    console.log('failed connecting to computer vision API');
	    cb({message:'failed connecting to computer vision API'});
	});

	fibonacciBackoff.backoff();



};