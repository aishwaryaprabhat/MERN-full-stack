const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator/check')
const User = require('../../models/Users')
const config = require("config")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

//@route GET api/auth
//@desc Test route
//@access Public
router.get('/', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

//@route POST api/auth
//@desc Authenticate User and get token
//@access Public
router.post(
    '/', 
    [
        check('email', 'Please include valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req,res)=> 
{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try {

    //See if user exists
        let user = await User.findOne({email})

        if (!user) {
            return res.status(400).json({errors: [{msg: 'Invalid Credntials'}]});
        }


        const isMatch = await bcrypt.compare(password, user.passwor);

        if(!isMatch) {
            return res.status(400).json({errors: [{msg: 'Invalid Credntials'}]});
        }
        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        //Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: 360000},
            (err, token)=> {
                if (err) throw err;
                res.json({token})
            }
        )
        // res.send('User route');
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

    
    
});

module.exports = router;