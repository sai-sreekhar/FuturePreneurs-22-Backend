const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const RoundOneModel = require("../../models/roundoneModel");
const RoundThreeModel = require("../../models/roundthreeModel");
const RoundThreeDataModel = require("../../models/roundThreeDataModel");
const Team = require("../../models/teamModel");
const {
  errorCodes,
  objectIdLength,
  roundThreeAmount,
  roundThreeOperations,
} = require("../../utils/constants");
const { roundThreeValidationSchema } = require("./validationSchema");

exports.startRoundThree = catchAsync(async (req, res, next) => {
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
  if (!team.hasRoundOneEnd || !team.hasRoundTwoEnd) {
    return next(
      new AppError(
        "Previous Rounds Not Completed",
        412,
        errorCodes.PREVIOUS_ROUNDS_NOT_DONE
      )
    );
  }

  if (team.hasRoundThreeEnd) {
    return next(
      new AppError(
        "Round Three Completed",
        412,
        errorCodes.ROUND_THREE_COMPLETED
      )
    );
  }

  const roundThreeData = await RoundThreeDataModel.find(
    {},
    { mapChoice: 0, score: 0, __v: 0 }
  );

  let roundThree = await RoundThreeModel.findOne({ teamId: req.params.teamId });
  if (roundThree) {
    if (roundThree.endTime < Date.now()) {
      return next(
        new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
      );
    } else {
      await RoundThreeModel.findOneAndUpdate(
        { teamId: req.params.teamId },
        {
          $set: {
            balance: roundThreeAmount[roundOne.finalMapChoice],
            roundThreeScore: 0,
            items: [],
          },
        }
      );
      res.status(201).json({
        message: "Round Three Already Started Succesfully",
        startTime: roundThree.startTime,
        endTime: roundThree.endTime,
        mapChoice: roundThree.mapChoice,
        roundThreeData,
        balance: roundThreeAmount[roundOne.finalMapChoice],
      });
    }
  } else {
    roundThree = await new RoundThreeModel({
      teamId: req.params.teamId,
      startTime: Date.now(),
      endTime: Date.now() + 900000,
      mapChoice: roundOne.finalMapChoice,
      balance: roundThreeAmount[roundOne.finalMapChoice],
      roundThreeScore: 0,
    }).save();

    await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $set: { hasRoundThreeStarted: true },
      }
    );

    res.status(201).json({
      message: "Round Three Started Succesfully",
      startTime: roundThree.startTime,
      endTime: roundThree.endTime,
      mapChoice: roundThree.mapChoice,
      roundThreeData,
      balance: roundThree.balance,
    });
  }
});

exports.addOrDeleteItems = catchAsync(async (req, res, next) => {
  const { error } = roundThreeValidationSchema(req.body);
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

  if (team.hasRoundThreeEnd) {
    return next(
      new AppError(
        "Round Three Completed",
        412,
        errorCodes.ROUND_THREE_COMPLETED
      )
    );
  }

  let roundThree = await RoundThreeModel.findOne({ teamId: req.params.teamId });
  if (!team.hasRoundThreeStarted) {
    return next(
      new AppError(
        "Round Three Not Started",
        412,
        errorCodes.ROUND_THREE_NOT_STARTED
      )
    );
  }

  if (roundThree.endTime < Date.now()) {
    return next(
      new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
    );
  }

  let operation = req.body.operation;
  let item = req.body.item;

  if (
    operation != roundThreeOperations.ADD &&
    operation != roundThreeOperations.DELETE
  ) {
    return next(
      new AppError("Operation is invalid", 412, errorCodes.INVALID_OPERATION)
    );
  }

  const itemData = await RoundThreeDataModel.findOne({ item: item });
  // console.log(itemData);
  let score = 0;
  if (itemData.mapChoice === roundThree.mapChoice) {
    score = itemData.score;
  }

  if (operation === roundThreeOperations.ADD) {
    if (roundThree.items && roundThree.items.length === 10) {
      return next(
        new AppError("Items Limit Reached", 412, errorCodes.ITEMS_LIMIT_REACHED)
      );
    }

    if (itemData.price > roundThree.balance) {
      return next(
        new AppError("Balance Exceeded", 412, errorCodes.BALANCE_EXCEEDED)
      );
    } else {
      await RoundThreeModel.findOneAndUpdate(
        {
          teamId: req.params.teamId,
        },
        {
          $push: { items: itemData.item },
          $inc: { balance: -itemData.price, roundThreeScore: score },
        }
      );

      res.status(201).json({
        message: "Item added successfully.",
        availableBalance: roundThree.balance - itemData.price,
      });
    }
  } else if (operation === roundThreeOperations.DELETE) {
    await RoundThreeModel.findOneAndUpdate(
      {
        teamId: req.params.teamId,
      },
      {
        $pull: { items: itemData.item },
        $inc: { balance: itemData.price, roundThreeScore: -score },
      }
    );

    res.status(201).json({
      message: "Item deleted successfully",
      availableBalance: roundThree.balance + itemData.price,
    });
  }
});

exports.submitRound = catchAsync(async (req, res, next) => {
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

  if (team.hasRoundThreeEnd) {
    return next(
      new AppError(
        "Round Three Completed",
        412,
        errorCodes.ROUND_THREE_COMPLETED
      )
    );
  }

  let roundThree = await RoundThreeModel.findOne({ teamId: req.params.teamId });
  if (!team.hasRoundThreeStarted) {
    return next(
      new AppError(
        "Round Three Not Started",
        412,
        errorCodes.ROUND_THREE_NOT_STARTED
      )
    );
  }

  if (roundThree.endTime < Date.now()) {
    await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $set: { hasRoundThreeEnd: true, currentRound: 20 },
      }
    );
    return next(
      new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
    );
  }

  await Team.findOneAndUpdate(
    {
      _id: req.params.teamId,
    },
    {
      $set: {
        hasRoundThreeEnd: true,
        currentRound: 20,
        roundThreeScore: roundThree.roundThreeScore,
        totalScore:
          team.roundOneScore + team.roundTwoScore + roundThree.roundThreeScore,
      },
    }
  );

  res.status(201).json({
    message: "Round Three Submitted successfully.",
  });
});
