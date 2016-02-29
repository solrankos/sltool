// Modules
var _ = require('underscore');
var chalk = require('chalk');

var stringFactory = require('./string-factory.js');

exports.printHelp =function() {
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

exports.printError = function(message) {
    console.log(chalk.red("ERR! ") + message);
}

exports.printUserInfo = function(message) {
    console.log(chalk.green("INFO ") + message);
}

exports.printSearchResults = function(searchResults) {
    console.log("");

    for (var i = 0; i < searchResults.length; i++) {
        var site = searchResults[i];
        console.log(i + '. ' + site.Name);
    }
}

exports.printRealTimeInformation = function(siteName, metroArray) {
    console.log(" ");
    console.log(chalk.bgWhite(chalk.black(stringFactory.centeredSiteName(siteName))));
    console.log(" ");

    var groupOfLineGroups = groupByGroupOfLine(metroArray);

    for (var key in groupOfLineGroups) {
        var groupOfLine = groupOfLineGroups[key];
        
        printGroupOfLine(groupOfLine[0]);
        console.log(stringFactory.divider());
        
        var journeyDirectionGroups = groupByJournyDirection(groupOfLine);

        for (var key in journeyDirectionGroups) {
            var journyDirectionGroup = journeyDirectionGroups[key];

            journyDirectionGroup.forEach(function(metro) {
                var whitespace = stringFactory.whitespaceFromMetro(metro);
                console.log(metro.SafeDestinationName + whitespace + metro.DisplayTime);
            })

            console.log(" ");
        }
    }
}

function printGroupOfLine(groupOfLine) {
    var id = groupOfLine.GroupOfLineId;

    if (id == 1) {
        console.log(chalk.green(groupOfLine.GroupOfLine));
    } else if (id == 2) {
        console.log(chalk.red(groupOfLine.GroupOfLine));
    } else if (id == 3) {
        console.log(chalk.cyan(groupOfLine.GroupOfLine));
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