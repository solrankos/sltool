#! /usr/bin/env node

// modules
var request = require('request')

// arguments
var arg = process.argv.slice(2)

// globals
var APIKeys = {
	SLPlatsupplag: '97b236dee34c4412a743f61af4dba37f',
	SLRealtid3: '80d16ebb1c2a4bc3a72e9cd9be029b99'
}



function getSubwaySites(searchString) {
	var getSubwaySitesEndpoint = 'https://api.sl.se/api2/typeahead.json'
	.concat('?key=' + APIKeys.SLPlatsupplag)
	.concat('&searchstring=' + searchString)
	.concat('&maxResults=1')

	request(getSubwaySitesEndpoint, function(error, res, body) {
		if (error) {
			console.log(error)
			return
		} 
		if (res.statusCode != 200) {
			console.log(res.statusCode)
			return
		}
		if (!body['ResponseData']) {
			console.log('No response data')
		}

		console.log(body['ResponseData'])
	})

	console.log(getSubwaySitesEndpoint)
}

getSubwaySites(arg)