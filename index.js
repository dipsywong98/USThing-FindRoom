
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

const cheerio = require('cheerio');
var fs = require('fs');

var links = [];
var all_courses = [];
var load_sum = 0;
var $;


var request = require('request');
request('https://w5.ab.ust.hk/wcq/cgi-bin/1710/', function (error, response, body) {
    
    $ = cheerio.load(body);

    GetCourseLinks();
    // console.log(links);
    for(var i=0; i<links.length; i++){
        PushCoursesByURL(links[i]);
    }
    
    //  PushCoursesByURL('https://w5.ab.ust.hk/wcq/cgi-bin/1710/');
    
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
        if(++load_sum==links.length){
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

function GetInnerText(element){
    return element.children[0].data;
}

function BuildSections(raw_sections){
    var sections = [];
    //for each sections(tr)
    for(var i=0; i<raw_sections.length; i++){
        //get its detials (td)
        var details = $(raw_sections[i]).find('td');
        if(raw_sections[i].attribs.class.indexOf('newsect') !== -1){
            //new section 
            sections.push({
                name:GetInnerText(details[0]),
                class:[{
                    time:GetInnerText(details[1]),
                    location:GetInnerText(details[2])
                }]
            })
        }
        else{
            //if it is extened row for previous section
            sections[sections.length-1].class.push({
                time:GetInnerText(details[0]),
                location:GetInnerText(details[1])
            })
        }
    }
    return sections;
}