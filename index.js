const cheerio = require('cheerio')

var links = [];
var all_courses = [];
// var $;

var request = require('request');
request('https://w5.ab.ust.hk/wcq/cgi-bin/1710/', function (error, response, body) {
    
    var $ = cheerio.load(body);

    GetCourseLinks();
    console.log(links);

    GetCourseByURL(links[0]);
    
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

        var $ = cheerio.load(body);

        var courses = $('div.course');

        //for each course in courses
        var course = $(courses[0]); 
        var title = course.find('h2')[0].innerText;
        console.log(title);
        var sections = course.find('tr').filter('[class!=""]');

        //for each section in sections
        var details = $(sections[0]).find('td');

        var name = details[0].innerText;
        var time = details[1].innerText;
    })
}
