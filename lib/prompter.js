var prompt = require('prompt');

exports.promptUserForSearchResults = function(searchResults, callback) {
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
            callback(null, site);
        } else {
            callback("You need to provide a valid number.", null);
        }
    });
}