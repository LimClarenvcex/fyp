const axios = require('axios');

const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=5.442630,100.437600&radius=1500&types=food&name=food&key=AIzaSyCzL86-0uobcrC9pKekXarOSJzqrrg3Igw';
let placeid;
axios.get(url).then((response)=>{
    placeid = response.data.results[0].place_id,
  console.log(placeid);
})
.catch((error)=>{
  console.log(error);
});
