# USThing-FindRoom

Finding secret available locations in UST

- `index.js` get all courses in UST, outputs `all.json`, `locations.json`, `courses.json`, and `courses_dict.json`.
- `find_room.js` get available locations in different time in a week
- `search.js` returns a dictionary of available locations in different length of available time, given a start time and a day of week

### structures:

`courses_dict.json`:

```JSON
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

