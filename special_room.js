/**find_room.js
 * Copyright (c) USThing 2017
 * 
 * Author: Dipsy Wong(dipsywong98)
 * Created on 2017-09-02
 * 
 * Generate special.json saying for each locations, have special day constrain
 * 
 * special{
 *       weekday{
 *          location{
 *              [start_time, end_time]
 *          }
 *      }
 * }
 * 
 */

var request = require('request');
const cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');
moment().format();
var URL_courses_and_locations = 'https://raw.githubusercontent.com/dipsywong98/USThing-FindRoom/master/all.json';

var log = "";
var special = {};

request(URL_courses_and_locations, function (error, response, body) {

    courses = JSON.parse(body).courses;
    locations = JSON.parse(body).locations;
    
    for(var i=0; i<courses.length; i++){
        var course = courses[i];
        for(var j=0; j<course.sections.length; j++){
            var section = course.sections[j];
            if(section.classes=='TBA') continue;
            for(var k=0; k<section.classes.length; k++){
                var _class = section.classes[k];
                if(_class.location == 'TBA') continue;
                    // week_not_available[m.day()][l].push(_class.location)
                var m = moment(_class.start_time);
                if(_class.note!='N/A'){
                    if(! (m.day() in special)){
                        special[m.day()] = {}
                    }
                    if(! (_class.location in special[m.day()])){
                        special[m.day()][_class.location] = [];
                    }
                    special[m.day()][_class.location].push([_class.start_time,_class.end_time,course.id]);
                }
                
            }
        }
        
    }

    // for(var i=0; i<7;i++){
    //     for(var j=8; j<24; j+=0.5){
    //         for(var k=0; k<locations.length; k++){
    //             var location = locations[k];
    //             if(week_not_available[i][j].indexOf(location)==-1){
    //                 week_available[i][j].push(location);
    //             }
    //         }          
    //     }
    // }

    fs.writeFile("special.json", JSON.stringify(special), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
});
