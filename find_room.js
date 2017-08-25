var request = require('request');
const cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');
var week = [];
moment().format();
var day = ['Su','Mo','Tu','We','Th','Fr','Sa'];
var URL_courses_and_locations = 'https://drive.google.com/uc?export=download&id=0B2wxG8U_9xycYkk0Ry1wQ3NEQ0k';

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

request(URL_courses_and_locations, function (error, response, body) {

    courses = JSON.parse(body).courses;
    locations = JSON.parse(body).locations;

    for(var i=0; i<7; i++){
        week.push(BuildDay());
    }

    fs.writeFile("initial.json", JSON.stringify({available:week}), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

    // console.log(Object.keys(week[0]));
    console.log = function(a){log+="\n"+JSON.stringify(a);}
    
    for(var i=0; i<courses.length; i++){
        var course = courses[i];
        console.log("");
        console.log("~~~~~~~~~~");
        console.log(course.title);
        for(var j=0; j<course.sections.length; j++){
            var section = course.sections[j];
            console.log("########")
            console.log(section);
            if(section.classes=='TBA') continue;
            for(var k=0; k<section.classes.length; k++){
                var _class = section.classes[k];
                console.log("********");
                console.log(_class);
                console.log("time:"+ParseTime(_class.start_time)+" "+ParseTime(_class.end_time));
                
                for(var l=ParseTime(_class.start_time,false); l<ParseTime(_class.end_time,true);l+=.5){
                    console.log('====');
                    var day_num = day.indexOf(_class.day);
                    console.log("day:"+day_num+" hour:"+l);
                    console.log(_class.location);
                    var available_locations = week[day_num][l];
                    console.log("--original--")
                    console.log(week[day_num][l]);
                    // console.log(week);
                    week_not_available[day_num][l].push(_class.location);
                    // var index = week[day_num][l][_class.location];
                    // week[day_num].map((array) => {
                    //     delete array[_class.location]
                    // })
                    // if(index!=-1) week[day_num][l].slice(index, 1);
                    console.log("--after--")
                    console.log(week[day_num][l]);
                    // console.log(week);
                }
            }
        }
        
    }
    fs.writeFile("available.json", JSON.stringify({available:week}), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
     fs.writeFile("log.txt", log, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
    fs.writeFile("not_available.json", JSON.stringify(week_not_available, null, 2), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

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

    fs.writeFile("places.json", JSON.stringify(week_available, null, 2), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

    // console.log(week);
});


function BuildDay(){
    var day = {};
    for(var i=0; i<24; i+=0.5){
        day[i] = locations;
    }
    return day;
}

//return string hour.0 or hour.5 in 24 hours notation
function ParseTime(time_str, round_up){
    time_str = time_str.replace("AM",":AM").replace("PM",":PM");
    [hour,min,AMPM] = time_str.split(":");
    hour = Number(hour); min = Number(min);
    if(AMPM == "PM" &&hour!=12) hour+=12;
    if(round_up){
        min = Math.ceil(min/30)*0.5;
    }
    else{
        min = Math.floor(min/30)*0.5;
    }
    return hour + min;
}