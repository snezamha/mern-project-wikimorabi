import jwt from 'jsonwebtoken';
import axios from 'axios';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      fullName: user.fullName,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};
export const sendOtp = async (mobile, otp) => {
  let creatToken = await createToken();
  const headers = {
    'Content-Type': 'application/json',
    'x-sms-ir-secure-token': creatToken.TokenKey,
  };
  const body = {
    Code: otp,
    MobileNumber: mobile,
  };
  axios
    .post(`https://RestfulSms.com/api/VerificationCode`, body, {
      headers: headers,
    })
    .then((response) => {})
    .catch((error) => {});
};

const createToken = async () => {
  const { data } = await axios.post(`https://RestfulSms.com/api/Token`, {
    headers: {
      'Content-Type': 'application/json',
    },
    UserApiKey: process.env.SMS_UserApiKey,
    SecretKey: process.env.SMS_SecretKey,
  });
  return data;
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};