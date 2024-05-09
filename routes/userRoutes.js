import express from "express";
import User from "../model/userModel.js";
import bcrypt from 'bcryptjs'
import { generateToken, isAdmin, isAuth } from "../utils.js";
import expressAsyncHandler from 'express-async-handler'

const userRouter = express.Router();

// Sign in endpoint
userRouter.post('/signin', expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (user && bcrypt.compareSync(password, user.password)) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  }));
   
 // Sign up endpoint 
  userRouter.post(
    '/signup',
    expressAsyncHandler(async (req, res) => {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
      }); 
      
      const user = await newUser.save();
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    })
  );
  
  // Update user profile endpoint
  userRouter.put(
    '/profile',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
          user.password = bcrypt.hashSync(req.body.password, 8);
        }
  
        const updatedUser = await user.save();
        res.send({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          token: generateToken(updatedUser),
        });
      } else {
        res.status(404).send({ message: 'User not found' });
      }
    })
  );

  // Get all users endpoint
  userRouter.get('/', isAuth, expressAsyncHandler ( async (req, res)=> {
    const users = await User.find({})
     if (users){
      res.send(users)

     }
     else {
      res.status(404).send({ message: 'User not found' });
    }
  }))

  // Delete user by ID endpoint`
  userRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findByIdAndDelete(id);
  
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }
  
      res.status(200).json({ message: "user deleted successfully", user });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

export default userRouter;