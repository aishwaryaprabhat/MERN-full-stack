const express = require('express');
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt  = require('bcryptjs')
const {check, validationResult} = require('express-validator/check')
const User = require('../../models/Users')
const config = require("config")
const jwt = require('jsonwebtoken')


//@route GET api/users
//@desc Register user
//@access Public
router.post(
    '/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
    ],
    async (req,res)=> 
{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {

    //See if user exists
        let user = await User.findOne({email})

        if (user) {
            return res.status(400).json({errors: [{msg: 'User already exixsts'}]});
        }

        //Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name, email, avatar, password
        })
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
