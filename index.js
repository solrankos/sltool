#! /usr/bin/env node

// modules
const request = require('request')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')
const _ = require('underscore')

// Globals
const gDebug = true
const gAPIKeys = {
	SLPlatsupplag: '97b236dee34c4412a743f61af4dba37f',
	SLRealtid3: '80d16ebb1c2a4bc3a72e9cd9be029b99'
}
const gTotalNumberOfCharacters = 35
const gSpinner = getSpinner()

var arguments = process.argv.slice(2)

parseArguments(arguments)

function parseArguments(arguments) {
	if (arguments.length == 0 || arrayContainKeys(arguments, ['-h', '--help'])) {
		printHelp()
	} else {
		getSubwaySites(arguments)
	}
}

function arrayContainKeys(arrayToSearch, arrayOfKeys) {
	var match = false;

	arrayToSearch.forEach(function(object) {
		arrayOfKeys.forEach(function(key) {
			if (object == key) {
				match = true
			}
		})	
	})

	return match
}

function printHelp() {
	const helpString = "\n"
	.concat("SLTool - Realtime station information\n")
	.concat("\n")
	.concat("USAGE\n")
	.concat("	sl [SEARCHSTRING]\n")
	.concat("\n")
	.concat("EXAMPLE\n")
	.concat("	#Get realtime information on slussen\n")
	.concat("	$ sl slussen\n")
	.concat("\n")
	.concat("	#Also works with shorter search string\n")
	.concat("	$ sl slu\n")

	console.log(helpString)
}

function getSpinner() {
	var spinner = new Spinner()
	spinner.setSpinnerString(0)
	return spinner
}

function handleError(message, debugData) {
	if (gDebug && debugData) {
		console.error("Debug data:\n" + debugData)
	}
	console.error(chalk.red("ERR!") + " " + message)
	var cleanConsle = true
	gSpinner.stop(cleanConsle)
}

function getSubwaySites(searchString) {
	gSpinner.start()

	var getSubwaySitesEndpoint = 'https://api.sl.se/api2/typeahead.json'
	.concat('?key=' + gAPIKeys.SLPlatsupplag)
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
	.concat('?key=' + gAPIKeys.SLRealtid3)
	.concat('&siteid=' + siteID)
	.concat('&timewindow=30')

	request(getRealtimeInfoEndpoint, function(error, res, body) {
		gSpinner.stop(true)

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
			handleError('No metros for', obj)
			return
		}

		printRealTimeInformation(obj.ResponseData.Metros)
	})
}

function printRealTimeInformation(metroArray) {
	console.log(" ")
	console.log(metroArray[0].StopAreaName)
	console.log(" ")

	var groupOfLineGroups = groupByGroupOfLine(metroArray)

	for (var key in groupOfLineGroups) {
		var groupOfLine = groupOfLineGroups[key]
		
		
		console.log(groupOfLine[0].GroupOfLine)
		console.log(getDivider())
		
		var journeyDirectionGroups = groupByJournyDirection(groupOfLine)

		for (var key in journeyDirectionGroups) {
			var journyDirectionGroup = journeyDirectionGroups[key]

			journyDirectionGroup.forEach(function(metro) {
	 			var whitespace = getWhitespaceFromMetro(metro)
	 			console.log(metro.SafeDestinationName + whitespace + metro.DisplayTime)
	 		})

	 		console.log(" ")
		}
	}
}

function groupByGroupOfLine(metroArray) {
	var groups = _.groupBy(metroArray, function(metro) {
		return metro.GroupOfLineId
	})
	return groups
}

function groupByJournyDirection(groupOfLine) {
	var groups = _.groupBy(groupOfLine, function(metro) {
		return metro.JourneyDirection
	})
	return groups
}

function getDivider() {
	var divider = ""

	for (i = 0; i < gTotalNumberOfCharacters; i++) {
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
	return gTotalNumberOfCharacters - (string1.length + string2.length)
}

