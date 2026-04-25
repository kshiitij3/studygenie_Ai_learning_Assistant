import express from 'express';
import { body } from 'express-validator';
import {register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';

import protect from '../middleware/auth.js';
const router = express.Router();  

const registerValidation=[
  body('username')
    .trim()
    .isLength({min :3})
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({min:6})
    .withMessage('Password must be at least 6 characters long')

];

const LoginValidation=[
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({min:6})
    .withMessage('Password must be at least 6 characters long')
];
//Public routes
  router.post('/register',registerValidation,register);
  router.post('/login',LoginValidation,login);

  //protected routes
  router.get('/profile',protect,getProfile);
  router.put('/profile',protect,updateProfile);
  router.post('/change-password',protect,changePassword);

  export default router;
