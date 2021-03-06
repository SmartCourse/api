const {
    DONT_RECOMMEND,
    RECOMMEND,
    MIN_ENJOY,
    MAX_ENJOY,
    MIN_OPTION,
    MAX_OPTION,
    TABLE_NAMES: { REVIEWS, COURSES, COMMENTS, REPORTS },
    PERMISSIONS_MOD,
    ANONYMOUS
} = require('./constants')
const {
    APIError,
    toSQLThrow,
    ERRORS
} = require('../error')

/* All inputs should be validated in this class that are review related */
class Review {
    constructor(db) {
        console.log('initialising ORM Review object')
        this.db = db
    }

    /**
     * Gets specific review corresponding to an id.
     * @param   {string}    code    course code.
     * @param   {number}    id      id of the review.
     * @throws  {APIError}
     * @returns {object}            single review
     */
    getReview(code, id) {
        return this.db
            .run(`SELECT * FROM ${REVIEWS} r
            WHERE r.id=@id AND r.courseID=(SELECT c.id FROM ${COURSES} c WHERE c.code=@code)`,
            {
                [REVIEWS]: { id },
                [COURSES]: { code }
            })
            .then(([row]) => {
                if (row) return row
                throw new APIError(ERRORS.REVIEW.MISSING)
            })
    }

    /**
     * @param   {string}  code          The code of the course
     * @param   {number}  pageNumber    The page number for which we want to get reviews.
     * @returns {Array}
     */
    getReviews(code, pageNumber, pageSize) {
        if (isNaN(pageNumber) || isNaN(pageSize)) {
            throw Error('Invalid paging values')
        }
        const offset = (pageSize * pageNumber) - pageSize
        return this.db
            .run(`IF NOT EXISTS (SELECT * FROM ${COURSES} WHERE code=@code)
                      ${toSQLThrow(ERRORS.COURSE.MISSING)}
                  SELECT r.*, cou.code, (SELECT COUNT(com.reviewID)
                  FROM ${COMMENTS} com
                  WHERE com.reviewID = r.id) as numResponses
                  FROM ${REVIEWS} r
                  JOIN ${COURSES} cou ON cou.code = @code
                  WHERE r.courseID=cou.id
                  ORDER BY r.timestamp DESC
                  OFFSET ${offset} ROWS
                  FETCH NEXT ${pageSize} ROWS ONLY`,
            {
                [COURSES]: { code }
            })
    }

    /**
     * Get latestReviews
     * @param {number} limit
     */
    getLatestReviews(limit = 10) {
        return this.db
            .run(`SELECT r.*, cou.code, (SELECT COUNT(com.reviewID)
                FROM ${COMMENTS} com
                WHERE com.reviewID = r.id) as numResponses
                FROM ${REVIEWS} r
                JOIN ${COURSES} cou ON r.courseID=cou.id
                ORDER BY r.timestamp DESC
                OFFSET 0 ROWS
                FETCH NEXT ${limit} ROWS ONLY`
            )
    }

    /**
     * Gets the total number of reviews for a course
     * @param   {string} code        The code of the course
     * @returns {object}
     */
    getReviewCount(code) {
        // TODO: 404 for invalid course
        return this.db
            .run(`SELECT COUNT(*) AS COUNT FROM ${REVIEWS} r
            WHERE r.courseID=(SELECT c.id FROM ${COURSES} c WHERE c.code=@code)`,
            {
                [COURSES]: { code }
            })
            .then(([row]) => row || { COUNT: 0 })
    }

    /**
     * Gets whether a user has reviewed a course or not
     * @param {string} code
     * @param {number} userID
     */
    userHasReviewed(code, userID) {
        if (userID === ANONYMOUS) return Promise.resolve(false)
        return this.db
            .run(`SELECT * FROM ${REVIEWS} r
            WHERE r.courseID=(SELECT c.id FROM ${COURSES} c WHERE c.code=@code) AND r.userID=@userID`,
            {
                [COURSES]: { code },
                [REVIEWS]: { userID }
            })
            .then(([row]) => !!row) // return a boolean only
    }

