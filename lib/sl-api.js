var request = require('request');
var globals = require('./../lib/globals.js');

var gAPIKeys = {
    SLPlatsupplag: '97b236dee34c4412a743f61af4dba37f',
    SLRealtid3: '80d16ebb1c2a4bc3a72e9cd9be029b99'
};

// Function with callback that takes one parameter, sites
exports.getSites = function(searchString, callback) {
    var endpoint = 'https://api.sl.se/api2/typeahead.json'
    .concat('?key=' + gAPIKeys.SLPlatsupplag)
    .concat('&searchstring=' + searchString)
    .concat('&StationsOnly=true')
    .concat('&maxResults=5');

    request(endpoint, function(error, res, body) {
        if (error) {
            handleError(error);
            callback();
        } 
        if (res.statusCode != 200) {
            handleError(res.statusCode);
            callback();
        }

        var obj = JSON.parse(body);

        if (!obj.ResponseData) {
            handleError('No site response data', obj);
            callback();
        }

        var sites = obj.ResponseData;
        callback(sites);
    })
}

// Function with callback that takes two parameters, siteName and an array of Metro's
exports.getRealtimeInfo = function(site, callback) {
    var getRealtimeInfoEndpoint = 'https://api.sl.se/api2/realtimedepartures.json'
    .concat('?key=' + gAPIKeys.SLRealtid3)
    .concat('&siteid=' + site.SiteId)
    .concat('&timewindow=30');

    if (globals.debug) {
        console.log(getRealtimeInfoEndpoint);
    }

    request(getRealtimeInfoEndpoint, function(error, res, body) {
        if (error) {
            handleError(error);
            callback();
        } 
        if (res.statusCode != 200) {
            handleError(res.statusCode);
            callback();
        }

        var obj = JSON.parse(body);

        if (!obj.ResponseData) {
            handleError('No realtime response data', obj);
            callback();
        }

        callback(site.Name ,obj.ResponseData);
    });
}