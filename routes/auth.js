const express = require('express');
const router = express.Router();

//@route GET api/auth
//@desc Test route
//@access Public
router.get('/', (re1,res)=> res.send('Auth route'));

module.exports = router;
