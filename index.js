#! /usr/bin/env node

// modules
var request = require('request')
var Spinner = require('cli-spinner').Spinner

// arguments
var arg = process.argv.slice(2)

// member variables
var mDebug = false
var mAPIKeys = {
	SLPlatsupplag: '97b236dee34c4412a743f61af4dba37f',
	SLRealtid3: '80d16ebb1c2a4bc3a72e9cd9be029b99'
}
var mTotalNumberOfCharacters = 35
var mSpinner = getSpinner()

getSubwaySites(arg)

function getSpinner() {
	var spinner = new Spinner()
	spinner.setSpinnerString(0)
	return spinner
}

function handleError(message, debugData) {
	if (mDebug && debugData) {
		console.error("Debug data:\n" + debugData)
	}
	console.error(message)
	var cleanConsle = true
	mSpinner.stop(cleanConsle)
}

function getSubwaySites(searchString) {
	mSpinner.start()

	var getSubwaySitesEndpoint = 'https://api.sl.se/api2/typeahead.json'
	.concat('?key=' + mAPIKeys.SLPlatsupplag)
	.concat('&searchstring=' + searchString)
	.concat('&maxResults=1')

	request(getSubwaySitesEndpoint, function(error, res, body) {
		if (error) {
			handleError(error)
			return
		} 
		if (res.statusCode != 200) {
			handleError(res.statusCode)
			return
		}

		var obj = JSON.parse(body)

		if (!obj.ResponseData) {
			handleError('No site response data', obj)
			return
		}

		var siteID = obj.ResponseData[0].SiteId

		getRealtimeInfo(siteID)
	})
}

function getRealtimeInfo(siteID) {
	var getRealtimeInfoEndpoint = 'https://api.sl.se/api2/realtimedepartures.json'
	.concat('?key=' + mAPIKeys.SLRealtid3)
	.concat('&siteid=' + siteID)
	.concat('&timewindow=30')

	request(getRealtimeInfoEndpoint, function(error, res, body) {
		mSpinner.stop(true)

		if (error) {
			handleError(error)
			return
		} 
		if (res.statusCode != 200) {
			handleError(res.statusCode)
			return
		}

		var obj = JSON.parse(body)

		if (!obj.ResponseData || !obj.ResponseData.Metros) {
			handleError('No realtime response data', obj)
			return
		}

		if (obj.ResponseData.Metros.length == 0) {
			handleError('No metros', obj)
			return
		}

		printRealTimeInformation(obj.ResponseData.Metros)
	})
}

// GroupOfLine Tunnelbanans röda linje
// GroupOfLineId
// JourneyDirection

// Slussen
// 
// Tunnelbanans gröna linje
// --------------------------
//   Vällingby             Nu
//   Hässelby strand    4 min
//   Odenplan           9 min
//
//   Hagsätra           1 min
//   Skarpnäck          4 min
//   Hagsätra           8 min
//
// Tunnelbanans röda linje
// --------------------------
//   Mörby centrum      2 min
//   Ropsten            6 min
//   Mörby centrum     13 min
//
//   Fruängen           7 min
//   Norsborg          10 min
//   Norsborg          19 min

function printRealTimeInformation(metroArray) {
	//groupByGroupOfLine(metroArray)
	if (mDebug) {
		console.log(metroArray)
	}
	console.log( )
	console.log(metroArray[0].StopAreaName)
	console.log(getDivider())

	metroArray.forEach(function(metro) {
		var whitespace = getWhitespaceFromMetro(metro)
		console.log(metro.SafeDestinationName + whitespace + metro.DisplayTime)
	})
}

// function groupByGroupOfLine(metroArray) {
// 	var groups = metroArray.groupBy(metroArray, function(obj) {
// 		return obj.GroupOfLineId
// 	})
// 	console.log(groups)
// }

function getDivider() {
	var divider = ""

	for (i = 0; i < mTotalNumberOfCharacters; i++) {
		divider = divider + "-"
	}

	return divider
}

function getWhitespaceFromMetro(metro) {
	var whitespaceCount = getWhiteSpaceCountFromMetro(metro)
	var whitespace = ""

	for (i = 0; i < whitespaceCount; i++) {
		whitespace = whitespace + " "
	}

	return whitespace
}

function getWhiteSpaceCountFromMetro(metro) {
	string1 = metro.SafeDestinationName
	string2 = metro.DisplayTime
	return mTotalNumberOfCharacters - (string1.length + string2.length)
}

