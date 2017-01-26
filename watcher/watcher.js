// Require
var watchr = require('watchr');
var exec = require('child_process').exec;
var child;
var trigger = false;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:8321');
var validator = require('validator');
var last = '';

// Watch a file
console.log('Watch our paths');
watchr.watch({
    paths: ['/var/log/auth.log'],
    listeners: {
        error: function(err){
            console.error('An error occured:', err);
        },
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
            console.log('A change event occured:');
            trigger = true;
        }
    },
    next: function(err,watchers){
        if (err) {
            return console.log('\nwatching everything failed with error', err);
        } else {
            console.log('\nwatching everything completed');
        }
    }
});

var grabChanges = function (callback) {
    child = exec('tail -n 10 /var/log/auth.log', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }

        filter(stdout, callback);
    });
}

var filter = function(content, callback) {
    var lines = content.split('\n');

    for (idx in lines) {
        var line = lines[idx];
	var line_sections = line.split(']: ');
	if (line_sections.length == 2) {
	    line = line_sections[1];
	    if (line === last) {
		continue;
	    }
	    if (line.indexOf('Accepted password ') > -1) {
		var result = containsUnknownIP(line);
		if (result) {
		    sendNotification('Accepted connection from ' + result);
		}
	    }
	}
    }
}

var containsUnknownIP = function(line) {
    var parts = line.split(' ');
    for (idx in parts) {
	if (validator.isIP(parts[idx])) {
	    var ip_sections = parts[idx].split('.');
	    if (ip_sections[0] !== '192' || ip_sections[1] !== '168') {
	    	last = line;
		return parts[idx];
	    }
	}
    }
    return null;
}

var sendNotification = function(content) {
    var data = {};
    data['title'] = 'SSH';
    data['message'] = content;
    socket.emit('push',data);
}

setInterval(function() {
    if (trigger === true) {
        trigger = false;
	grabChanges(function(){});
    }
}, 5000);
