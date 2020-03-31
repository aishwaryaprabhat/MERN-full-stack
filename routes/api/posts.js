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
            if (!post) return res.status(400).json({msg: 'Post not found'})

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


//@route PUT api/posts/like/:id
//@desc Like a post
//@access Private

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check if the post has already been liked
      if (
        post.likes.filter(like => like.user.toString() === req.user.id).length > 0
      ) {
        return res.status(400).json({ msg: 'Post already liked' });
      }
  
      post.likes.unshift({ user: req.user.id });
  
      await post.save();
  
      res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check if the post has already been liked
      if (
        post.likes.filter(like => like.user.toString() === req.user.id).length === 0
      ) {
        return res.status(400).json({ msg: 'Post has not been liked' });
      }
  
      //Get remove index
      const removeIndex = post.likes.map(like=> like.user.toString()).indexOf(req.user.id);

      post.likes.splice(removeIndex, 1)
  
      await post.save();
  
      res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

//@route POST api/posts/comment
//@desc Create a comment
//@access Private

router.post(
    "/comment",
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()

        ]
    ],

    async (req, res)=>{
        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
              text: req.body.text,
              name: user.name,
              avatar: user.avatar,
              user: req.user.id
            };
        
            post.comments.unshift(newComment);
        
            await post.save();

      res.json(post.comments);
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
          }

    }
)

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Pull out comment
      const comment = post.comments.find(
        comment => comment.id === req.params.comment_id
      );
      // Make sure comment exists
      if (!comment) {
        return res.status(404).json({ msg: 'Comment does not exist' });
      }
      // Check user
      if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      post.comments = post.comments.filter(
        ({ id }) => id !== req.params.comment_id
      );
  
      await post.save();
  
      return res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  });



  module.exports = router;
