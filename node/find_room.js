/**find_room.js
 * Copyright (c) USThing 2017
 * 
 * Author: Dipsy Wong(dipsywong98)
 * Created on 2017-08-25
 * 
 * Generate places.json saying for each day in week, for each half hour, the available rooms in the next half hour
 * 
 * for days: 0 - sunday .. 6 - saturday
 * for time: 8 - 0800AM .. 23.5 - 2330PM .. 0.5
 * 
 * output structure:
 *  [
 *      day[
 *          time[
 *              available_locations[]
 *          ]
 *      ]
 * ]
 */

var request = require('request');
const cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');
moment().format();
// var URL_courses_and_locations = 'http://localhost:3000/all.json';
var all = require('./all.json')

var log = "";
var week_not_available={};
var week_available={};
for(var i=0; i<7;i++){
    week_not_available[i]={};
    week_available[i]={};
    for(var j=8; j<24; j+=0.5){
        week_not_available[i][j]=[];
        week_available[i][j]=[];
    }
}

// request(URL_courses_and_locations, function (error, response, body) {
    // console.log('request', error)
    // courses = JSON.parse(body).courses;
    // locations = JSON.parse(body).locations;
    courses = all.courses;
    locations = all.locations;
    
    for(var i=0; i<courses.length; i++){
        var course = courses[i];
        for(var j=0; j<course.sections.length; j++){
            var section = course.sections[j];
            if(section.classes=='TBA') continue;
            for(var k=0; k<section.classes.length; k++){
                var _class = section.classes[k];
                for(var m=moment(_class.start_time); m.isBefore(moment(_class.end_time).dayOfYear(m.dayOfYear()),'minute'); m.add(30,'m')){
                    var l= Number(m.hour())+Number(m.minute()/60);
                    if('0 30'.indexOf(m.minute())==-1){
                        console.log(m.minute())
                    }
                    week_not_available[m.day()][l].push(_class.location)
                }
            }
        }
        
    }

    for(var i=0; i<7;i++){
        for(var j=8; j<24; j+=0.5){
            for(var k=0; k<locations.length; k++){
                var location = locations[k];
                if(week_not_available[i][j].indexOf(location)==-1){
                    week_available[i][j].push(location);
                }
            }          
        }
    }

    fs.writeFile("places.json", JSON.stringify(week_available), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
// });