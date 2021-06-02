var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017'
var jwt = require('jsonwebtoken');
var router = express.Router();
const accessTokenSecret = 'logintokenaccubits';
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/registration', function (req, res, next) {
  var { name, phoneNumber, password } = req.body
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var myObj = { name: name, phoneNumber: phoneNumber, password: password }
    dbo.collection("userdetails").insertOne(myObj, function (err, result) {
      if (err) throw err;
      console.log(err)
      console.log(result)
      res.status(201).send({ message: 'registrations compelete' })
    })
  })

})
router.post('/login', function (req, res, next) {
  var { phoneNumber, password } = req.body
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { phoneNumber: phoneNumber, password: password }
    dbo.collection("userdetails").findOne(query, function (err, result) {
      if (err) throw err;
      console.log(err)
      if (result == null) {
        return res.status(401).send({ message: 'failed login' })

      } else
        var accessToken = jwt.sign({ username: result._id }, accessTokenSecret);
      console.log(result)
      return res.status(201).send({ message: 'You have been logged in', token: accessToken })
    })
  })

})
router.get('/user_Details', authenticateJWT, function (req, res, next) {
  var { phoneNumber } = req.query;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var query = { phoneNumber: phoneNumber }
    dbo.collection("userdetails").find(query).toArray(function (err, result) {
      if (err) throw err;
      console.log(err)
      console.log(result)
      return res.status(200).send({ data: result })

    })
  })



});
router.put('/update_user_Details', authenticateJWT, function (req, res, next) {
  var { address, presentAddress, PermntAddress } = req.body;
  var authorization = req.headers.authorization.split(' ')[1],
    decoded = jwt.verify(authorization, accessTokenSecret);
  decoded;
  console.log(decoded)
  var userId = decoded.username;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var newvalues = { $set: { address: address, presentAddress: presentAddress, PermntAddress: PermntAddress } };
    var myquery = { _id: ObjectId(userId) };
    dbo.collection("userdetails").updateOne(myquery, newvalues, function (err, result) {
      if (err) throw err;
      console.log(err)
      console.log(result)
      return res.status(200).send({ message: "updated user details" })

    })
  })



});
module.exports = router;
