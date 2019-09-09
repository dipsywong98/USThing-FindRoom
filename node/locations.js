/**locations.js
 * Copyright (c) USThing 2017
 *
 * Author: Dipsy Wong(dipsywong98)
 * Created on 2017-10-05
 *
 * Generator of all courses json this semester by locations
 */

//libraries
var request = require('request')
const cheerio = require('cheerio')
var fs = require('fs')
var moment = require('moment')

// const path_to_alljson = 'http://localhost/usthing/find_room/node/all.json';
var courses = {}
var location_timetable = {}
var locations = []

var InitLocationTimetable = () => {
  for (var l of locations) {
    location_timetable[l] = []
  }
}

var PushLocationTimetable = () => {
  for (var course of courses) {
    for (var section of course.sections) {
      if (section.classes == 'TBA') continue
      for (var _class of section.classes) {
        // console.log(_class.location);
        if (_class.location == 'TBA') continue
        if (!_class.location) {
          continue
        }
        location_timetable[_class.location].push({
          id: course.id,
          name: course.name,
          section: section.name,
          instructors: course.instructors,
          day: _class.day,
          start_time: _class.start_time,
          end_time: _class.end_time,
          location: _class.location
        })
      }
    }
  }
}

function StrContain (str1, str2) {
  return str1.indexOf(str2) !== -1
}

var RankLocation = (location_str) => {
  if (StrContain(location_str, 'Lecture Theater ')) {
    return location_str.match(/ [A-L] /g)[0].charCodeAt(1) - 65
  }
  if (StrContain(location_str, 'LTL')) return 10076
  location_str = location_str.replace('G', '0')
  if (location_str.match(/[0-9]{4}/g)) {
    var room_no = Number(location_str.match(/[0-9]{4}/g)[0])
    if (StrContain(location_str, 'LSK')) return room_no + 20000
    if (StrContain(location_str, 'CYT')) return room_no + 10000 + Number(StrContain(location_str, 'U') * 500)
    return room_no
  }
  return 30000
}

var Sort = () => {
  location_timetable = Object.keys(location_timetable).map(key => location_timetable[key])
  location_timetable.sort((a, b) => {
    console.log(a[0].location, RankLocation(a[0].location), b[0].location, RankLocation(b[0].location))
    return RankLocation(a[0].location) - RankLocation(b[0].location)
  })
  for (var k in location_timetable) {
    location_timetable[k].sort((a, b) => {
      return Number(moment(a.start_time).format('dHHmm')) - Number(moment(b.start_time).format('dHHmm'))
    })
  }
}

var FileOut = (file_name, json) => {
  fs.writeFile(file_name, json, (err) => {
    if (err) {
      return console.log(err)
    }
    console.log('The file was saved!')
  })
}

const content = fs.readFileSync('./all.json')
courses = JSON.parse(content).courses
locations = JSON.parse(content).locations
InitLocationTimetable()
PushLocationTimetable()
Sort()
FileOut('location_timetable.json', JSON.stringify(location_timetable))
