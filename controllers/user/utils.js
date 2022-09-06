const jwt = require("jsonwebtoken");

const verifyTeamToken = (teamToken) => {
  const privateKey = process.env.TEAM_TOKEN_SECRET;

  return new Promise((resolve, reject) => {
    jwt.verify(teamToken, privateKey, (err, teamTokenDetails) => {
      if (err) {
        reject({ error: true, message: "Invalid team token" });
      }
      resolve({
        error: false,
        message: "Valid Team Token",
        teamTokenDetails,
      });
    });
  });
};

module.exports = { verifyTeamToken };
