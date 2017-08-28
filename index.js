
/**index.js
 * Copyright (c) USThing 2017
 * 
 * Author: Dipsy Wong(dipsywong98)
 * Created on 2017-08-24
 * 
 * Generator of all courses json this semester
 * 
 * output files: 
 * courses.json (all courses), 
 * locations.json (all classroom which have courses), 
 * all.json (combine of the previous two)
 * 
 * output structure:
 * 
 * courses[
 *   course{
 *      title
 *      heading{
 *          full_code,
 *          department,
 *          code,
 *          name,
 *          credit
 *      }
 *      details{
 *          pre-requisite
 *          co-requisite
 *          
 *      }
 *      sections[
 *          name:
 *          description:{   //its content is dynamic, some index may not exist
 *              ATTRIBUTES,
 *              EXCLUSION,
 *              CO-REQUISITE,
 *              PRE-REQUISITE,
 *              DESCRIPTION,
 *          }
 *          classes:[
 *              class{
 *                  start_time
 *                  end_time
 *                  location
 *          }]
 *      ]
 *   }]
 * 
 * 
 */

var request = require('request');
const cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');
moment().format();

var links = [];
var courses_dict = {};
var all_courses = [];
var locations = [];
var load_sum = 0;
var $;

// var days = ["Mo","Tu","We","Th","Fr","Sa","Su"];
//id,text
var days = {
    Su:{
        id:7,
        text:"Sunday"
    },
    Mo:{
        id:1,
        text:"Monday"
    },
    Tu:{
        id:2,
        text:"Tuesday"
    },
    We:{
        id:3,
        text:"Wednesday"
    },
    Th:{
        id:4,
        text:"Thursday"
    },
    Fr:{
        id:5,
        text:"Friday"
    },
    Sa:{
        id:6,
        text:"Saturday"
    }
}

var start_end_date = {
    Fall:{
        start:"01-SEP-",
        end:"30-NOV-"
    },
    Spring:{
        start:"01-FEB-",
        end:"09-MAY"
    },
    Winter:{
        start:"02-JAN-",
        end:"31-JAN-"
    },
    Summer:{
        start:"18-JUN-",
        start:"15-AUG-"
    }
};
 var year;
 var semester;

function GetInnerText(element){
    if(!element) return "ignored";
    var str = '';
    for(var i=0; i<element.children.length; i++){
        if(element.children[i].data) str += element.children[i].data
        else str += '|';
    }
    return str;
}

function StrContain(str1, str2){
    return str1.indexOf(str2) !== -1;
}

