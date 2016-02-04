#! /usr/bin/env node
"use strict";

// extern modules
var request = require('request');
var Spinner = require('cli-spinner').Spinner;
var chalk = require('chalk');
var prompt = require('prompt');

// internal modules
var printer = require('./printer.js');
var globals = require('./globals.js');

// globals
var gAPIKeys = {
    SLPlatsupplag: '97b236dee34c4412a743f61af4dba37f',
    SLRealtid3: '80d16ebb1c2a4bc3a72e9cd9be029b99'
};
var gSpinner = getSpinner();

var args = process.argv.slice(2);

parseArguments(args);

function parseArguments(args) {
    if (args.length == 0 || arrayContainKeys(args, ['-h', '--help'])) {
        printer.printHelp();
    } else {
        getSubwaySites(args);
    }
}

function arrayContainKeys(arrayToSearch, arrayOfKeys) {
    var match = false;

    arrayToSearch.forEach(function(object) {
        arrayOfKeys.forEach(function(key) {
            if (object == key) {
                match = true;
            }
        });
    });

    return match;
}

function getSpinner() {
    var spinner = new Spinner();
    spinner.setSpinnerString(0);
    return spinner;
}

function getSubwaySites(searchString) {
    gSpinner.start();

    var getSubwaySitesEndpoint = 'https://api.sl.se/api2/typeahead.json'
    .concat('?key=' + gAPIKeys.SLPlatsupplag)
    .concat('&searchstring=' + searchString)
    .concat('&StationsOnly=true')
    .concat('&maxResults=5');

    request(getSubwaySitesEndpoint, function(error, res, body) {
        gSpinner.stop(true)

        if (error) {
            handleError(error);
            return;
        } 
        if (res.statusCode != 200) {
            handleError(res.statusCode);
            return;
        }

        var obj = JSON.parse(body);

        if (!obj.ResponseData) {
            handleError('No site response data', obj);
            return;
        }

        var sites = obj.ResponseData;

        if (sites.length > 1) {
            printer.printSearchResults(sites);
            promptUserForSearchResults(sites);
        } else {
            var site = obj.ResponseData[0];
            getRealtimeInfo(site);
        }
    })
}

function promptUserForSearchResults(searchResults) {
    prompt.message = '';
    prompt.delimiter = '';
    prompt.start();
    prompt.get({
        properties: {
            option: {
                description: '>'.green
            }
        }
    }, function(err, result) {
        var option = result.option;
        if (option < searchResults.length && option >= 0) {
            var site = searchResults[option];
            getRealtimeInfo(site);
        } else {
            printer.printUserInfo("You need to provide a valid number.");
            promptUserForSearchResults(searchResults);
        }
    });
}

function getRealtimeInfo(site) {
    gSpinner.start()

    var getRealtimeInfoEndpoint = 'https://api.sl.se/api2/realtimedepartures.json'
    .concat('?key=' + gAPIKeys.SLRealtid3)
    .concat('&siteid=' + site.SiteId)
    .concat('&timewindow=30');

    if (globals.debug) {
        console.log(getRealtimeInfoEndpoint);
    }

    request(getRealtimeInfoEndpoint, function(error, res, body) {
        gSpinner.stop(true);

        if (error) {
            handleError(error);
            return;
        } 
        if (res.statusCode != 200) {
            handleError(res.statusCode);
            return;
        }

        var obj = JSON.parse(body);

        if (!obj.ResponseData || !obj.ResponseData.Metros) {
            handleError('No realtime response data', obj);
            return;
        }

        if (obj.ResponseData.Metros.length == 0) {
            printer.printUserInfo('No metros for ' + site.Name);
            return; 
        }

        printer.printRealTimeInformation(site.Name ,obj.ResponseData.Metros);
    });
}

function handleError(message, debugData) {
    if (globals.debug && debugData) {
        console.error("Debug data:\n" + debugData);
    }
    console.error(chalk.red("ERR! ") + message);
}
