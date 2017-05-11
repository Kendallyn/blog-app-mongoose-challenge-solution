const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {
    BlogPost
} = require('../models');
const {
    app, runServer, closeServer
} = require('../server');
const {
    TEST_DATABASE_URL
} = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection.dropDatabase().then(result => resolve(result)).catch(err => reject(err))
    });
}

function seeBlogPostData() {
    console.info('seeding blog data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push({
            author: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName()
            },
            title: faker.lorem.sentence(),
            content: faker.lorem.text()
        });
    }
    return BlogPost.insertMany(seedData);
}

describe('BlogPost API', function () {
before(function () {
    return runServer(TEST_DATABASE_URL);
});

beforeEach(function () {
    return seeBlogPostData();
});

afterEach(function () {
    return tearDownDb();
});

after(function () {
    return closeServer();
})

describe('GET endpoint', function () {
    it('should return all existing blog posts', function () {
        let res;
        return chai.request(app)
            .get('/posts').then(function (_blog) {
                res = _res;
                res.should.have.status(200);
                res.body.should.have.length.of.at.least(1);
                return BlogPost.count();
            })
            .then(function (count) {
                res.body.blogposts.should.have.length.of(count);
            });
    });

    it('should return blog posts with right fields', function () {
        let resBlogPost;
        return chai.request(app)
            .get('/posts').then(function (res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.blogposts.should.be.a('array');
                res.body.blogposts.should.have.length.of.at.least(1);
                res.body.blogposts.forEach(function (blogpost) {
                    blogpost.should.be.a('object');
                    blogpost.should.include.keys(
                        'id', 'author', 'title', 'content', 'created');
                });
                resBlogPost = res.body.blogposts[0];
                return BlogPost.findById(resBlogPost.id);
            })
            .then(function (blogposts) {
                resBlogPost.id.should.equal(blogpost.id);
                resBlogPost.author.should.equal(blogpost.author);
                resBlogPost.title.should.equal(blogpost.title);
                resBlogPost.content.should.equal(blogpost.content);
                resBlogPost.created.should.equal(blogpost.created);
            });
    });
});
})
})
