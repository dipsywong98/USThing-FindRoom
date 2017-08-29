# USThing-FindRoom

Finding secret available locations in UST

- `index.js` get all courses in UST, outputs `all.json`, `locations.json`, `courses.json`, and `courses_dict.json`.
- `find_room.js` out available locations in different time in a week `places.json`.
- `search.js` returns a dictionary of available locations in different length of available time, given a start time and a day of week.

### structures:

##### `courses_dict.json`:

Note: `courses.json` is just `courses_dict.json` using number as index instead of `course_id`

```
courses: {
    course_id: {
        id,
        department,
        code,
        name,
        credit
        details: { //its content is dynamic, some index may not exist
            attrubutes[],
            pre-requisite:[{
                other,		//either other or course
                course
            }]
            co-requisite:[{
                other,
                course
            }]
            exclusion:[{
                other,
                course
            }]
            description,
            ...
        }
        sections: [{
            name,
            class_number,
            classes: [{
                day
                start_time
                end_time
                location
                instructors[]
           }],
            quota: {
                total,
                public
                hold{
                    department:{
                        quota,
                        enrol,
                        avail
                    }
				}
            },
            enrol,
            avail,
            wait
        }]
    }
}
```

example: TBA



##### `locations.json`:

It is just an array of locations which may have lessons

##### `all.json` :

```JSON
{
    "courses":{
      //content of courses.json
    },
  	"locations":{
        //content of locations.json
    }
}
```

#####  ##### `places.json`:

```
places:[
      day[
          time[
              available_locations[]
          ]
      ]
 ]
```

`list_of_locations_available = places[day_in_week][hour_in_day]`

### Use of `search.js`

Request places.json, and use SearchRoom function (day_in_week, start_hour) to return locations of different available length (without duplication)

example:

`SearchRoom(2,12)` returns:

```JSON
{ '3':
   [ 'Lecture Theater J (300)',
     'Rm 6591, Lift 31-32 (60)',
     'Rm 2407, Lift 17-18 (126)' ],
  '0.5':
   [ 'G011, LSK Bldg',
     'Rm 3005, Lift 4',
     'Rm 3301, Lift 17-18',
     'Rm 4621, Lift 31-32 (126)',
     'G004, CYT Bldg (30)',
     'G005, CYT Bldg (30)',
     'Rm 6131, Lift 19, 22',
     'Rm 6135, Lift 19, 22',
     'Rm 6315, Lift 19, 22',
     'Rm 6140',
     'Rm 2014, CYT Bldg',
     'Rm 3121, Lift 19, 22',
     'Rm 3111, Lift 19, 22',
     'Rm 3119, Lift 19, 22',
     'Rm 3115, Lift 19, 22',
     'Rm 2134, Lift 19, 22',
     'Rm 2133, Lift 19, 21, 22',
     'Rm 6580',
     'Rm 2128C, Lift 19 (28)',
     'Rm 4402, Lift 17-18',
     'G005, LSK Bldg',
     'Rm 1504, Lift 25-26 (52)',
     'Rm 1505, Lift 25-26 (61)',
     'Rm 4160, Lift 33',
     'Multi-function Room, LG4, LIB',
     'LG5 Multi-function Room',
     'Rm 2136, Lift 22',
     'Rm 4225C, Lift 23, 24',
     'Rm 5506, Lift 25-26 (30)',
     'Rm 2209',
     'Rm 1206',
     'Rm 1002, CYT Bldg',
     'Rm 6581, Lift 27-28',
     'Rm 4223, Lift 23',
     'Rm 3207, Lift 21',
     'Rm 2007, CYT Bldg',
     'Rm 4221, Lift 19 (32)',
     'G009A, CYT Bldg (80)',
     'Rm 4214, Lift 19 (52)',
     'Rm 2504, Lift 25-26 (84)',
     'Rm 4504, Lift 25-26 (54)',
     'G009B, CYT Bldg (70)',
     'Rm 6602, Lift 31-32 (60)',
     'Rm 4619, Lift 31-32 (126)',
     'Lecture Theater F (134)',
     'Lecture Theater E (143)',
     'Rm 1034, LSK Bldg (80)',
     'G001, CYT Bldg (24)',
     'Rm 1026, LSK Bldg (24)',
     'Rm 5562, Lift 27-28 (30)',
     'Rm 5508, Lift 25-26 (30)',
     'G002, CYT Bldg (30)',
     'Rm 1004, CYT Bldg',
     'G003, CYT Bldg (30)' ],
  '1.5': [ 'Rm 2465, Lift 25-26 (122)' ] }

```

