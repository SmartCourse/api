const { TABLE_NAMES: { COURSES, SUBJECTS, REVIEWS } } = require('./constants')
const { APIError, toSQLThrow, ERRORS } = require('../error')

/* All inputs should be validated in this class that are course related */
class Course {
    constructor(db) {
        console.log('initialising ORM Course object')
        this.db = db
    }

    /**
     * TODO add 'uni' param, add paging
     * @returns a list of courses
     */
    getCourses() {
        return this.db
            .run(`SELECT * FROM ${COURSES}`)
    }

    /**
     * Gets all the courses belonging to a specific subject.
     * @param {string}
     * @returns {Array}    List of courses.
     */
    getCoursesBySubject(code) {
        return this.db
            .run(`IF EXISTS(SELECT * FROM ${SUBJECTS} WHERE code=@code)
                      SELECT c.* FROM ${COURSES} as c
                      JOIN ${SUBJECTS} s ON s.code=@code
                      WHERE c.subjectID=s.id;
                  ELSE
                      ${toSQLThrow(ERRORS.SUBJECT.MISSING)}`,
            {
                [SUBJECTS]: { code }
            })
    }

    /**
     * Gets a course instance from the DB.
     * @returns {object}    Info specific to single course.
     */
    getCourse(code) {
        return this.updateCourseRatings(code)
            .then(() => this.db
                .run(`SELECT * FROM ${COURSES} WHERE code=@code`,
                    {
                        [COURSES]: { code }
                    }))
            .then(([row]) => {
                if (row) return row
                throw new APIError({ ...ERRORS.COURSE.MISSING, message: `The requested course '${code}' does not exist` })
            })
    }

    updateCourseRatings(code) {
        // recommend is just count(all recommended)/count(all reviews)
        // others are mean(values - 1)*(100/2) for all values > 0
        // ^ we need to subtract 1 from each value when taking the mean to get it in 0-2 (or 0-4) range
        // ^ we take this mean and divide by 2 or 4 (range is 0-2 or 0-4) to get a normalised value
        // ^ multiply by 100 so we have an integer percentage (we do this at an early step however, to avoid floating point biz)
        return this.db
            .run(`UPDATE c
                      SET
                          c.recommend =     (SELECT CASE WHEN COUNT(*)=0 THEN -1 ELSE SUM(r.recommend)*100/COUNT(*) END FROM ${REVIEWS} AS r WHERE r.courseID=c.id),
                          c.enjoy =         (SELECT CASE WHEN COUNT(*)=0 THEN 0 ELSE SUM(r.enjoy-1)*100/(4*COUNT(*)) END FROM ${REVIEWS} AS r WHERE r.courseID=c.id),
                          c.difficulty =    (SELECT CASE WHEN COUNT(*)=0 THEN 0 ELSE SUM(r.difficulty-1)*100/(2*COUNT(*)) END FROM ${REVIEWS} AS r WHERE r.courseID=c.id AND r.difficulty > 0),
                          c.teaching =      (SELECT CASE WHEN COUNT(*)=0 THEN 0 ELSE SUM(r.teaching-1)*100/(2*COUNT(*)) END FROM ${REVIEWS} AS r WHERE r.courseID=c.id AND r.teaching > 0),
                          c.workload =      (SELECT CASE WHEN COUNT(*)=0 THEN 0 ELSE SUM(r.workload-1)*100/(2*COUNT(*)) END FROM ${REVIEWS} AS r WHERE r.courseID=c.id AND r.workload > 0)
                      FROM ${COURSES} AS c
                      WHERE c.code=@code;`,
            {
                [COURSES]: { code }
            })
    }
}

let Singleton = null

/**
 * @param {object} db defaults to the db instance
 */
module.exports = function(db) {
    if (!db) {
        /* app environment, dev or prod */
        return (Singleton = Singleton ? Singleton : new Course(require('./db'))) // eslint-disable-line
    }
    /* to allow injection */
    return new Course(db)
}
