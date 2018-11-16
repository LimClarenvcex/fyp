const axios = require('axios');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const exphbs = require ('express-handlebars')
var nodemailer = require('nodemailer');
const filemgr = require('./filemgr');
var smtpTransport = require('nodemailer-smtp-transport');
const mongoose = require("mongoose");




const cors = require('cors');
const port = process.env.PORT || 3000;

server.use(express.static(__dirname + '/public'));
server.use(bodyParser.urlencoded({extended: true}));
server.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');


const PLACES_API_KEY = 'AIzaSyCzL86-0uobcrC9pKekXarOSJzqrrg3Igw';
var filteredResults;

hbs.registerHelper('list', (items, options) => {
  items = filteredResults;
  var out ="<thead class='thead-light'><tr><th>Name</th><th>Address</th><th>Rating</th><th>Photo</th></tr></thead>"; // table display

  const length = items.length;

  for(var i=0; i<length; i++){
    out = out + options.fn(items[i]);
  }

  return out;
});

server.get('/', (req, res) => {
  res.render('home.hbs');
});

server.get('/form', (req, res) => {
  res.render('form.hbs');
});

server.post('/getplaces',(req, res) => {
  const addr = req.body.address;
  const placetype = req.body.placetype;
  const name = req.body.name;
  const rate = req.body.rating;




  const locationReq =`https://maps.googleapis.com/maps/api/geocode/json?address=${addr}&key=AIzaSyARTSq38TuS9s6hfivOnbfpKYBfNsI6CHI`;



  axios.get(locationReq).then((response) => {
    const locationData = {
      addr: response.data.results[0].formatted_address,
      lat:  response.data.results[0].geometry.location.lat,
      lng:  response.data.results[0].geometry.location.lng,

    }




    const placesReq = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${locationData.lat},${locationData.lng}&radius=1500&types=${placetype}&name=${name}&key=${PLACES_API_KEY}`;



    let rate;

    axios.get(placesReq).then((response)=>{
      rate = response.data.results[0].rating,

      console.log(rate);
    
    })
    .catch((error)=>{
      console.log(error);
    });




    return axios.get(placesReq);
  }).then((response) => {

    filteredResults = extractData(response.data.results);

    filemgr.saveData(filteredResults).then((result) => {
      res.render('result.hbs');
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    // res.status(200).send(filteredResults);

  }).catch((error) => {
    console.log(error);
  });
});

server.get('/historical', (req, res) => {
  filemgr.getAllData().then((result) => {
    filteredResults = result;
    console.log(filteredResults[0]);
    res.render('historical.hbs');
  }).catch((errorMessage) =>{
    console.log(errorMessage);
  });
});

server.post('/delete', (req, res) => {
  filemgr.deleteAll().then((result) => {
    filteredResults = result;
    res.render('historical.hbs');
  }).catch((errorMessage) => {
    console.log(errorMessage);
  });
})

const extractData = (originalResults) => {
  var placesObj = {
    table : [],
  };

  const length = originalResults.length;

  for (var i=0; i<length; i++){
    if (originalResults[i].photos) {
      const photoRef = originalResults[i].photos[0].photo_reference
      const requestUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${PLACES_API_KEY}`;
      tempObj = {
        name: originalResults[i].name,
        address: originalResults[i].vicinity,
        rating: originalResults[i].rating,

        photo_reference: requestUrl,
      }
    } else {
      tempObj = {
        name: originalResults[i].name,
        address: originalResults[i].vicinity,
        rating: originalResults[i].rating,

        photo_reference: '/noimage.jpg',
      }
    }
    placesObj.table.push(tempObj);
  }
  return placesObj.table;
};

//Gmail
server.engine('handlebars', exphbs());
server.set('view engine', 'handlebars');

// Static folder
server.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json())

 server.listen(server.get('port'), function() {

});


server.get('/', (req, res) => {
  res.render('home.hbs');
});
server.get('/', (req, res) => {
  res.render('contact.hbs');
});

// create reusable transporter object using the default SMTP transport
var smtpTransport = nodemailer.createTransport(smtpTransport({
 service: 'gmail',
 auth: {
        user: 'maximumlim97@gmail.com',
        pass: 'realmadrid03'
    }
}));

server.post('/send', function (req, res) {
  var mailOptions ={
    from: '"NodeMailer Contact"<myfriend@yahoo.com>', // sender address
    to: 'maximumlim97@gmail.com', // list of receivers
    subject: req.body.subject, // Subject line
    text: req.body.message,
  }


 smtpTransport.sendMail(mailOptions, function(err, info) {
   if(err)
     console.log(err)
   else
     console.log(info);
     res.render('home.hbs', {msg:'Email has been sent'});
});
});

//Poll
// DB Config

require('./config/db');

const app = express();

const poll = require('./routes/poll');

// Set public folder
server.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

// Enable CORS
server.use(cors());

server.use('/poll', poll);

server.listen(port, () =>{
  console.log(`Server started on port ${port}`)
});
