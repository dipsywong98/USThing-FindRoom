var request = require('request');
const cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');
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

    // console.log(Object.keys(week[0]));
    console.log = function(a){log+="\n"+JSON.stringify(a);}
    
    for(var i=0; i<courses.length; i++){
        var course = courses[i];
        for(var j=0; j<course.sections.length; j++){
            var section = course.sections[j];
            if(section.classes=='TBA') continue;
            for(var k=0; k<section.classes.length; k++){
                var _class = section.classes[k];
                for(var l=ParseTime(_class.start_time,false); l<ParseTime(_class.end_time,true);l+=.5){
                    var day_num = day.indexOf(_class.day);;
                    week_not_available[day_num][l].push(_class.location);
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

    // console.log(week);
});


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