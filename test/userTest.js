
let chai = require('chai');
let chaiHttp = require('chai-http');

process.env.NODE_ENV = 'test';
let server = require('../index');

let should = chai.should();

var mongo = require("../models/mongo.js");

chai.use(chaiHttp);

//Our parent block
describe('Users', () => {
    beforeEach((done) => { //Before each test we empty the database
        mongo.User.remove({}, (err) => { 
           done();           
        });        
    });

    /*
    * Test the User sign up for developer
    */
    describe('/POST sign up', () => {
        it('it should create a new user', (done) => {
            let user = {
                name: "Tarun Test Mittal",
                email: "tarun+test@ta.run",
                password: "password",
                role: "developer"
            }
            chai.request(server)
                .post('/auth/sign-up')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                //   res.body.should.have.deep.keys({name:1, user_id:1});
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('user_id');
                    res.body.data.should.have.property('name');
                    console.log(res.body);
                    done();
                });
        });
    });

});