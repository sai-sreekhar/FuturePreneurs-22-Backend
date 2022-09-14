const AppError = require("../../utils/appError");
const { errorCodes } = require("../../utils/constants");
const teamModel = require("../../models/teamModel");

module.exports = {
  pagination: function () {
    return async (req, res, next) => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      if (!page && !limit) {
        try {
          const results = {};
          results.results = await teamModel.find({}, { teamName: 1, _id: 0 });
          res.paginatedResults = results;
          next();
        } catch (e) {
          return next(
            new AppError("Internal Server Error", 500, errorCodes.UNKNOWN_ERROR)
          );
        }
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = {};
      if (endIndex < (await teamModel.countDocuments().exec())) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
        };
      }

      try {
        results.results = await teamModel
          .find({}, { completedQuestions: 0 })
          .populate("members", {
            email: 1,
            firstName: 1,
            lastName: 1,
            regNo: 1,
            mobileNumber: 1,
            teamRole: 1,
          })
          .limit(limit)
          .skip(startIndex)
          .exec();
        res.paginatedResults = results;
        // console.log(res.paginatedResults);
        next();
      } catch (e) {
        return next(
          new AppError("Internal Server Error", 500, errorCodes.UNKNOWN_ERROR)
        );
      }
    };
  },
};
