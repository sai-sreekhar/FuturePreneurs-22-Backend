const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const RoundOneModel = require("../../models/roundoneModel");
const Team = require("../../models/teamModel");
const { errorCodes, objectIdLength, maps } = require("../../utils/constants");
const { roundOneValidationMapSchema } = require("./validationSchema");

// exports.getOptions = catchAsync(async (req, res, next) => {
//     if (req.params.teamId.length !== objectIdLength) {
//         return next(
//             new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
//         );
//     }

//     const team = await Team.findOne({ _id: req.params.teamId });

//     if (!team) {
//         return next(
//             new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
//         );
//     }

//     if (team.teamLeaderId.toString() !== req.user._id) {
//         return next(
//             new AppError(
//                 "User doesn't belong to the Team or User isn't a Leader",
//                 412,
//                 errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
//             )
//         );
//     }

//     let roundOne = await RoundOneModel.findOne({ teamId: req.params.teamId });
//     if (!roundOne) {
//         roundOne = await new RoundOneModel({
//             teamId: req.params.teamId,
//             startTime: Date.now(),
//             score: 0,
//         }).save();
//     }

//     res.status(201).json({
//         message: "Get Options Success",
//         optionOne: "Young",
//         optionTwo: "Old",
//         optionThree: "Business"

//     });
// });

// exports.submitOption = catchAsync(async (req, res, next) => {

//     console.log(req.body);
//     const { error } = roundOneValidationCategorySchema(req.body);
//     if (error) {
//         return next(
//             new AppError(
//                 error.details[0].message,
//                 400,
//                 errorCodes.INPUT_PARAMS_INVALID
//             )
//         );
//     }

//     if (req.params.teamId.length !== objectIdLength) {
//         return next(
//             new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
//         );
//     }

//     const team = await Team.findOne({ _id: req.params.teamId });

//     if (!team) {
//         return next(
//             new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
//         );
//     }

//     if (team.teamLeaderId.toString() !== req.user._id) {
//         return next(
//             new AppError(
//                 "User doesn't belong to the Team or User isn't a Leader",
//                 412,
//                 errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
//             )
//         );
//     }

//     let roundOne = await RoundOneModel.findOne({ teamId: req.params.teamId });
//     if (!roundOne) {
//         return next(
//             new AppError(
//                 "User doesn't belong to the Team or User isn't a Leader",
//                 412,
//                 errorCodes.ROUNDONE_RESPONSE_BEFORE_START,

//             )
//         );

//     }

//     if (roundOne) {
//         await RoundOneModel.findOneAndUpdate(
//             {
//                 teamId: req.params.teamId,
//             },
//             {
//                 $set: { "categoryChoice": req.body.categoryChoice },
//             }
//         );
//     }

//     res.status(201).json({
//         message: "Category Choice Saved: Success",
//     })

// });

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

  let roundOne = await RoundOneModel.findOne({ teamId: req.params.teamId });
  if (roundOne) {
    return next(
      new AppError(
        "Round One Already Started",
        412,
        errorCodes.ROUND_ONE_ALREADY_STARTED
      )
    );
  } else {
    roundOne = await new RoundOneModel({
      teamId: req.params.teamId,
      startTime: Date.now(),
      endTime: Date.now() + 180000,
      roundOneScore: 0,
      mapChoice: null,
      finalMapChoice: null,
    }).save();
  }

  res.status(201).json({
    message: "Round One Started Succesfully",
    startTime: roundOne.startTime,
    endTime: roundOne.endTime,
  });
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
  if (!roundOne) {
    return next(
      new AppError(
        "Round One Document Not Found",
        412,
        errorCodes.ROUND_ONE_NOT_DOUND
      )
    );
  }

  if (roundOne.finalMapChoice) {
    return next(
      new AppError(
        "Round One Map Already Submitted",
        412,
        errorCodes.ROUND_ONE_MAP_ALREADY_SUMBMTTED
      )
    );
  }
  
  if (roundOne.endTime < Date.now()) {
    await RoundOneModel.findOneAndUpdate(
      {
        teamId: req.params.teamId,
      },
      {
        $set: { finalMapChoice: maps.TEMPLE },
      }
    );
    return next(
      new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
    );
  }

  

  const mapChoice = req.body.mapChoice;
  if (
    mapChoice === maps.TEMPLE ||
    mapChoice === maps.BEACH ||
    mapChoice === maps.TECHPARK
  ) {
    roundOne = await RoundOneModel.findOneAndUpdate(
      {
        teamId: req.params.teamId,
      },
      {
        $set: { finalMapChoice: mapChoice, roundOneScore: 100 },
      }
    );
  }

  if (
    mapChoice === maps.HOSPITAL ||
    mapChoice === maps.SCHOOL ||
    mapChoice === maps.NONE
  ) {
    roundOne = await RoundOneModel.findOneAndUpdate(
      {
        teamId: req.params.teamId,
      },
      {
        $set: { finalMapChoice: maps.TEMPLE },
      }
    );
  }

  res.status(201).json({
    message: "Map Choice Saved Sucessfully",
  });
});
