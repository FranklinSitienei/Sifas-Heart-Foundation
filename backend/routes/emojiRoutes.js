const express = require('express');
const emoji = require('node-emoji');
const router = express.Router();

router.get('/emojis', (req, res) => {
  const emojiList = [
    { symbol: emoji.get('smiley'), name: 'smiley' },
    { symbol: emoji.get('thumbsup'), name: 'thumbsup' },
    { symbol: emoji.get('heart'), name: 'heart' },
    { symbol: emoji.get('wave'), name: 'wave' },
    { symbol: emoji.get('fire'), name: 'fire' },
    { symbol: emoji.get('clap'), name: 'clap' }
  ];
  res.json(emojiList);
});

module.exports = router;
