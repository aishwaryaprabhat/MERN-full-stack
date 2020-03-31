const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profiles')
const User = require('../../models/Users')

//@route GET api/profile/me
//@desc Get current user's profile
//@access Private
router.get('/me', auth, async (req,res)=> 
    {
        try {

            const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);

            if(!profile){
                return res.status(400).json({msg: 'There is no profile for this user'});
            }
            
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error')
        }

        res.json(profile)
    }
);

module.exports = router;


// router.get('/me', auth, async (req, res) => {
//     try {
//       const profile = await Profile.findOne({
//         user: req.user.id
//       });
  
//       if (!profile) {
//         return res.status(400).json({ msg: 'There is no profile for this user' });
//       }
  
//       // only populate from user document if profile exists
//       res.json(profile.populate('user', ['name', 'avatar']));
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   });
