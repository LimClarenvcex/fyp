const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Vote = require('../models/Vote');

var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '648201',
  key: 'ff4c6cfe7c9e3273b3b4',
  secret: '7a6333c42910c07d949b',
  cluster: 'ap1',
  encrypted: true
});

router.get('/', (req, res) => {
  Vote.find().then(votes => res.json({ success: true, votes: votes }));
});

router.post('/', (req, res) => {
  const newVote = {
    os: req.body.os,
    points: 1
  };

  new Vote(newVote).save().then(vote => {
    pusher.trigger('os-poll', 'os-vote', {
      points: parseInt(vote.points),
      os: vote.os
    });

    return res.json({ success: true, message: 'Thank you for voting' });
  });
});

module.exports = router;
