const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profiles')
const User = require('../../models/Users')
const {check, validationResult}  = require('express-validator/check')

//@route GET api/profile/me
//@desc Get current user's profiles
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


//@route POST api/profile
//@desc Create or update a user profile
//@access Private

router.post(
    '/',
    [
        auth, 
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()
        ]
    ],
    async (req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        //pull all the information from the post request
        const {
            company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin
        } = req.body;

        const profileFields = {};

        try {
            profileFields.user = await req.user.id
        } catch (error) {
            console.log(error)
        } 
        
        
        
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(",").map(skill=>skill.trim());
        }
        
        //Buiild social object
        profileFields.social = {}

        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;

        try {
            let profile = await Profile.findOne({user: req.user.id});

            if (profile){
                //Update
                profile = await Profile.findOneAndUpdate(
                    {user: req.user.id}, 
                    {$set: profileFields},
                    {new: true}
                    );
                return res.json(profile)
            }

            //Create
            profile = new Profile(profileFields)

            await profile.save();
            res.json(profile)

            

        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error');
        }

    }
)

//@route GET api/profile
//@desc Get all profiles
//@access Public

router.get(
    "/",
    async (req, res)=>{
        try {
            const profiles = await Profile.find().populate('user', ['name', 'avatar'])
            res.json(profiles)
        } catch (error) {
            console.log(error.message)
            res.status(500).send(error.message)
        }
    }
)

//@route GET api/profile/:user_id
//@desc Get all profile by user ID
//@access Public

router.get(
    "/user/:user_id",
    async (req, res)=>{
        try {
            const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar'])

            if (!profile) return res.status(400).json({msg: 'No profile for this user'})
            res.json(profile)
        } catch (error) {
            console.log(error.message)
            if (error.kind=='OnjectId'){
                return res.status(400).json({msg: 'No profile for this user'})
            }
            res.status(500).send(error.message)
        }
    }
)


//@route DELETE api/profile
//@desc Delete profile, user and posts
//@access Private

router.delete(
    "/",
    auth,
    async (req, res)=>{
        try {
            //remove profile
            await Profile.findOneAndRemove({user: req.user.id});
            
            //remove user
            await User.findOneAndRemove({_id: req.user.id});
            
            res.json('User deleted')
        } catch (error) {
            console.log(error.message)
            res.status(500).send(error.message)
        }
    }
);



//@route PUT api/profile/experience
//@desc Update experience
//@access Private

router.put(
    "/experience",
    auth,
    [
        check('title', "Title is required").not().isEmpty(),
        check('company', "Company is required").not().isEmpty(),
        check('from', "From date is required").not().isEmpty()
    ],
    async (req, res)=> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {title, company, location, from, to, current, description} = req.body

        const newExp = {
            title, company, location, from, to, current, description
        }

        try {
            const profile = await Profile.findOne({user: req.user.id});
            if (!profile) return res.status(400).json({msg: 'No profile for this user'});

            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile)
        } catch (error) {
            console.log(error)
            res.status(500).send(error.message)
        }
    }
)


//@route DELETE api/profile/experience/:exp_id
//@desc Delete experience
//@access Private

router.delete(
    "/experience/:exp_id",
    auth,
    async (req, res)=> {


        try {
            const profile = await Profile.findOne({user: req.user.id});
            if (!profile) return res.status(400).json({msg: 'No profile for this user'});

            //Get remove index
            const removeIndex  = profile.experience.map(item=>item.id).indexOf(req.params.exp_id)

            profile.experience.splice(removeIndex, 1);

            await profile.save();
            res.json(profile)
        } catch (error) {
            console.log(error)
            res.status(500).send(error.message)
        }
    }
);

//@route PUT api/profile/education
//@desc Update education
//@access Private

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    [
      auth,
      [
        check('school', 'School is required')
          .not()
          .isEmpty(),
        check('degree', 'Degree is required')
          .not()
          .isEmpty(),
        check('fieldofstudy', 'Field of study is required')
          .not()
          .isEmpty(),
        check('from', 'From date is required and needs to be from the past')
          .not()
          .isEmpty()
          .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(newEdu);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );


//@route DELETE api/profile/education/:education_id
//@desc Delete education
//@access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
      foundProfile.education = foundProfile.education.filter(
        edu => edu._id.toString() !== req.params.edu_id
      );
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

module.exports = router;