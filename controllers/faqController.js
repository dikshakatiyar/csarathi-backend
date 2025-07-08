const Faq = require('../models/Faq');
const { StatusCodes } = require('http-status-codes');

exports.getAllFaqs = async (req, res, next) => {
  try {
    const faqs = await Faq.find().sort('-createdAt');
    res.status(StatusCodes.OK).json({ status: 'success', data: { faqs } });
  } catch (err) {
    next(err);
  }
};

exports.createFaq = async (req, res, next) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(StatusCodes.CREATED).json({ status: 'success', data: { faq } });
  } catch (err) {
    next(err);
  }
};

exports.updateFaq = async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!faq) {
      return res.status(StatusCodes.NOT_FOUND).json({ status: 'fail', message: 'FAQ not found' });
    }
    res.status(StatusCodes.OK).json({ status: 'success', data: { faq } });
  } catch (err) {
    next(err);
  }
};

exports.deleteFaq = async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(StatusCodes.NOT_FOUND).json({ status: 'fail', message: 'FAQ not found' });
    }
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
};

exports.searchFaqs = async (req, res, next) => {
  try {
    const { query } = req.query;
    const faqs = await Faq.find({
      $or: [
        { question: { $regex: query, $options: 'i' } },
        { answer: { $regex: query, $options: 'i' } }
      ]
    }).sort('-createdAt');
    res.status(StatusCodes.OK).json({ status: 'success', data: { faqs } });
  } catch (err) {
    next(err);
  }
};