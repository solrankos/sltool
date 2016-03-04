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

exports.printRealTimeInformation = function(siteName, transports) {
    console.log(" ");
    console.log(chalk.bgWhite(chalk.black(stringFactory.centeredSiteName(siteName))));
    console.log(" ");

    if (transports.Metros.length > 0) {
        var metros = transports.Metros;
        var groups = groupByGroupOfLine(metros);
        printTransportGroups(groups, "Metros");
    }

    if (transports.Buses.length > 0) {
        var buses = transports.Buses;
        var groups = groupByLineNumber(buses);
        printTransportGroups(groups, "Buses");
    }
}

function printTransportGroups(groups, type) {
    for (var key in groups) {
        var group = groups[key];

        if (type == "Metros") {
            printMetroGroup(group[0]);    
        } else if (type == "Buses") {
            printBusGroup(group[0]);
        }
        
        console.log(stringFactory.divider());
        
        var journeyDirectionGroups = groupByJournyDirection(group);

        for (var key in journeyDirectionGroups) {
            var journyDirectionGroup = journeyDirectionGroups[key];

            journyDirectionGroup.forEach(function(transport) {
                var whitespace = stringFactory.whitespaceFromTransport(transport);
                console.log(transport.Destination + whitespace + transport.DisplayTime);
            })

            console.log(" ");
        }
    }
}

function printMetroGroup(group) {
    var id = group.GroupOfLineId;

    if (id == 1) {
        console.log(chalk.green(group.GroupOfLine));
    } else if (id == 2) {
        console.log(chalk.red(group.GroupOfLine));
    } else if (id == 3) {
        console.log(chalk.cyan(group.GroupOfLine));
    }
}

function printBusGroup(group) {
    if (group.GroupOfLine) {
        var name = group.GroupOfLine;

        if (name == "blåbuss") {
            console.log(chalk.cyan(group.LineNumber) + "ans buss");
        }

    } else {
        console.log(chalk.red(group.LineNumber) + "ans buss");
    }
}

function groupByGroupOfLine(transports) {
    var groups = _.groupBy(transports, function(transport) {
        return transport.GroupOfLine;
    });
    return groups;
}

function groupByLineNumber(transports) {
    var groups = _.groupBy(transports, function(transport) {
        return transport.LineNumber;
    });
    return groups;
}

function groupByJournyDirection(groupOfLine) {
    var groups = _.groupBy(groupOfLine, function(transport) {
        return transport.JourneyDirection;
    });
    return groups;
}