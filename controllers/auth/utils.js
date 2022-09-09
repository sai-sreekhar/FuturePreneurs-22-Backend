const jwt = require("jsonwebtoken");
const UserToken = require("../../models/userTokenModel");

const generateTokens = async (user) => {
  try {
    const payload = {
      _id: user._id,
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "5d",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });

    const userToken = await UserToken.findOne({ userId: user._id });
    if (userToken) await userToken.remove();

    await new UserToken({ userId: user._id, token: refreshToken }).save();
    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    return Promise.reject(err);
  }
};

const verifyRefreshToken = (refreshToken) => {
  const privateKey = process.env.REFRESH_TOKEN_SECRET;

  return new Promise((resolve, reject) => {
    UserToken.findOne({ token: refreshToken }, (err, doc) => {
      if (!doc) {
        return reject({ error: true, message: "Invalid refresh token" });
      }
      jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
        if (err) {
          return reject({ error: true, message: "Invalid refresh token" });
        }
        resolve({
          tokenDetails,
          error: false,
          message: "Valid refresh token",
        });
      });
    });
  });
};

module.exports = { generateTokens, verifyRefreshToken };
