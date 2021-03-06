const app = require('../../src')
const supertest = require('supertest')(app)
const { expect } = require('chai')

describe('Uni route testing', function () {
    it('GET uni/degrees', () =>
        supertest
            .get('/api/uni/degrees')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    )

    it('GET uni/faculties', () =>
        supertest
            .get('/api/uni/faculties')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    )

    it('GET uni/sessions', () =>
        supertest
            .get('/api/uni/sessions')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(({ body }) => {
                expect(body).to.have.length.greaterThan(0)
            })
    )

    describe('GET uni/reports', () => {
        let request1, request2, request3
        const report = { reason: 'It suuucks' }
        let getRequest

        // do a bunch of reports
        before(() => {
            request1 = supertest
                .post('/api/course/ACCT1501/question/1/report')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${global.idToken0}`)
                .send(report)
                .expect(201)
            request2 = supertest
                .post('/api/course/ACCT1501/question/1/report')
                .send(report)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${global.idToken1}`)
                .expect(201)
            request3 = supertest
                .post('/api/course/ACCT1501/question/2/report')
                .send(report)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${global.idToken1}`)
                .expect(201)
            // get the reports
            return Promise.all([request1, request2, request3])
                .then(() => {
                    getRequest = supertest
                        .get('/api/uni/reports')
                        .set('Accept', 'application/json')
                        .set('Authorization', `Bearer ${global.idTokenSuper}`)
                        .expect('Content-Type', /json/)
                        .expect(200)
                    return getRequest
                })
        })

        it('has 3 entries', () =>
            getRequest.then(({ body }) => {
                expect(body.length).to.equal(3)
            })
        )

        it('is ordered correctly', () =>
            getRequest.then(({ body }) => {
                expect(body[0].parentType).to.equal('question')
                expect(body[0].questionID).to.equal(1)
            })
        )
        // NOTE we don't check the number of reports because of the async report test for questions
    })

    describe('GET uni/reports (error)', () => {
        let getRequest

        before(() => {
            getRequest = supertest
                .get('/api/uni/reports')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${global.idToken0}`)
                .expect('Content-Type', /json/)
                .expect(403)
            return getRequest
        })

        it('has the correct error code', () =>
            getRequest.then(({ body }) => {
                expect(body.code).to.equal(1003)
            })
        )
    })

    describe('GET uni/feed', () => {
        let getRequest

        before(() => {
            getRequest = supertest
                .get('/api/uni/feed')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
            return getRequest
        })

        it('has 2 questions', () =>
            getRequest.then(({ body }) => {
                expect(body.questions).to.have.lengthOf(2)
            })
        )

        it('has 10 reviews', () =>
            getRequest.then(({ body }) => {
                expect(body.reviews).to.have.lengthOf(10)
            })
        )
    })
})
