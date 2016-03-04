var maxCharacterLength = 35;

exports.divider = function() {
    var divider = "";

    for (var i = 0; i < maxCharacterLength; i++) {
        divider = divider + "-";
    }

    return divider;
}

exports.whitespaceFromTransport = function(transport) {
    var whitespaceCount = getWhiteSpaceCountFromTransport(transport);
    var whitespace = "";

    for (var i = 0; i < whitespaceCount; i++) {
        whitespace = whitespace + " ";
    }

    return whitespace;
}

exports.centeredSiteName = function(siteName) {
    var whitespaceCount = maxCharacterLength - siteName.length;
    var divided = Math.floor(whitespaceCount/2);
    var centeredSiteName = "";

    for (var i = 0; i < whitespaceCount + 1; i++) {
        if (i < divided) {
            centeredSiteName = centeredSiteName + " ";
        } else if (i == divided) {
            centeredSiteName = centeredSiteName + siteName;
        } else {
            centeredSiteName = centeredSiteName + " ";
        }
    }

    return centeredSiteName;
}

function getWhiteSpaceCountFromTransport(transport) {
    var string1 = transport.Destination;
    var string2 = transport.DisplayTime;
    return maxCharacterLength - (string1.length + string2.length);
}