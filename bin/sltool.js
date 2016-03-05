#! /usr/bin/env node
"use strict";

// extern modules
var Spinner = require('cli-spinner').Spinner;

// internal modules
var printer = requireInternalModule('printer');
var prompter = requireInternalModule('prompter');
var globals = requireInternalModule('globals');
var helper = requireInternalModule('helpers');
var version = requireInternalModule('version');
var sl = requireInternalModule('sl-api');

function requireInternalModule(module) {
    return require('./../lib/' + module + ".js");
}

// globals
var gSpinner = getSpinner();
var args = process.argv.slice(2);

main(args);

function main(args) {
    var options = parseOptions(args);
    var searchString = parseSearchString(args)

    if (searchString == null || helper.arrayContainKeys(options, ['help'])) {
        printer.printHelp();
    } else {
        getInfo(searchString, options);
    }
}

function parseOptions(args) {
    var options = [];
    if (helper.arrayContainKeys(args, ['-h', '--help'])) {
        options.push("help");
    }
    if (helper.arrayContainKeys(args, ['-m', '--metros'])) {
        options.push("metros");
    }
    if (helper.arrayContainKeys(args, ['-b', '--buses'])) {
        options.push("buses");
    }

    return options;
}

function parseSearchString(args) {
    var searchStrings = [];

    for (var key in args) {
        var arg = args[key];

        if (arg.substring(0, 1) != "-") {
            searchStrings.push(arg);
        }
    }

    return searchStrings[0];
}

function getInfo(searchString, options) {
    gSpinner.start()

    sl.getSites(args, function(sites) {
        gSpinner.stop(true);

        if (sites.length > 1) {
            printer.printSearchResults(sites);
            promptUserForSearchResults(sites, options);
        } else {
            var site = sites[0];
            getRealtimeInfo(site, options);
        }

    });
}

function promptUserForSearchResults(sites, options) {
    prompter.promptUserForSearchResults(sites, function(err, site) {
        if (err) {
            printer.printUserInfo(err);
            promptUserForSearchResults(sites, options);
        } else {
            getRealtimeInfo(site, options);
        }
    });
}

function getRealtimeInfo(site, options) {
    gSpinner.start();

    sl.getRealtimeInfo(site, function(siteName, response) {
        gSpinner.stop(true)

        printer.printRealTimeInformation(siteName, response, options);
        version.check();
    });
}

function getSpinner() {
    var spinner = new Spinner();
    spinner.setSpinnerString(0);
    return spinner;
}
