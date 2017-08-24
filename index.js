
/**
 * output structure
 * 
 * courses[
 *   course{
 *      title
 *      sections[
 *          name
 *          class[
 *              time
 *              location
 *          ]
 *      ]
 *   }
 * ]
 */

var request = require('request');
const cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');
moment().format();

var links = [];
var all_courses = [];
var load_sum = 0;
var $;

var days = ["Mo","Tu","We","Th","Fr","Sa","Su"];


function GetInnerText(element){
    var text = "";
    for(var i=0; i<element.children.length; i++){
        if(element.children[i].data){
            text+=element.children[i].data;
        }
        else{
            text+="|";
        }
    }
    return text;
}

function StrContain(str1, str2){
    return str1.indexOf(str2) !== -1;
}

request('https://w5.ab.ust.hk/wcq/cgi-bin/1710/', function (error, response, body) {
    
    $ = cheerio.load(body);

    // GetCourseLinks();
    // console.log(links);
    // for(var i=0; i<links.length; i++){
    //     PushCoursesByURL(links[i]);
    // }
    
     PushCoursesByURL('https://w5.ab.ust.hk/wcq/cgi-bin/1710/');
    
});

 function GetCourseLinks(){
    var anchors = $('a.ug');
    for (var i=0; i<anchors.length; i++){
        links.push("https://w5.ab.ust.hk"+anchors[i].attribs.href);
    }
    var anchors = $('a.pg');
    for (var i=0; i<anchors.length; i++){
        links.push("https://w5.ab.ust.hk"+anchors[i].attribs.href);
    }
 }

function PushCoursesByURL(url){
    request(url ,function (error ,response ,body){  

        $ = cheerio.load(body);

        var raw_courses = $('div.course');

        //for each course in courses
        for(var i=0; i<raw_courses.length; i++){
            var raw_course = $(raw_courses[i]); 
            var sections = raw_course.find('tr').filter('[class!=""]');
            all_courses.push({
                title: GetInnerText(raw_course.find('h2')[0]),
                sections: BuildSections(sections)
            });
        }

        //loaded all courses
        if(++load_sum>=links.length){
            fs.writeFile("courses.json", JSON.stringify({courses:all_courses}), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            }); 
            // console.log(all_courses);
        }
    })
}

function BuildSections(raw_sections){
    var sections = [];
    //for each sections(tr)
    for(var i=0; i<raw_sections.length; i++){
        //get its detials (td)
        var details = $(raw_sections[i]).find('td');
        if(StrContain(raw_sections[i].attribs.class,'newsect')){
            //new section 
            sections.push({
                name:GetInnerText(details[0]),
                classes:[]
            })
        }
        else{
            //if it is extened row for previous section
            details.splice(0,0,"");
        }
        var section = sections[sections.length-1];
        var _classes = BuildClasses(section,details);
        if(_classes == "TBA"){
            section.classes="TBA";
        }
        else{
            while(_classes.length>0){
                section.classes.push(_classes.pop());
            }
        }
        
    }
    return sections;
}

function BuildClasses(section,details){
    var classes=[];
    var time_str = GetInnerText(details[1]);
    var location = GetInnerText(details[2]);
    var note="N/A";
    var start_time = 0;
    var end_time = 0;

    if(time_str=="TBA"&&location=="TBA"){
        return "TBA";
    }

    if(StrContain(time_str,"|")){
        var strs = time_str.split("|");
        note = strs[0];
        time_str = strs[1];
    }

    for(var i=0; i<days.length; i++){
        time_str = time_str.replace(days[i]," "+days[i]);
    }
    time_strs = time_str.split(" ");
    // console.log(time_strs);

    for(var i=time_strs.length-1; i>0; --i){
        var str = time_strs[i];
        if(StrContain("MoTuWeThFrSaSu",str)){
            //talking about week days
            classes.push({
                day:str,
                start_time: start_time,
                end_time:end_time,
                location: location,
                note: note
            });
        }
        if(StrContain(str,":")){
            if(end_time == 0) end_time = str;
            else start_time = str;
        }
    }
    // console.log(classes);
    return classes;
}