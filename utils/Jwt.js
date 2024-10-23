const jwt = require("jsonwebtoken");

const generateToken = (user, totalMovies, totalUsers) => {
  return jwt.sign(
    {
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      totalMovies,
      totalUsers,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "2d" }
  );
};

module.exports = { generateToken };
