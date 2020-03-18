const express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
const app = express()
//const port = 3000

const Sequelize = require('sequelize');
const Model = Sequelize.Model;

const stripe = require('stripe')('sk_test_52nHO5XQKe2ILdFpzdAXLSCF00u4uGfWA7');

// Option 2: Passing a connection URI
const sequelize = new Sequelize('mysql://bcfdd6deb4133a:76620121@us-cdbr-iron-east-04.cleardb.net/heroku_0656d8a9861c376?reconnect=true');

const bcrypt = require('bcrypt');
const saltRounds = 10;

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 
}

app.use(cors(corsOptions));
//app.options('*', cors());
//app.options('/login', cors())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  //res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  //res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json())
const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

class User extends Model {}

User.init({
  // attributes
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING
    // allowNull defaults to true
  },
  datecreated: {
    type: Sequelize.DATE
  }
}, {
  sequelize,
  timestamps: false,
  modelName: 'user'
  // options
});

class Donation extends Model {}

Donation.init({
  // attributes
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    allowNull: false
  },
  charity: {
    type: Sequelize.INTEGER
    // allowNull defaults to true
  },
  donation: {
    type: Sequelize.INTEGER
    // allowNull defaults to true
  },
  datedonated: {
    type: Sequelize.DATE
    // allowNull defaults to true
  }
}, {
  sequelize,
  timestamps: false,
  modelName: 'donation'
  // options
});

app.get('/', (req, res) => {
    /*User
      .create({ username: 'John Doe', password: 'senior engineer' })
      .then(user => {
        console.log(user.get('username')); // John Doe (SENIOR ENGINEER)
        console.log(user.get('password')); // SENIOR ENGINEER
      })*/

    res.json({'Hello': 'World!'});
});

app.post('/login', (req, res) => {
    console.log(JSON.stringify(req.body));

    //find one
    User.findOne({
      where: {
        username: req.body["email"]
      }
    }).then(user => {
  
      console.log(JSON.stringify(user));

      //if (user.password === req.body["password"]){
      bcrypt.compare(req.body["password"], user.password, function(err, result) {
    // result == true
        if(result === true){

          res.json({'user_id': user.id});


        }else{

          res.status(500);
          res.json({'error': "Wrong username or password"});

        }

      })
    }).catch(function (err) {
  // handle error;
      res.status(500);
      res.json({'error': "Wrong username or password"});

    });
    
});

app.post('/signup', (req, res) => {

    console.log(JSON.stringify(req.body));

    /*User.count({

      where: {
        username: req.body["email"]
      }

    }).then(count => {

      //console.log(res);

      if(count == 0){*/

          bcrypt.hash(req.body["password"], saltRounds, function(err, hash) {
    // Store hash in your password DB. 

              console.log(hash);

              User
              .create({ username: req.body["email"], password:  hash, datecreated: new Date()})
              .then(user => {
                console.log(user.get('username')); // John Doe (SENIOR ENGINEER)
                console.log(user.get('password')); // SENIOR ENGINEER

                res.json({'user_id': user.id});
              }).catch(function (err) {
            // handle error;
                //res.status(500);
                //res.json({'error': "Wrong username or password"});

                console.log(err);

              });
          })

      /*}else{

            res.status(500);
            res.json({"error": "User already exists"});

      }

    });*/
    //req.body
    

    
});


app.post('/donate', (req, res) => {

    console.log(req.body.user_id);
    console.log(req.body.charityChoice);
    console.log(req.body.donation)

    stripe.charges.create({
      amount: 2000,
      currency: "usd",
      source: req.body.token.id, // obtained with Stripe.js
      metadata: {'order_id': '6735'}
    }, function(err, charge) {
    // asynchronously called
      if(err === null){

        //console.log(charge);

        //req.body
        Donation
          .create({ id: req.body.user_id, charity: req.body.charityChoice, donation: req.body.donation, datedonated: new Date() })
          .then(user => {
            //console.log(user.get('username')); // John Doe (SENIOR ENGINEER)
            //console.log(user.get('password')); // SENIOR ENGINEER

            res.json({'satus': 'approved'});
          })

      }else{
        console.log(err);
      }
    })

    //console.log(charge);
    //res.json({'satus': 'approved'});

    
});

app.post('/user_donations', (req, res) => {
    console.log(JSON.stringify(req.body));

    //find one
    Donation.findAll({
      where: {
        id: req.body["user_id"]
      }
    }).then(donations => {
  
      console.log(JSON.stringify(donations));

      //if (user.password === req.body["password"]){
          res.json({'donations': donations});

    })
    
});


