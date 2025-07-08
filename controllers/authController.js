const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { StatusCodes } = require('http-status-codes');

// Generate JWT tokens
const signToken = (id, secret, expiresIn) => {
  return jwt.sign({ id }, secret, { expiresIn });
};

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role = 'student' } = req.body;

    // Prevent duplicate emails
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already in use', StatusCodes.CONFLICT);
    }

    const newUser = await User.create({ email, password, name, role });

    // Generate tokens
    const accessToken = signToken(
      newUser._id,
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_ACCESS_EXPIRES_IN
    );

    const refreshToken = signToken(
      newUser._id,
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRES_IN
    );

    // Save refreshToken to DB
    newUser.refreshToken = refreshToken;
    await newUser.save({ validateBeforeSave: false });

    // Remove sensitive data
    newUser.password = undefined;
    newUser.refreshToken = undefined;

    res.status(StatusCodes.CREATED)
       .cookie('refreshToken', refreshToken, cookieOptions)
       .json({
         status: 'success',
         accessToken,
         data: { user: newUser }
       });

  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      throw new AppError('Incorrect email or password', StatusCodes.UNAUTHORIZED);
    }

    // 2) Generate tokens
    const accessToken = signToken(
      user._id,
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_ACCESS_EXPIRES_IN
    );

    const refreshToken = signToken(
      user._id,
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRES_IN
    );

    // 3) Save refreshToken to DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 4) Send response
    user.password = undefined;
    user.refreshToken = undefined;

    res.status(StatusCodes.OK)
       .cookie('refreshToken', refreshToken, cookieOptions)
       .json({
         status: 'success',
         accessToken,
         data: { user }
       });

  } catch (err) {
    next(err);
  }
};

// Refresh access token
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw new AppError('No refresh token provided', StatusCodes.UNAUTHORIZED);
    }

    // 1) Verify refresh token
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // 2) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', StatusCodes.FORBIDDEN);
    }

    // 3) Generate new tokens
    const newAccessToken = signToken(
      user._id,
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_ACCESS_EXPIRES_IN
    );

    const newRefreshToken = signToken(
      user._id,
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRES_IN
    );

    // 4) Update refreshToken in DB
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK)
       .cookie('refreshToken', newRefreshToken, cookieOptions)
       .json({
         status: 'success',
         accessToken: newAccessToken
       });

  } catch (err) {
    next(err);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // 1) Clear refreshToken from DB
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    // 2) Clear cookie
    res.clearCookie('refreshToken', cookieOptions)
       .status(StatusCodes.OK)
       .json({ status: 'success' });

  } catch (err) {
    next(err);
  }
};