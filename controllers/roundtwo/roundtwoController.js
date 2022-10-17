const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const RoundOneModel = require("../../models/roundoneModel");
const RoundTwoModel = require("../../models/roundtwoModel");
const Team = require("../../models/teamModel");
const {
  errorCodes,
  objectIdLength,
  maps,
  roundTwoScores,
} = require("../../utils/constants");
const { roundTwoBoxChoiceValidationSchema } = require("./validationSchema");

exports.startRoundTwo = catchAsync(async (req, res, next) => {
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const team = await Team.findOne({ _id: req.params.teamId });

  if (!team) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the Team or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  if (!team.isTeamQualified) {
    return next(
      new AppError("Team is not qualified", 412, errorCodes.TEAM_NOT_QUALIFIED)
    );
  }

  let roundOne = await RoundOneModel.findOne({ teamId: req.params.teamId });
  if (!team.hasRoundOneEnd) {
    return next(
      new AppError(
        "Round One Not Completed",
        412,
        errorCodes.PREVIOUS_ROUNDS_NOT_DONE
      )
    );
  }

  if (team.hasRoundTwoEnd) {
    return next(
      new AppError("Round 2 Completed", 412, errorCodes.ROUND_TWO_COMPLETED)
    );
  }

  let roundTwo = await RoundTwoModel.findOne({ teamId: req.params.teamId });
  if (roundTwo) {
    if (roundTwo.endTime < Date.now()) {
      await Team.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          $set: { hasRoundTwoEnd: true },
        }
      );
      return next(
        new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
      );
    } else {
      res.status(201).json({
        message: "Round Two Already Started Succesfully",
        startTime: roundTwo.startTime,
        endTime: roundTwo.endTime,
      });
    }
  } else {
    roundTwo = await new RoundTwoModel({
      teamId: req.params.teamId,
      startTime: Date.now(),
      endTime: Date.now() + 600000,
      roundTwoScore: 0,
      mapChoice: roundOne.finalMapChoice,
      boxChoice: null,
    }).save();

    await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $set: { hasRoundTwoStarted: true },
      }
    );

    res.status(201).json({
      message: "Round Two Started Succesfully",
      startTime: roundTwo.startTime,
      endTime: roundTwo.endTime,
      mapChoice: roundOne.finalMapChoice,
    });
  }
});

exports.submitSelection = catchAsync(async (req, res, next) => {
  const { error } = roundTwoBoxChoiceValidationSchema(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const team = await Team.findOne({ _id: req.params.teamId });

  if (!team) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the Team or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  if (!team.isTeamQualified) {
    return next(
      new AppError("Team is not qualified", 412, errorCodes.TEAM_NOT_QUALIFIED)
    );
  }

  let roundTwo = await RoundTwoModel.findOne({ teamId: req.params.teamId });
  if (!team.hasRoundTwoStarted) {
    return next(
      new AppError(
        "Round Two Not Started",
        412,
        errorCodes.ROUND_TWO_NOT_STARTED
      )
    );
  }

  if (team.hasRoundTwoEnd) {
    return next(
      new AppError("Round Two Completed", 412, errorCodes.ROUND_TWO_COMPLETED)
    );
  }

  if (roundTwo.endTime < Date.now()) {
    await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $set: { hasRoundTwoEnd: true },
      }
    );
    return next(
      new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
    );
  }

  const boxChoice = req.body.boxChoice;
  const mapChoice = roundTwo.mapChoice;
  const score = roundTwoScores[mapChoice][boxChoice];
  roundTwo = await RoundTwoModel.findOneAndUpdate(
    {
      teamId: req.params.teamId,
    },
    {
      $set: { boxChoice: boxChoice, roundTwoScore: score },
    }
  );

  await Team.findOneAndUpdate(
    {
      _id: req.params.teamId,
    },
    {
      $set: { hasRoundTwoEnd: true, roundTwoScore: score },
    }
  );

  res.status(201).json({
    message: "Box Choice Saved Sucessfully",
  });
});
