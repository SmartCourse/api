const uniModel = require('../models/uni')()
const courseModel = require('../models/course')()
const questionModel = require('../models/question')()
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
    questionModel.getLatestQuestions()
        .then((questions) =>
            Promise.all([
                questions,
                Promise.all(questions.map(question => likesModel.getLikes({ type: TABLE_NAMES.QUESTIONS, id: question.id }))),
                Promise.all(questions.map(question => userModel.getPublicProfile(question.userID)))
            ]).then(([questions, likes, users]) =>
                questions.map((q, index) => ({
                    ...q,
                    user: users[index],
                    likes: likes[index].likes
                }))
            )
        )
        .then(getResponseHandler(res))
        .catch(next)
}
