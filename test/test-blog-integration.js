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
                    res.body.blogposts.forEach(function (post) {
                        post.should.be.a('object');
                        post.should.include.keys(
                            'id', 'author', 'title', 'content', 'created');
                    });
                    resPost = res.body[0];
                    return BlogPost.findById(resPost.id).exec();
                })
                .then(function (blogposts) {
                    resPost.author.should.equal(post.author);
                    resPost.title.should.equal(post.title);
                    resPost.content.should.equal(post.content);
                });
        });
    });
    describe('POST endpoint', function () {
        it('should add a new blog post', function () {
            const newPost = {
                title: faker.lorem.sentent(),
                author: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                },
                content: faker.lorem.text()
            };
            return chai.request(app)
                .post('/posts')
                .send(newPost)
                .then(function (res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.should.be('object');
                    res.body.should.include.keys('id', 'title', 'content', 'author', 'created');
                    res.body.title.should.equal(newPost.title);
                    res.body.id.should.not.be.null;
                    res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
                    res.body.content.should.equal(newPost.content);
                    return BlogPost.findById(res.body.id).exec();
                })
                .then(function (post) {
                    post.title.should.equal(newPost.title);
                    post.content.should.equal(newPost.content);
                    post.author.firstName.should.equal(newPost.author.firstName);
                    post.author.lastName.should.equal(newPost.author.lastName);
                });
        });
    });

    describe('PUT endpoint', function () {
        it('should update posts', function () {
            const updateData = {
                title: 'a new title',
                content: 'some new content here',
                author: {
                    firstName: 'something',
                    lastName: 'somethingelse'
                }
            };
            return BlogPost.findOne().exec().then(function (blogpost) {
                    updateData.id = post.id;
                    return chai.request(app).put(`/posts/${post.id}`).send(updateData);
                })
                .then(function (res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.title.should.equal(updateData.title);
                    res.body.author.should.equal(`${updateData.author.firstName} ${updateData.author.lastName}`);
                    res.body.content.should.equal(updateData.content);

                    return BlogPost.findById(res.body.id).exec();
                })
                .then(post => {
                    post.title.should.equal(update.title);
                    post.content.should.equal(updateData.content);
                    post.author.firstName.should.equal(updateData.author.firstName);
                    post.author.lastName.should.equal(updateData.author.lastName);
                });
        });
    });
    describe('DELETE endpoint', function () {
        it('should delete a post by id', function () {

            let post;

            return BlogPost
                .findOne()
                .exec()
                .then(_post => {
                    post = _post;
                    return chai.request(app).delete(`/posts/${post.id}`);
                })
                .then(res => {
                    res.should.have.status(204);
                    return BlogPost.findById(post.id);
                })
                .then(_post => {});
        });
    });
});
