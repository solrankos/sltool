var version = require('version');
var printer = require('./../lib/printer.js');

exports.check = function() {
    fetchRemoteVersion(function(version) {
        printer.printUserInfo("New version available " + version);
    });
}

function getLocalVersion() {

}

function fetchRemoteVersion(callback) {
    version.fetch('sltool', function(error, version) {
        if (error) {
            callback()
        }

        return callback(version)
    });
}