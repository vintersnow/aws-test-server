const httpStatus = require('http-status');

module.exports = (req, res, next) => {
  const q = req.originalUrl.split('?')
  const formula = q[q.length - 1];

  if (! formula) {
    return next({ status: httpStatus.BAD_REQUEST });
  }

  try {
    const result = eval(formula);
    res.status(200).send(String(result));
  } catch(e) {
    next({ status: httpStatus.BAD_REQUEST });
  }
}