request('http://localhost/class/class/w5.ab.ust.hk/wcq/cgi-bin/1710/subject/COMP.html', function (error, response, body) {
    
    $ = cheerio.load(body);

    // console.log(body);

    var semester_str = GetInnerText($('a[href*="#"]')[0]);
    [year,semester] = semester_str.split(' ');
    // console.log(semester_str, year, semester);
    if(semester.indexOf('Fall') === -1){
        year = year.split('-')[0];
    }
    else{
        year = '20'+year.split('-')[1];
    }

    // console.log(year, semester);
    // console.log(start_end_date,year,semester)

    // GetCourseLinks();
    // console.log(links);
    // for(var i=0; i<links.length; i++){
    //     PushCoursesByURL(links[i]);
    // }
    
    //  PushCoursesByURL('https://w5.ab.ust.hk/wcq/cgi-bin/1710/');
    PushCoursesByURL('http://localhost/class/class/w5.ab.ust.hk/wcq/cgi-bin/1710/subject/MATH.html')
    
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
            
            var course = BuildHeading(GetInnerText(raw_course.find('h2')[0]));
            course.details = BuildDetails($(raw_course.find('.courseinfo')[0]).find('tbody'));
            course.sections= BuildSections(sections);
            
            all_courses.push(course);
            courses_dict[course.id] = course;

        }

        //loaded all courses
        if(++load_sum>=links.length){
            fs.writeFile("courses.json", JSON.stringify({courses:all_courses}), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            }); 
            fs.writeFile("locations.json", JSON.stringify({locations:locations}), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            }); 
            fs.writeFile("all.json", JSON.stringify({courses:all_courses,locations:locations}), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            }); 
            fs.writeFile("courses_dict.json", JSON.stringify({courses:courses_dict}), function(err) {
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
    var start_date = 0;

    //record new locations
    if(location!="TBA"&&locations.indexOf(location)==-1){
        locations.push(location);
    }

    //no class
    if(time_str=="TBA"&&location=="TBA"){
        return "TBA";
    }

    // console.log(time_str)

    //split the date constrain and time
    if(StrContain(time_str,"|")){
        [note,time_str] = time_str.split("|");
        [start_date,end_date] = note.split(" - ");
    }
    else{
        // console.log(start_end_date, semester);
        // [start_date,end_date] = start_end_date[semester];
        start_date = start_end_date[semester].start+year;
        end_date = start_end_date[semester].end+year;
    }

    // console.log(start_date,end_date);

    //split the week days
    for(var day in days){
        time_str = time_str.replace(day," "+day);
    }
    time_strs = time_str.split(" ");

    for(var i=time_strs.length-1; i>0; --i){
        var str = time_strs[i];
        if(StrContain("MoTuWeThFrSaSu",str)){
            //talking about week days
            var weekday = days[str].id;
            var start_time_moment = moment(start_date+start_time,'DD-MMM-YYYYhh:mma');
            var end_time_moment = moment(end_date+end_time,'DD-MMM-YYYYhh:mma');
            ShiftClassDay(start_time_moment,end_time_moment,weekday);
            
            // console.log(start_date,start_time_moment,end_date,end_time_moment,weekday)
            // console.log(start_time,moment(start_time,'hh:mma').format(),";",end_time,moment(end_time,'hh:mma').format())
            classes.push({
                day:days[str].text,
                start_time: start_time_moment.format(),
                end_time: end_time_moment.format(),
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

function ShiftClassDay(start_time_moment, end_time_moment, weekday){
    while(Number(start_time_moment.day())!=Number(weekday)%7){
        // console.log('start', start_time_moment.day() , weekday)
        start_time_moment.add(1,'d');
    }
    while(Number(end_time_moment.day())!=Number(weekday)%7){
        // console.log('end', end_time_moment.day() , weekday)
        end_time_moment.subtract(1,'d');
    }
    return [start_time_moment,end_time_moment];
}

function BuildDetails(raw_info){
    details = {};
    var raw_details = $(raw_info).find('tr');
    for(var i=0; i<raw_details.length; i++){
        var td = $($(raw_details)[i]).find('td')[0];
        var th = $($(raw_details)[i]).find('th')[0];
        if(GetInnerText(th).split('|').length>1) continue;
        if(th&&td){
            var index = GetInnerText(th).toLowerCase();
            var content = GetInnerText(td)
            details[index] = BuildDetailsContent(index,content);
        }
    }
    return details;
}

function BuildDetailsContent(index,content){
    // if("requisite exclusion attributes".indexOf(index) == -1) return content;
    // console.log(index);
    switch(index){
        case 'attributes':
        // console.log(content);
        var cc_list = content.split('|');
        var content = [];
        for(var i=0; i<cc_list.length; i++){
            if(cc_list[i].indexOf('4Y')==-1) continue;
            content.push(cc_list[i].split('(')[1].split(')')[0]);
        }
        return content;

        case 'co-requisite':
        case 'pre-requisite':
        case 'exclusion':

        list = content.split(/[\,,;]/g);
        content = [];
        for(var i=0; i<list.length; i++){
            var course = list[i].match(/[A-Z]{4} [0-9]{4}[A-Z]*/g);
            if(course) content.push({course:course[0].split(' ').join('')});
            else content.push({other:list[i]});
        }
        return content;

        default:
        return content;
    }
}

function BuildHeading(h2_str){
    var course_code = h2_str.split(' - ')[0];
    var course_name = h2_str.split(/[A-Z]{4} [0-9]{4}[A-Z]* - /g)[1];
    // console.log(course_code, " ", course_name);
    var [department,code] = course_code.split(' ');
    var [name,credit] = course_name.split(' (');
    credit = credit.split(' unit')[0];
    return {
        id:course_code.split(' ').join(''),
        department:department,
        code:code,
        name:name,
        credit:credit
    }
}