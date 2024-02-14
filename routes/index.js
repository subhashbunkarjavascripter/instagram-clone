var express = require('express');
var router = express.Router();
const userModel = require('../models/userSchema');
const postModel = require('../models/PostSchema');
const Follower = require('../models/FollowersSchema');
const Message = require('../models/MessageSchema');
const storyModel = require("../models/StorySchema")
const passport = require('passport');
const  mongoose  = require('mongoose');
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const path = require('path');
const fs =require('fs');
const multer = require('multer');
var socketapi = require('../socketapi')



mongoose.connect('mongodb://0.0.0.0/instagram').then(()=>{
  console.log('connect to db');
}).catch(err =>{
  console.log(err)
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationFolder  = file.mimetype.startsWith('video') ? './public/images/uploads/videos': './public/images/uploads';
    cb(null, destinationFolder)
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

 
router.get('/', isLoggedIn, async function(req, res, next) {
  try {
    const founduser = await userModel.findOne({ username: req.session.passport.user });
    const allposts = await postModel.find().populate('userid');
    
    const userStories = await storyModel.find({ user: founduser._id }).populate('user');
 
    res.render('index', { founduser, allposts, userStories, story: null }); // Pass story: null or handle it appropriately
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



router.get('/register', function(req,res,next){
  res.render('register')
});


router.get('/message', isLoggedIn, function(req,res,next){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){

    res.render('message',{founduser})
  })
});

router.post('/send/:receiverId', isLoggedIn, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { content } = req.body;

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    await req.user.messages.push(newMessage._id);
    await req.user.save();

    const receiver = await User.findById(receiverId);
    await receiver.messages.push(newMessage._id);
    await receiver.save();

    res.redirect(`/profile/${receiverId}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


 router.get('/profile', isLoggedIn, async function (req, res, next) {
  try {
    const viewerUserId = req.user._id;  
    const loggedInUserId = req.session.userId;  

    const founduser = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")
    .populate('following')
    .populate('followers');

    if (!founduser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = founduser.followers.some(followerId => followerId.equals(loggedInUserId));
    
    const isFollowedByViewer = req.user.following.some(followingId => followingId.equals(founduser._id));
  
    res.render('profile', { founduser, isFollowing, isFollowedByViewer, loggedInUserId });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

 

router.get('/post/:postid', isLoggedIn, async function(req, res, next) {
  try {
    const postid = req.params.postid;

    const post = await postModel.findById(postid).populate('userid');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.render('post', { post });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/profile/:userid', isLoggedIn, async function(req, res, next) {
  try {
    const viewerUserId = req.user._id;
    const userid = req.params.userid; 
    const loggedInUserId = req.session.userId; 

    const founduser = await userModel.findById(userid)
      .populate({
        path: 'posts',
        model: 'post',
      });

    if (!founduser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = founduser.followers.includes(loggedInUserId);

    const isFollowedByViewer = req.user.following.includes(userid);
    
    res.render('profile', { founduser, isFollowing, isFollowedByViewer, loggedInUserId });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


 router.get('/profile/:username', isLoggedIn, async function(req,res,next){
    const username = req.params.username
    try {
      const  founduser = await userModel.findOne({ username })
      .populate({
        path: 'posts',
        model: 'post',
      })
      .populate('following')
      .populate('followers');
      
      if (!founduser) {
        return res.status(404).send('User not found');
      }
      console.log('Found User Posts:', founduser.posts);


      res.render('profile', { founduser, posts: [] });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).send('Internal Server Error');
    }
 });


router.post('/follow/:userid', isLoggedIn, async function(req, res, next) {
  try {
    const loggedInUserId = req.session.userId;
    const useridToFollow = req.params.userid;

    const loggedInUser = await userModel.findById(loggedInUserId);
    const userToFollow = await userModel.findById(useridToFollow);

    if (!loggedInUser || !userToFollow) {
      return res.redirect('/');  
    }

    if (!loggedInUser.following.includes(useridToFollow)) {
      loggedInUser.following.push(useridToFollow);
      await loggedInUser.save();

      if (!userToFollow.followers.includes(loggedInUserId)) {
        userToFollow.followers.push(loggedInUserId);
        await userToFollow.save();
      }
    }

    return res.redirect('/');  
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

 
router.post('/unfollow/:userid', isLoggedIn, async function(req, res, next) {
  try {
    const loggedInUserId = req.session.userId;
    const useridToUnfollow = req.params.userid;

    await userModel.updateOne({ _id: loggedInUserId }, { $pull: { following: useridToUnfollow } });

    await userModel.updateOne({ _id: useridToUnfollow }, { $pull: { followers: loggedInUserId } });

    return res.redirect('/profile/' + useridToUnfollow);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



router.post('/followback/:userid', isLoggedIn, async function(req, res, next) {
  try {
    const loggedInUserId = req.session.userId;
    const useridToFollow = req.params.userid;

    const loggedInUser = await userModel.findById(loggedInUserId);
    const userToFollow = await userModel.findById(useridToFollow);

    if (!loggedInUser || !userToFollow) {
      return res.redirect('/'); 
    }

    if (!loggedInUser.following.includes(useridToFollow)) {
      loggedInUser.following.push(useridToFollow);
      await loggedInUser.save();

      if (!userToFollow.followers.includes(loggedInUserId)) {
        userToFollow.followers.push(loggedInUserId);
        await userToFollow.save();
      }
    }

    return res.redirect('/');  
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



router.post('/upload', isLoggedIn, upload.single('image'),function(req,res,next){
  console.log('File Uploaded:', req.file);
  userModel.findOne({username: req.session.passport.user})
  .then(function(founduser){
    if(founduser.image !== 'def.png'){
      fs.unlinkSync(`./public/images/uploads/${founduser.image}`)
    } 
    founduser.image = req.file.filename;
    founduser.save()
    .then(function(){
      res.redirect("/profile")
      console.log(founduser.image)
      })
      .catch(function(err){
        console.log(err);
        res.redirect("back")
      })
  })

});


router.get('/create', isLoggedIn, function (req, res, next) {
  const type = req.query.type || 'post';

  userModel.findOne({ username: req.session.passport.user })
    .then(function (founduser) {
      res.render('create', { founduser, type });
    })
    .catch(function (err) {
      console.log(err);
      res.redirect('back');
    });
});


router.post('/post', isLoggedIn, upload.single('media'), function(req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function(user) {
      if (req.query.type === 'story') {
        storyModel.create({
          user: user._id,
          media: req.file.mimetype.startsWith('video/') ? 'images/uploads/videos/' + req.file.filename : 'images/uploads/' + req.file.filename,
        }).then(function(story) {
          res.redirect("/profile");
        });
      } else {
        postModel.create({
          userid: user._id,
          video: req.file.mimetype.startsWith('video/') ? '/images/uploads/videos/' + req.file.filename : null,
          image: req.file.mimetype.startsWith('image/') ? '/images/uploads/' + req.file.filename : null,
          caption: req.body.caption
        }).then(function(post) {
          user.posts.push(post._id);
          user.save()
            .then(function() {
              res.redirect("/profile");
            });
        });
      }
    })
    .catch(function(err) {
      console.log(err);
      res.redirect("back");
    });
});



router.post('/create', isLoggedIn, upload.single('media'), function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      if (req.body.contentType === 'post') {
        postModel.create({
          userid: user._id,
          video: req.file.mimetype.startsWith('video/') ? '/images/uploads/videos/' + req.file.filename : null,
          image: req.file.mimetype.startsWith('image/') ? '/images/uploads/' + req.file.filename : null,
          caption: req.body.caption
        }).then(function (post) {
          user.posts.push(post._id);
          user.save()
            .then(function () {
              res.redirect("/profile");
            })
        });
      } else if (req.body.contentType === 'story') {
        Story.create({
          user: user._id,
          media: req.file.mimetype.startsWith('video/') ? '/images/uploads/videos/' + req.file.filename : '/images/uploads/' + req.file.filename,
          caption: req.body.caption
        }).then(function (story) {
          user.stories.push(story._id);
          user.save()
            .then(function () {
              res.redirect("/profile");
            })
        });
      } else {
        res.status(400).send('Invalid content type');
      }
    })
    .catch(function (err) {
      console.log(err);
      res.redirect("back");
    });
});



router.get('/reels', async function(req,res,next){
 try{
  const posts = await postModel.find();
  const video = posts.filter(post =>post.video).map(post =>post.video);
  const image = posts.filter(post =>post.image).map(post =>post.image);

  res.render('reels',{video, image})
 }
 catch(error){
  next(error);
 }
});



 

router.post('/register', function(req,res,next){
  var newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
    image: req.body.image
  });
  userModel.register(newUser, req.body.password)
  .then(function(){
    passport.authenticate('local')(req,res, function(){
      res.redirect('/profile')
    })
  })

});


router.get('/login',function(req,res,next){
  res.render('login');
});


router.post('/login', passport.authenticate('local', {
  successRedirect: '/setUserIdAndRedirect',
  failureRedirect: '/login'
}));

router.get('/setUserIdAndRedirect', function (req, res, next) {
  req.session.userId = req.user.id;
  res.redirect('/profile');
});

 
router.get('/view-story/:storyId', isLoggedIn, async function(req, res, next) {
  try {
    const storyId = req.params.storyId;
    const story = await storyModel.findById(storyId).populate('user');

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const userProfilePic = story.user ? story.user.image : null;


    res.render('view-story', { story: { ...story.toObject(), userProfilePic } });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});



router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}


router.get('/api/user/:userId', function(req, res, next) {
  const userId = req.params.userId;

  userModel.findById(userId)
      .then(user => {
          if (!user) {
              res.status(404).json({ message: 'User not found' });
          } else {
              const userData = {
                  username: user.username,
                  imageUrl: user.image
              };
              res.json(userData);
          }
      })
      .catch(error => {
          console.error('Error fetching user data:', error);
          res.status(500).json({ message: 'Internal server error' });
      });
});


module.exports = router;