    /**
     * @param {string} code  The code of the course.
     * @param {object} data  controller passed in object which should
     *                       contain the user data (probs eventually from an auth token)
     */
    postReview(code, { title, body, recommend, enjoy, difficulty, teaching, workload, userID, session }) {
        // validation
        const errors = []
        if (!title) errors.push(ERRORS.REVIEW.NO_TITLE)
        if (!body) errors.push(ERRORS.REVIEW.NO_BODY)
        if (recommend !== DONT_RECOMMEND && recommend !== RECOMMEND) {
            errors.push(ERRORS.REVIEW.INVALID_RECOMMEND)
        }
        if (enjoy < MIN_ENJOY || enjoy > MAX_ENJOY) errors.push(ERRORS.REVIEW.INVALID_ENJOY)
        if (!session) errors.push(ERRORS.REVIEW.NO_SESSION)

        Object.entries({ difficulty, teaching, workload })
            .forEach(([key, item]) => {
                if (item < MIN_OPTION || item > MAX_OPTION) {
                    errors.push({ code: 5006, message: `Invalid ${key} value` })
                }
            })
        if (errors.length > 0) {
            throw new APIError({ ...ERRORS.MISC.VALIDATION, errors })
        }

        // insert review, get review, update course ratings
        return this.db
            .run(`IF NOT EXISTS(SELECT * FROM ${COURSES} WHERE code=@code)
                      ${toSQLThrow(ERRORS.COURSE.MISSING)}
                  IF EXISTS(SELECT * FROM ${REVIEWS} INNER JOIN ${COURSES} AS c ON c.id=courseID WHERE userID=@userID AND c.code=@code)
                      ${toSQLThrow(ERRORS.REVIEW.ALREADY_REVIEWED)}
                  INSERT INTO ${REVIEWS} (courseID, userID, title, body, recommend, enjoy, difficulty, teaching, workload, session)
                      SELECT id, @userID, @title, @body, @recommend, @enjoy, @difficulty, @teaching, @workload, @session
                      FROM courses
                      WHERE code=@code;
                  SELECT @@identity AS id`,
            {
                [REVIEWS]: { userID, title, body, recommend, enjoy, difficulty, teaching, workload, session },
                [COURSES]: { code }
            })
            .then(([{ id }]) => id)
    }

    /**
     * Put a review - i.e. update the body and ratings
     * @param {number}  id    The id of the review
     * @param {object}  body  object containing review data including
                              user id, body of the review and ratings
     */
    putReview(id, { userID, permissions, body, recommend, enjoy, difficulty, teaching, workload }) {
        // TODO 404 errors and permissions..
        return this.db
            .run(`IF NOT EXISTS(SELECT * FROM ${REVIEWS} WHERE id=@id)
                      ${toSQLThrow(ERRORS.REVIEW.MISSING)}
                  IF ${permissions} < ${PERMISSIONS_MOD} AND NOT EXISTS (SELECT * FROM ${REVIEWS} WHERE userID=@userID AND id=@id)
                      ${toSQLThrow(ERRORS.MISC.AUTHORIZATION)}
                  ELSE
                      UPDATE ${REVIEWS}
                      SET
                        body=@body,
                        recommend=@recommend,
                        enjoy=@enjoy,
                        difficulty=@difficulty,
                        teaching=@teaching,
                        workload=@workload
                      WHERE id=@id`,
            {
                [REVIEWS]: { userID, body, id, recommend, enjoy, difficulty, teaching, workload }
            })
    }

    /**
     * Delete a review and its comments.
     * @param {number}  id      The id of the review
     * @param {number}  userID  The id of the user
     * @param {number}  permissions The permission level of the user
     */
    deleteReview(id, userID, permissions) {
        // The query does an auth check with userID before deleting
        // TODO throw appropriate errors
        return this.db
            .run(`IF NOT EXISTS(SELECT * FROM ${REVIEWS} WHERE id=@id)
                      ${toSQLThrow(ERRORS.REVIEW.MISSING)}
                  IF ${permissions} < ${PERMISSIONS_MOD} AND NOT EXISTS (SELECT * FROM ${REVIEWS} WHERE userID=@userID AND id=@id)
                      ${toSQLThrow(ERRORS.MISC.AUTHORIZATION)}
                  DELETE ${REPORTS}
                    WHERE reviewID=@reviewID;
                  DELETE ${COMMENTS}
                    WHERE reviewID=@reviewID;
                  DELETE ${REVIEWS}
                    WHERE id=@id;`,
            {
                [COMMENTS]: { reviewID: id },
                [REVIEWS]: { userID, id }
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
        return (Singleton = Singleton ? Singleton : new Review(require('./db'))) // eslint-disable-line
    }
    /* to allow injection */
    return new Review(db)
}
