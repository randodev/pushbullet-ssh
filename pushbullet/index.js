var PushBullet = require('./lib/pushbullet.js');
var pusher = new PushBullet('o.1uJqUji4ieSq8ofm3leplaEq261Oscpr');
var io = require('socket.io').listen(8321);

io.on('connection', function(socket) {
	socket.on('push', function (data) {
		pushNotification(data['title'], data['message']);
	});
});

// All devices that need pushing
exports.devices = {};

// Filter devices using own rules
var devicesFilter = function (devicesList) {
	exports.devices = devicesList;
}

// Get all devices when running the script
pusher.devices(function(error, response) {
    	if (error) {
		console.error('Pushbullet API returned an error while grabbing devices \n', error);
		return;
	}

	if (!response.hasOwnProperty('devices')) {
		console.error('Pushbullet API returned response in an unknown format \n', error);
		return;
	}

	devices = devicesFilter(response['devices']);
});

// Push a notification to all devices in the list
var pushNotification = function(title, body) {
	for (index in exports.devices) {
		var device = exports.devices[index];
		if (!device.hasOwnProperty('iden')) {
			console.error('Device has no iden');
			continue;
		}
		if (device['type'] !== 'ios') {
			continue;
		}
		pusher.note(device['iden'], title, body, function(error, response) {
			if (error) {
				console.error('Pushbullet API returned an error when pushing \n', error);
				return;
			}
			console.log ('Pushed notification : ' + title);
		});
	}
}
