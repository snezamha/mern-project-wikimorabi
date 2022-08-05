import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { sendOtp, generateToken, isAuth } from '../utils.js';

const userRouter = express.Router();

userRouter.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ mobile: req.body.mobile });
    var randNumber = Math.floor(1000 + Math.random() * 9000);
    var currentDate = new Date();
    var twoMinutesLater = new Date(currentDate.getTime() + 2 * 60 * 1000);
    const regexp = /^09[0-9]{9}$/;
    if (!req.body.mobile.match(regexp)) {
      res.status(401).send({ message: 'شماره تلفن همراه معتبر نیست' });
    } else if (user) {
      if (checkValidOtp(user.otp.expiresIn)) {
        user.otp = { code: randNumber, expiresIn: twoMinutesLater };
        await user.save();
        console.log(randNumber);
        // sendOtp(req.body.mobile, randNumber);
        res.send({
          mobile: req.body.mobile,
        });
      } else {
        res.status(401).send({
          message:
            'شما به تازگی کد تایید دریافت کرده اید. لطفا پس از ' +
            countSecons(user.otp.expiresIn) +
            'مجدد تلاش کنید!',
        });
      }
    } else {
      const newUser = new User({
        fullName: 'مهمان',
        mobile: req.body.mobile,
        otp: {
          code: randNumber,
          expiresIn: twoMinutesLater,
        },
        isAdmin: false,
      });
      await newUser.save();
      console.log(randNumber);
      // sendOtp(req.body.mobile, randNumber);
      res.send({
        mobile: req.body.mobile,
      });
    }
  })
);

userRouter.post(
  '/verify',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ mobile: req.body.mobile });
    const now = new Date().getTime();
      if (user && req.body.code == user.otp.code) {
        if (user.otp.expiresIn < now) {
          res.status(401).send({ message: 'مدت اعتبار کد به پایان رسیده است' });
        }
      res.send({
        _id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
      return;
    } else {
      res.status(401).send({ message: 'کد تایید ارسالی صحیح نمی باشد' });
    }
  })
);

function checkValidOtp(expiresIn) {
  const now = new Date().getTime();
  if (expiresIn < now) {
    return true;
  }
}

function countSecons(time) {
  var currentDate = new Date();
  var diff = Math.floor((time - currentDate.getTime()) / 1000);
  return diff + ' ثانیه ';
}

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.mobile = req.body.mobile || user.mobile;
      const updateUser = await user.save();
      res.send({
        _id: updateUser._id,
        fullName: updateUser.fullName,
        mobile: updateUser.mobile,
        isAdmin: updateUser.isAdmin,
        token: generateToken(updateUser),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);
export default userRouter;
