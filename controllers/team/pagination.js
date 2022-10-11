const AppError = require("../../utils/appError");
const { errorCodes } = require("../../utils/constants");
const teamModel = require("../../models/teamModel");
const userModel = require("../../models/userModel");
const teamQuizModel = require("../../models/teamQuizModel");

module.exports = {
  pagination: function () {
    return async (req, res, next) => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      if (!page && !limit) {
        try {
          const results = {};
          results.results = await teamQuizModel
            .find(
              {},
              {
                _id: 0,
                startTime: 0,
                endTime: 0,
                setNum: 0,
                questionNum: 0,
                presentQuestionIdx: 0,
                questionsOrder: 0,
                __v: 0,
              }
            )
            .populate({
              path: "teamId",
              select: "teamName members -_id",
              populate: {
                path: "members",
                select: "email firstName lastName regNo mobileNumber -_id",
              },
            })

            .sort({ score: -1 });

          console.log(results.results.length);
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
      if (
        endIndex <
        (await teamModel.countDocuments({
          $expr: {
            $lt: [{ $size: { $ifNull: ["$members", []] } }, 4],
          },
        }))
      ) {
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
          .find(
            {
              $expr: {
                $lt: [{ $size: { $ifNull: ["$members", []] } }, 4],
              },
            },
            { completedQuestions: 0 }
          )
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
