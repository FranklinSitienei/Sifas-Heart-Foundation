const express = require('express');
const emoji = require('node-emoji');
const router = express.Router();

router.get('/emojis', (req, res) => {
  res.json(emoji.emojify(':smiley: :thumbsup: :heart: :wave: :fire: :clap:'));
});

module.exports = router;
