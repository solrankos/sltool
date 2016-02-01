#! /usr/bin/env node
"use strict";

// modules
var request = require('request');
var Spinner = require('cli-spinner').Spinner;
var chalk = require('chalk');
var _ = require('underscore');
var prompt = require('prompt');

// Globals
var gDebug = true;
var gAPIKeys = {
    SLPlatsupplag: '97b236dee34c4412a743f61af4dba37f',
    SLRealtid3: '80d16ebb1c2a4bc3a72e9cd9be029b99'
};
var gTotalNumberOfCharacters = 35;
var gSpinner = getSpinner();

var args = process.argv.slice(2);

parseArguments(args);

function parseArguments(args) {
    if (args.length == 0 || arrayContainKeys(args, ['-h', '--help'])) {
        printHelp();
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

function printHelp() {
    var helpString = "\n"
    .concat("SLTool - Realtime station information\n")
    .concat("\n")
    .concat("USAGE\n")
    .concat("   sl [SEARCHSTRING]\n")
    .concat("\n")
    .concat("EXAMPLE\n")
    .concat("   #Get realtime information on slussen\n")
    .concat("   $ sl slussen\n")
    .concat("\n")
    .concat("   #Also works with shorter search string\n")
    .concat("   $ sl slu\n");

    console.log(helpString);
}

function getSpinner() {
    var spinner = new Spinner();
    spinner.setSpinnerString(0);
    return spinner;
}

function handleError(message, debugData) {
    if (gDebug && debugData) {
        console.error("Debug data:\n" + debugData);
    }
    console.error(chalk.red("ERR!") + " " + message);
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
            printSearchResults(sites);
        } else {
            var site = obj.ResponseData[0];

            console.log ("");
            console.log (site.Name);

            getRealtimeInfo(site.SiteId);
        }
    })
}

function printSearchResults(searchResults) {
    console.log("");

    for (var i = 0; i < searchResults.length; i++) {
        var site = searchResults[i];
        console.log(i + '. ' + site.Name);
    }

    promptUserForSearchResults(searchResults);
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
            getRealtimeInfo(site.SiteId);
        } else {
            handleError('Wrong number', null);
        }
    });
}

function getRealtimeInfo(siteID) {
    gSpinner.start()

    var getRealtimeInfoEndpoint = 'https://api.sl.se/api2/realtimedepartures.json'
    .concat('?key=' + gAPIKeys.SLRealtid3)
    .concat('&siteid=' + siteID)
    .concat('&timewindow=30');

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
            handleError('No metros for', obj);
            return; 
        }

        printRealTimeInformation(obj.ResponseData.Metros);
    });
}

function printRealTimeInformation(metroArray) {
    console.log(" ");

    var groupOfLineGroups = groupByGroupOfLine(metroArray);

    for (var key in groupOfLineGroups) {
        var groupOfLine = groupOfLineGroups[key];
        
        console.log(groupOfLine[0].GroupOfLine);
        console.log(getDivider());
        
        var journeyDirectionGroups = groupByJournyDirection(groupOfLine);

        for (var key in journeyDirectionGroups) {
            var journyDirectionGroup = journeyDirectionGroups[key];

            journyDirectionGroup.forEach(function(metro) {
                var whitespace = getWhitespaceFromMetro(metro);
                console.log(metro.SafeDestinationName + whitespace + metro.DisplayTime);
            })

            console.log(" ");
        }
    }
}

function groupByGroupOfLine(metroArray) {
    var groups = _.groupBy(metroArray, function(metro) {
        return metro.GroupOfLineId;
    });
    return groups;
}

function groupByJournyDirection(groupOfLine) {
    var groups = _.groupBy(groupOfLine, function(metro) {
        return metro.JourneyDirection;
    });
    return groups;
}

function getDivider() {
    var divider = "";

    for (var i = 0; i < gTotalNumberOfCharacters; i++) {
        divider = divider + "-";
    }

    return divider;
}

function getWhitespaceFromMetro(metro) {
    var whitespaceCount = getWhiteSpaceCountFromMetro(metro);
    var whitespace = "";

    for (var i = 0; i < whitespaceCount; i++) {
        whitespace = whitespace + " ";
    }

    return whitespace;
}

function getWhiteSpaceCountFromMetro(metro) {
    var string1 = metro.SafeDestinationName;
    var string2 = metro.DisplayTime;
    return gTotalNumberOfCharacters - (string1.length + string2.length);
}
