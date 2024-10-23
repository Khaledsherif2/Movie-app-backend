const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  try {
    const fullToken = req.headers.authorization;
    const token = fullToken?.split(" ")[1];
    if (!token) return res.status(400).send("Access Denied");
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decodedToken;
    next();
  } catch (e) {
    return res.status(400).send("Invalid Token");
  }
};
