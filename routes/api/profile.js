const express = require('express');
const router = express.Router();

//@route GET api/profile
//@desc Test route
//@access Public
router.get('/', (re1,res)=> res.send('Profile route'));

module.exports = router;