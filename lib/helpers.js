exports.arrayContainKeys = function(arrayToSearch, arrayOfKeys) {
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

exports.handleError = function(message, debugData) {
    if (globals.debug && debugData) {
        console.error("Debug data:\n" + debugData);
    }
    printer.printError(message);
}