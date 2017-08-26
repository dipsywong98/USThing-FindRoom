var request = require('request');
const cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');

var URL_courses_and_locations = 'https://drive.google.com/uc?export=download&id=0B2wxG8U_9xycUVB2RGRoU215bTA';

var search_day = 1;
var search_time = 12;
var availablily = {};

request(URL_courses_and_locations, function (error, response, body) {
    availability = JSON.parse(body);
    console.log(Object.keys(availability),' ',search_day);
    var day = availability[search_day];
    var possible_locations = day[search_time];
    
    var time = search_time+.5;
    var last_possible_locations;
    while(possible_locations.length>0 && time<24){
        last_possible_locations = possible_locations;
        possible_locations = possible_locations.filter(function(location){
            return day[time].indexOf(location)!==1;
        });
        time += 0.5;
    }
    console.log(JSON.stringify(last_possible_locations,null,2));
})