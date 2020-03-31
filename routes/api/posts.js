const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profiles')
const Post = require('../../models/Posts')
const User = require('../../models/Users')
const {check, validationResult}  = require('express-validator/check')
const request = require('request')
const config = require('config')

//@route POST api/posts
//@desc Create a post
//@access Private

router.post(
    "/",
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()

        ]
    ],

    async (req, res)=>{
        const erros = validationResult(req);
        if (!erros.isEmpty()){
            return res.status(400).json({errors:errors.array()})};

        try {
            const user = await User.findById(req.user.id).select('-passsword');
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
    
            })
    
            const post = await newPost.save()
            res.json(post)
        } catch (error) {
            console.log(error)
            res.status(500).send('Server Error')
        }

    }


)

//@route GET api/posts
//@desc Get all posts
//@access Private

router.get(
    "/",
    auth,
    async (req, res)=>{

        try {
            const posts = await Post.find().sort({date: -1});
            res.json(posts)

        } catch (error) {
            console.log(error)
            res.status(500).send('Server Error')
        }
        
    }
)


//@route GET api/posts/:id
//@desc Get post by id
//@access Private

router.get(
    "/:id",
    auth,
    async (req, res)=>{

        try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(400).json({msg: 'No posts for this user'})
            res.json(post)

        } catch (error) {
            console.log(error)
            res.status(500).send('Server Error')
        }
        
    }
)


//@route DELTE api/posts/:id
//@desc Delete post by id
//@access Private

router.delete(
    "/:id",
    auth,
    async (req, res)=>{

        try {
            const post = await Post.findById(req.params.id);
            if (!post) return res.status(400).json({msg: 'No posts for this user'})

            //Check user
            if(post.user.toString()!==req.user.id){
                return res.status(401).json({msg: 'User not authorized'})
            }
            await post.remove();
            res.json('Post Deleted')
        } catch (error) {
            console.log(error)
            res.status(500).send('Server Error')
        }
        
    }
)
module.exports = router;
