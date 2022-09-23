const jwt = require("jsonwebtoken");

const generateTeamToken = async (team) => {
  try {
    const payload = {
      _id: team._id,
    };
    const teamToken = jwt.sign(payload, process.env.TEAM_TOKEN_SECRET, {
      expiresIn: "30d",
    });

    return Promise.resolve({ teamToken });
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = { generateTeamToken };
