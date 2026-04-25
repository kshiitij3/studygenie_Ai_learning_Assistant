import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//generate JWT token
const generateToken =(id)=>{
return jwt.sign({id},process.env.JWT_SECRET,{
  expiresIn:process.env.JWT_EXPIRE||'7d',
  });
};

//@desc Register a new user
//@ route POST/api/auth/register
//@access Public
export const register = async (req, res, next) => {
  try {
        const { username, email, password } = req.body;


        const userExists = await User.findOne({$or:[{email}, { username }]});

        if(userExists){
          return res.status(400).json({
            success:false,
            error:
            userExists.email === email
            ? 'Email already exists'
            : 'Username already exists',
            statusCode:400,
          }); 

        }
  
  //create user
  const user = await User.create({
  username,
  email,
  password  
  });


  //generate token
  const token = generateToken(user._id);
  res.status(201).json({
    success:true,
    data:{
      user:{
        id:user._id,
        username: user.username,
        email:user.email,
        profileImage:user.profileImage,
        createdAt: user.createdAt,
      },
      token,

    },
    message:'User registered successfully',
  });
  
 } catch (error) {   
    next(error);   
   } 
  };
  //@desc Login user
//@ route POST/api/auth/login
//@access Public
export const login = async (req, res, next) => {
  try {
      const { email, password } = req.body;
      //validate email and password
      if(!email || !password){
        return res.status(400).json({
          success:false,
          error:'please provide email and password',
          statusCode:400,
        });
      }
      //check for user email(include password for comparison)
      const user = await User.findOne({email}).select("+password");
      if(!user){
        return res.status(401).json({
          success:false,
          error:'Invalid credentials',
          statusCode: 401
        })
      }

      //check password
      const isMatch = await user.matchPassword(password);
      if(!isMatch){
        return res.status(401).json({
          success: false,
          error:"Invalid credentials",
          statusCode:401,
        });
      }
        //generate token
        const token = generateToken(user._id);
        res.status(200).json({
          success: true,
          user:{
            id : user._id,
            username: user.username,
            email:user.email,
            profileImage: user.profileImage,
          },
          token,
          message:"login Successfully"
        });
      

   }
  catch (error) {
    next(error);
  }
    }
//@get User profile
//@ route POST/api/auth/profile
//@access private

export const getProfile = async (req, res, next) => {
     try {
   const user = await User.findById(req.user._id);
   res.status(200).json({
    success: true,
    data: {
      id :user._id,
      username: user.username,
      email :user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
   });
  }
  catch (error) {   
    next(error);   
   } 
};

//@desc update user profile
//@ route PUT/api/auth/profile
//@access private
export const updateProfile = async (req, res, next) => {
    try {

    const {username ,email ,profileImage} = req.body;

    const user = await User.findById(req.user._id);

    if(username)user.username= username;

    if(email)user.email = email;

    if(profileImage)user.profileImage=profileImage;
    
     await user.save();
    res.status(200).json(
      {
      success:true,
      data:{id:user._id,
      username:user.username,
      email:user.email,
      profileImage: user.profileImage},
      message:"profile updated successfully",
    });
  }
  catch (error) {   
    next(error);   
   } 
};
//@desc change user password
//@ route PUT/api/auth/change-password
//@access private
export const changePassword = async (req, res, next) => {
      try {
        const{ currentPassword, newPassword}= req.body;
        if(!currentPassword ||!newPassword){
            return res.status(400).json({
              success:false,
              message:"please provide current and new Password",
              statusCode:400,
            });
        }
        const user = await User.findById(req.user._id).select("+password");
        //check current password
      const isMatch = await user.matchPassword(currentPassword);
      if(!isMatch){
        return res.status(401).json({
          success:false,
          error: "current password is incorrect",  
          statusCode:401,

        });
      }
      //update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success:true,
        message:"password updated successfully"
      });
  }
  catch (error) {   
    next(error);   
   } 

};
