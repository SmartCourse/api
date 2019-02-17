const express = require('express')
const uni = express.Router()
const uniController = require('../controllers/uni')
const reportController = require('../controllers/report')
const { cacheResponse, isModOrHigher, cache } = require('../utils/helpers')

// cache response serverside for 5 seconds
uni.get('/feed', cache(5), uniController.getFeed)

/* This doesn't change much */
uni.use(cacheResponse)

/* Return all faculties in the database */
uni.get('/faculties', uniController.getFaculties)

/* Return all degrees in the database */
uni.get('/degrees', uniController.getDegrees)

/* Return all degrees in the database */
uni.get('/sessions', uniController.getSessions)

/* Return all posts with reports, sorted by number of reports */
uni.get('/reports', isModOrHigher, reportController.getReportSummary)

module.exports = uni
