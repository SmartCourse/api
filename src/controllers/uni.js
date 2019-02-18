const uniModel = require('../models/uni')()
const courseModel = require('../models/course')()
const questionModel = require('../models/question')()
const reviewModel = require('../models/review')()
const userModel = require('../models/user')()
const likesModel = require('../models/likes')()

const { TABLE_NAMES } = require('../models/constants')

const { getResponseHandler } = require('../utils/helpers')

/* Get all subjects */
exports.getSubjects = function (_, res, next) {
    uniModel.getSubjects()
        .then(getResponseHandler(res))
        .catch(next)
}

/* Get all degrees */
exports.getDegrees = function (_, res, next) {
    uniModel.getDegrees()
        .then(getResponseHandler(res))
        .catch(next)
}

/* Get all faculties */
exports.getFaculties = function (_, res, next) {
    uniModel.getFaculties()
        .then(getResponseHandler(res))
        .catch(next)
}

/* Get all courses of a given subject */
exports.getCourses = function ({ params }, res, next) {
    courseModel.getCoursesBySubject(params.code)
        .then(getResponseHandler(res))
        .catch(next)
}

exports.getSessions = function (_, res, next) {
    uniModel.getSessions()
        .then(getResponseHandler(res))
        .catch(next)
}

exports.getFeed = function(_, res, next) {
    Promise.all([
        questionModel.getLatestQuestions(),
        reviewModel.getLatestReviews()
    ])
        .then(([questions, reviews]) =>
            Promise.all([
                questions,
                Promise.all(questions.map(question => likesModel.getLikes({ type: TABLE_NAMES.QUESTIONS, id: question.id }))),
                Promise.all(questions.map(question => userModel.getPublicProfile(question.userID))),
                reviews,
                Promise.all(reviews.map(review => likesModel.getLikes({ type: TABLE_NAMES.REVIEWS, id: review.id }))),
                Promise.all(reviews.map(review => userModel.getPublicProfile(review.userID)))
            ]))
        .then(([questions, qLikes, qUsers, reviews, rLikes, rUsers]) =>
            ({
                questions: questions.map((q, index) =>
                    ({
                        ...q,
                        user: qUsers[index],
                        likes: qLikes[index].likes
                    })
                ),
                reviews: reviews.map((r, index) =>
                    ({
                        ...r,
                        user: rUsers[index],
                        likes: rLikes[index].likes
                    })
                )
            })
        )
        .then(getResponseHandler(res))
        .catch(next)
}
