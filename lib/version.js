var version = require('version');
var compareVersion = require('compare-version');
var printer = require('./../lib/printer.js');
var packageJson = require('./../package.json');

exports.check = function() {
    fetchRemoteVersion(function(remoteVersion) {
 	    var localVersion = packageJson.version;

 	    var result = compareVersion(localVersion, remoteVersion);
 	    if (result == 0 || result == 1) {
 	    	return
 	    } 
 	    
 	    printer.printUserInfo("New version available!\nInstall by typing: $ sudo npm update -g sltool");
    });
}

function fetchRemoteVersion(callback) {
    version.fetch('sltool', function(error, version) {
        if (error) {
            callback()
        }

        return callback(version)
    });
}