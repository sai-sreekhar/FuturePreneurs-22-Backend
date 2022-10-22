const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const RoundOneModel = require("../../models/roundoneModel");
const Team = require("../../models/teamModel");
const { errorCodes, objectIdLength, maps } = require("../../utils/constants");
const { nextRoundsValidationSchema } = require("./validationSchema");

exports.getCurrRound = catchAsync(async (req, res, next) => {
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

  if (!team.hasRoundOneEnd || !team.hasRoundTwoEnd || !team.hasRoundThreeEnd) {
    return next(
      new AppError(
        "Previous Rounds Not Completed",
        412,
        errorCodes.PREVIOUS_ROUNDS_NOT_DONE
      )
    );
  }

  res.status(201).json({
    message: "Current Round Sent Succesfully",
    currentRound: team.currentRound,
  });
});

exports.setCurrRound = catchAsync(async (req, res, next) => {
  const { error } = nextRoundsValidationSchema(req.body);
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

  if (!team.hasRoundOneEnd || !team.hasRoundTwoEnd || !team.hasRoundThreeEnd) {
    return next(
      new AppError(
        "Previous Rounds Not Completed",
        412,
        errorCodes.PREVIOUS_ROUNDS_NOT_DONE
      )
    );
  }

  if (req.body.nextRound === 28) {
    await Team.findOneAndUpdate(
      { _id: req.params.teamId },
      { currentRound: req.body.nextRound, hasLastRoundEnd: true }
    );
  } else {
    await Team.findOneAndUpdate(
      { _id: req.params.teamId },
      { currentRound: req.body.nextRound }
    );
  }

  res.status(201).json({
    message: "Next Round Set Succesfully",
    currentRound: req.body.nextRound,
  });
});
