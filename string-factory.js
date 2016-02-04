var maxCharacterLength = 35;

exports.divider = function() {
    var divider = "";

    for (var i = 0; i < maxCharacterLength; i++) {
        divider = divider + "-";
    }

    return divider;
}

exports.whitespaceFromMetro = function(metro) {
    var whitespaceCount = getWhiteSpaceCountFromMetro(metro);
    var whitespace = "";

    for (var i = 0; i < whitespaceCount; i++) {
        whitespace = whitespace + " ";
    }

    return whitespace;
}

exports.centeredSiteName = function(siteName) {
    var whitespaceCount = maxCharacterLength - siteName.length;
    var divided = Math.floor(whitespaceCount/2);
    //var remeinder = whitespaceCount % 2; 
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

function getWhiteSpaceCountFromMetro(metro) {
    var string1 = metro.SafeDestinationName;
    var string2 = metro.DisplayTime;
    return maxCharacterLength - (string1.length + string2.length);
}
/*
t-centralen = 11
divided 5

0 1 2 3 4) (5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20
*/