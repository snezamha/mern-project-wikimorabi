import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';
import axios from 'axios';

const paymentRouter = express.Router();
paymentRouter.post(
  '/zarinpal/request',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { data } = await axios.post(
      `https://api.zarinpal.com/pg/v4/payment/request.json`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        merchant_id: process.env.ZP_MERCHANT_ID,
        amount: req.body.amount,
        callback_url: 'http://localhost:3000/order/' + req.body.orderId,
        description: 'خرید کالا از فروشگاه ویکی مربی',
      }
    );
    // console.log(data)
    if (data.data.code == '100') {
      res.send(data.data.authority);
    } else {
      res.status(404).send({ message: 'مشکلی پیش آمده است. مجدد تلاش کنید' });
    }
  })
);
paymentRouter.post(
  '/zarinpal/verify',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { data } = await axios.post(
      `https://api.zarinpal.com/pg/v4/payment/verify.json`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        merchant_id: process.env.ZP_MERCHANT_ID,
        amount: req.body.amount,
        authority: req.body.authority,
      }
    );
    // console.log(data)
    // console.log(req.body.amount,req.body.authority)
    if (data.data.code == '100' || data.data.code == '101') {
      res.send(data.data);
    } else {
      res.status(404).send({ message: 'مشکلی پیش آمده است. مجدد تلاش کنید' });
    }
  })
);
export default paymentRouter;