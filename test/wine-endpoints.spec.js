const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Wine Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE wine RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE wine RESTART IDENTITY CASCADE'))

    describe(`GET /wine`, () => {
        context(`Given no wine`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/wine')
                    .expect(200, [])
            })
        })

        context('Given there are wines in the database', () => {
            const testWine = helpers.makeWineArray();

            beforeEach('insert wine', () => {
                return db
                    .into('wine')
                    .insert(testWine)
                    .then(() => {
                        return db
                            .into('wine')
                            .insert(testWine)
                    })
            })

            it('responds with 200 and all of the wine', () => {
                return supertest(app)
                    .get('/wine')
                    .expect(200, testWine)
            })
        })

    })
    describe(`POST /wine`, () => {
        const testUsers = helpers.makeUsersArray();
        beforeEach('insert malicious article', () => {
            return db
                .into('user_info')
                .insert(testUsers)
        })
        it(`creates a wine, responding with 201 and the new wine`, () => {
            const newWine = {
                user_id: 1,
                winemaker: 'winemaker_1',
                wine_type: 'wine_type_1',
                wine_name: 'wine_name_1',
                varietal: 'varietal_1',
                vintage: 2020,
                region: 'region_1',
                tasting_notes: 'tasting_notes_1',
                rating: 1,
                img_url: 'img_url_1',
                wine_id: 1,
            }
            return supertest(app)
                .post('/wine')
                .send(newWine)
                .expect(201)
                .expect(res => {
                    expect(res.body.winemaker).to.eql(newWine.winemaker)
                    expect(res.body.wine_type).to.eql(newWine.wine_type)
                    expect(res.body.wine_name).to.eql(newWine.wine_name)
                    expect(res.body.varietal).to.eql(newWine.varietal)
                    expect(res.body.vintage).to.eql(newWine.vintage)
                    expect(res.body.region).to.eql(newWine.region)
                    expect(res.body.tasting_notes).to.eql(newWine.tasting_notes)
                    expect(res.body.rating).to.eql(newWine.rating)
                    expect(res.body.img_url).to.eql(newWine.img_url)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/wine/${res.body.id}`)
                    expect(actual).to.eql(expected)
                })
                .then(res =>
                    supertest(app)
                        .get(`/wine/${res.body.id}`)
                        .expect(res.body)
                )
        })

        const requiredFields = ['winemaker', 'wine_type']

        requiredFields.forEach(field => {
            const newWine = {
                winemaker: 'Test new wine',
                wine_type: 'Red',
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newWine[field]
                return supertest(app)
                    .post('/wine')
                    .send(newWine)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
        it('removes XSS attack content from response', () => {
            const { maliciousWine, expectedWine } = makeMaliciousWine()
            return supertest(app)
                .post(`/wine`)
                .send(maliciousWine)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedWine.winemaker)
                    expect(res.body.content).to.eql(expectedWine.wine_type)
                })
        })
    })
})