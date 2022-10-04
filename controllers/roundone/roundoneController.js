const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const RoundOneModel = require("../../models/roundoneModel")
const Team = require("../../models/teamModel");
const {
    errorCodes,
    objectIdLength
} = require("../../utils/constants");
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


    let roundOne = await RoundOneModel.findOne({ teamId: req.params.teamId });
    if (roundOne) {
        return next(
            new AppError(
                "Response was already recieved and saved",
                412,
                errorCodes.ROUNDONE_RESPONSE_ALREADY_SUBMITTED,

            )
        );

    }
    const mapChoice = (req.body.mapChoice);
    console.log(mapChoice);
    let score = 0;


    if (mapChoice == "Temple") {
        console.log("Hospital True");
    }


    if (!roundOne) {



        if ((mapChoice === "Temple") || (mapChoice === "Beach") || (mapChoice === "Tech-Park")) {
            score = 100;
        }
        if ((mapChoice === "Hospital") || (mapChoice === "School")) {
            score = 0;
        }


        roundOne = await new RoundOneModel({
            teamId: req.params.teamId,
            startTime: Date.now(),
            score: score,
            mapChoice: mapChoice
        }).save();

    }
    if ((mapChoice === "Temple") || (mapChoice === "Beach") || (mapChoice === "Tech-Park")) {


        res.status(201).json(
            {
                message: "Map Choice Saved: Success",
                map: `${mapChoice}`
            })
    }
    if ((mapChoice === "Hospital") || (mapChoice === "School")) {
        res.status(201).json(
            {
                message: "Map Choice Saved: Success",
                map: "Temple",
            })
    }

});


