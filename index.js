const cheerio = require('cheerio')

var links = [];
var all_courses = [];
var $;

/**
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
request('https://w5.ab.ust.hk/wcq/cgi-bin/1710/', function (error, response, body) {
    
    $ = cheerio.load(body);

    GetCourseLinks();
    // console.log(links);
    // for(var i=0; i<links.length; i++){
    //     GetCourseByURL(links[i]);
    // }
    
     GetCourseByURL('https://w5.ab.ust.hk/wcq/cgi-bin/1710/');
    
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

function GetCourseByURL(url){
    request(url ,function (error ,response ,body){  

        $ = cheerio.load(body);

        var courses = $('div.course');

        //for each course in courses
        var course = $(courses[0]); 
        var title = GetInnerText(course.find('h2')[0]);
        console.log(title);
        var sections = course.find('tr').filter('[class!=""]');
        BuildSections(sections);

        //for each section in sections
        var details = $(sections[0]).find('td');

        var name = GetInnerText(details[0]);
        var time = GetInnerText(details[1]);
        // console.log(name);
        // console.log(time);
    })
}

function GetInnerText(element){
    return element.children[0].data;
}

function BuildSections(raw_sections){
    var sections = [];
    for(var i=0; i<raw_sections.length; i++){
        var details = $(raw_sections[i]).find('td');
        if(raw_sections[i].attribs.class.indexOf('newsect') !== -1){
            sections.push({
                name:GetInnerText(details[0]),
                class:[{
                    time:GetInnerText(details[1]),
                    location:GetInnerText(details[2])
                }]
            })
        }
        else{
            sections[sections.length-1].class.push({
                time:GetInnerText(details[0]),
                location:GetInnerText(details[1])
            })
        }
    }
    return sections;
}