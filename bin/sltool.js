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

parseArguments(args);

function parseArguments(args) {
    if (args.length == 0 || helper.arrayContainKeys(args, ['-h', '--help'])) {
        printer.printHelp();
    } else {
        getInfo(args);
    }
}

function getInfo(args) {
    gSpinner.start()
    
    sl.getSites(args, function(sites) {
        gSpinner.stop(true);

        if (sites.length > 1) {
            printer.printSearchResults(sites);
            promptUserForSearchResults(sites);
        } else {
            var site = sites[0];
            getRealtimeInfo(site);
        }

    });
}

function promptUserForSearchResults(sites) {
    prompter.promptUserForSearchResults(sites, function(err, site) {
        if (err) {
            printer.printUserInfo(err);
            promptUserForSearchResults(sites);
        } else {
            getRealtimeInfo(site);
        }
    });
}

function getRealtimeInfo(site) {
    gSpinner.start();

    sl.getRealtimeInfo(site, function(siteName, response) {
        gSpinner.stop(true)

        /*
        if (metros.length == 0) {
            printer.printUserInfo('No metros for ' + siteName);
            return;
        }
        */

        printer.printRealTimeInformation(siteName, response);
        version.check();
    });
}

function getSpinner() {
    var spinner = new Spinner();
    spinner.setSpinnerString(0);
    return spinner;
}
