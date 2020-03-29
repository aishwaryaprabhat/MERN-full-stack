const express = require('express');
const router = express.Router();

//@route GET api/posts
//@desc Test route
//@access Public
router.get('/', (re1,res)=> res.send('Posts route'));

module.exports = router;
