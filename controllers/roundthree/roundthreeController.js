const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const RoundOneModel = require("../../models/roundoneModel")
const Team = require("../../models/teamModel");
const {
    errorCodes,
    objectIdLength
} = require("../../utils/constants");
const { roundThreeValidationVerifySchema } = require("./validationSchema");


exports.getDetails = catchAsync(async (req, res, next) => {
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

    let mapChoice;

    let roundThree = await RoundOneModel.findOne({ teamId: req.params.teamId });
    if (roundThree.roundthreeDone === true) {
        return next(
            new AppError(
                "Response was already recieved and saved for this round.",
                412,
                errorCodes.ROUND_RESPONSE_ALREADY_SUBMITTED,
            )
        );
    }
    console.log(roundThree.roundthreeItems);
    await RoundOneModel.findOneAndUpdate(
        {
            teamId: req.params.teamId,
        },
        {
            $set: { "roundthreeBalance": 5000 },
        }
    )

    mapChoice = roundThree.finalmapChoice;

    if (mapChoice === "Temple") {
        res.status(201).json({
            ammenities: [
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
            ],
            availableBalance: `${roundThree.roundthreeBalance}`,
            selectedItems: `${roundThree.roundthreeItems}`
        })
    }
    if (mapChoice === "Beach") {
        res.status(201).json({
            ammenities: [
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
            ],
            availableBalance: `${roundThree.roundthreeBalance}`,
            selectedItems: `${roundThree.roundthreeItems}`
        })
    }
    if (mapChoice === "Tech-Park") {
        res.status(201).json({
            ammenities: [
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
                {
                    name: "a", price: 100
                },
            ],
            availableBalance: `${roundThree.roundthreeBalance}`,
            selectedItems: `${roundThree.roundthreeItems}`
        })
    }

})

exports.verifyOption = catchAsync(async (req, res, next) => {

    const { error } = roundThreeValidationVerifySchema(req.body);
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

    let roundThree = await RoundOneModel.findOne({ teamId: req.params.teamId });
    if (roundThree.roundThreeDone === 1) {
        return next(
            new AppError(
                "Response was already recieved and saved for this round.",
                412,
                errorCodes.ROUND_RESPONSE_ALREADY_SUBMITTED,
            )
        );
    }

    let operation = req.body.operation;
    let item = req.body.item;
    let price = req.body.price;

    if ((operation != "Add") && (operation != "Delete")) {

        return next(
            new AppError(
                "Operation is invalid",
                412,
                errorCodes.INVALID_OPERATION_RESPONSE,
            )
        );
    }

    if (operation === "Add") {
        if (price > roundThree.roundthreeBalance) {
            res.status(201).json({
                message: "No sufficient balance."
            })
        }
        if (price < roundThree.roundthreeBalance) {
            console.log("Second");
            await RoundOneModel.findOneAndUpdate(
                {
                    teamId: req.params.teamId,
                },
                {
                    $push: { "roundthreeItems": item },
                    $inc: { "roundthreeBalance": -price }
                }

            )

            roundThreeUpdated = await RoundOneModel.findOne({ teamId: req.params.teamId });
            res.status(201).json({
                message: "Item added successfully.",
                availableBalance: `${roundThreeUpdated.roundthreeBalance}`
            })

        }
    }

    else if (operation === "Delete") {
        await RoundOneModel.findOneAndUpdate(
            {
                teamId: req.params.teamId,
            },
            {
                $pull: { "roundthreeItems": item },
                $inc: { "roundthreeBalance": price }
            }

        )

        roundThreeUpdated = await RoundOneModel.findOne({ teamId: req.params.teamId });


        res.status(201).json({
            message: "Item deleted successfully",
            availableBalance: `${roundThreeUpdated.roundthreeBalance}`
        })
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

    await RoundOneModel.findOneAndUpdate(
        {
            teamId: req.params.teamId,
        },
        {
            $set: { "roundthreeDone": 1 },
        }

    )

    res.status(201).json({
        message: "Round Submitted successfully."
    })

})