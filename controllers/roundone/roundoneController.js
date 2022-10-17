const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const RoundOneModel = require("../../models/roundoneModel");
const Team = require("../../models/teamModel");
const { errorCodes, objectIdLength, maps } = require("../../utils/constants");
const { roundOneValidationMapSchema } = require("./validationSchema");

exports.startRoundOne = catchAsync(async (req, res, next) => {
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

  if (team.hasRoundOneEnd) {
    return next(
      new AppError("Round 1 Completed", 412, errorCodes.ROUND_ONE_COMPLETED)
    );
  }

  let roundOne = await RoundOneModel.findOne({ teamId: req.params.teamId });
  if (roundOne) {
    if (roundOne.endTime < Date.now()) {
      await RoundOneModel.findOneAndUpdate(
        {
          teamId: req.params.teamId,
        },
        {
          $set: { finalMapChoice: maps.TEMPLE, roundOneScore: 0 },
        }
      );

      await Team.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          $set: { hasRoundOneEnd: true },
        }
      );
      return next(
        new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
      );
    } else {
      res.status(201).json({
        message: "Round One Already Started Succesfully",
        startTime: roundOne.startTime,
        endTime: roundOne.endTime,
      });
    }
  } else {
    roundOne = await new RoundOneModel({
      teamId: req.params.teamId,
      startTime: Date.now(),
      endTime: Date.now() + 420000,
      roundOneScore: null,
      mapChoice: null,
      finalMapChoice: null,
    }).save();

    await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $set: { hasRoundOneStarted: true },
      }
    );
    res.status(201).json({
      message: "Round One Started Succesfully",
      startTime: roundOne.startTime,
      endTime: roundOne.endTime,
    });
  }
});

exports.submitSelection = catchAsync(async (req, res, next) => {
  const { error } = roundOneValidationMapSchema(req.body);
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

  let roundOne = await RoundOneModel.findOne({ teamId: req.params.teamId });
  if (!team.hasRoundOneStarted) {
    return next(
      new AppError(
        "Round One Not Started",
        412,
        errorCodes.ROUND_ONE_NOT_STARTED
      )
    );
  }

  if (team.hasRoundOneEnd) {
    return next(
      new AppError(
        "Round One Already Completed",
        412,
        errorCodes.ROUND_ONE_COMPLETED
      )
    );
  }

  if (roundOne.endTime < Date.now()) {
    await RoundOneModel.findOneAndUpdate(
      {
        teamId: req.params.teamId,
      },
      {
        $set: { finalMapChoice: maps.TEMPLE, roundOneScore: 0 },
      }
    );

    await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $set: { hasRoundOneEnd: true },
      }
    );
    return next(
      new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
    );
  }

  let score = 0;
  const mapChoice = req.body.mapChoice;
  if (
    mapChoice === maps.TEMPLE ||
    mapChoice === maps.BEACH ||
    mapChoice === maps.TECHPARK
  ) {
    score = 5;
    roundOne = await RoundOneModel.findOneAndUpdate(
      {
        teamId: req.params.teamId,
      },
      {
        $set: {
          mapChoice: mapChoice,
          finalMapChoice: mapChoice,
          roundOneScore: 5,
        },
      }
    );
  }

  if (
    mapChoice === maps.HOSPITAL ||
    mapChoice === maps.SCHOOL ||
    mapChoice === maps.NONE
  ) {
    score = 0;
    roundOne = await RoundOneModel.findOneAndUpdate(
      {
        teamId: req.params.teamId,
      },
      {
        $set: {
          mapChoice: mapChoice,
          finalMapChoice: maps.TEMPLE,
          roundOneScore: 0,
        },
      }
    );
  }

  await Team.findOneAndUpdate(
    {
      _id: req.params.teamId,
    },
    {
      $set: { hasRoundOneEnd: true, roundOneScore: score },
    }
  );

  res.status(201).json({
    message: "Map Choice Saved Sucessfully",
  });
});

exports.getMap = catchAsync(async (req, res, next) => {
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
  if (!team.hasRoundOneStarted) {
    return next(
      new AppError(
        "Round One Not Started",
        412,
        errorCodes.ROUND_ONE_NOT_STARTED
      )
    );
  }

  roundOne = await RoundOneModel.findOne({
    teamId: req.params.teamId,
  });

  res.status(201).json({
    message: "Map Choice Sent Sucessfully",
    mapChoice: roundOne.finalMapChoice,
  });
});
