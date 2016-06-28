var inspect = require('util').inspect
  ;


module.exports.getValue = function(session, key) {
	if (session.perUserInConversationData)
		return session.perUserInConversationData[key];
	else
		return undefined;
};

module.exports.setValue = function(session, key, value) {
	if (session.perUserInConversationData) {
		session.perUserInConversationData[key] = value;
		return module.exports.getValue(session, key);
	}
	return undefined;
};

module.exports.clearData = function(session) {
	console.log("Clearing session data");
	[
		"faces",
		"description",
		"targetType",
		"targetGender",
		"targetAge"
	].forEach(function(key){
		module.exports.setValue(session, key, undefined);
	});
};

module.exports.countMales = function(session) {
	var result=0
	var faces = module.exports.getValue(session, "faces");
	if (!faces)
		return -1;

	faces.forEach(function(face){
		if (face.gender == 'Male')
			result++
	});
	return result;

}

module.exports.countFemales = function(session) {
	var result=0
	var faces = module.exports.getValue(session, "faces");
	if (!faces)
		return -1;

	faces.forEach(function(face){
		if (face.gender == 'Female')
			result++
	});
	return result;
}

module.exports.log = function(context, message) {
	console.log((new Date()).toISOString() + ' - ' + context + ' - ' + message);
}