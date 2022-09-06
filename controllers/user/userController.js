const User = require("../../models/userModel");
const Team = require("../../models/teamModel");
const PendingApprovalsModel = require("../../models/pendingApprovalsModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  errorCodes,
  requestStatusTypes,
  teamRole,
  objectIdLength,
} = require("../../utils/constants");
const {
  updateUserBodyValidation,
  joinTeamViaTokenBodyValidation,
} = require("./validationSchema");
const { verifyTeamToken } = require("./utils");

exports.sendRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //validate team id
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const team = await Team.findById({ _id: req.params.teamId });

  if (!team) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //checking whether user is already a part of team
  if (user.teamId) {
    return next(
      new AppError(
        "User already part of a team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  if (team.members.length === 4) {
    return next(
      new AppError(
        "Team is Full. Can't Send Request",
        412,
        errorCodes.TEAM_IS_FULL
      )
    );
  }

  //checking whether request is already sent and is pending
  const request = await PendingApprovalsModel.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (request) {
    return next(
      new AppError(
        "Request already sent. Approval Pending",
        412,
        errorCodes.REQUEST_ALREADY_SENT
      )
    );
  }

  const newRequest = await new PendingApprovalsModel({
    teamId: req.params.teamId,
    userId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  }).save();

  res.status(201).json({
    message: "Sent request successfully",
    requestId: newRequest._id,
  });
});

exports.getRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //checking whether user is already a part of team
  if (user.teamId) {
    return next(
      new AppError(
        "User already part of a team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const requests = await PendingApprovalsModel.find({
    userId: req.user._id,
  }).populate({
    path: "teamId",
    populate: { path: "members", select: "name email mobileNumber" },
  });

  res.status(200).json({
    message: "Get user requests successfull",
    requests,
  });
});

exports.removeRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //validate team id
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const team = await Team.findById({ _id: req.params.teamId });

  if (!team) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //checking whether user is already a part of team
  if (user.teamId) {
    return next(
      new AppError(
        "User already part of a team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //checking whether pending request is found
  const request = await PendingApprovalsModel.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (!request) {
    return next(
      new AppError(
        "No pending request found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  await PendingApprovalsModel.updateOne(
    { userId: req.user._id, teamId: req.params.teamId },
    { $set: { status: requestStatusTypes.REQUEST_TAKEN_BACK } }
  );

  res.status(201).json({
    message: "Removed request successfully",
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = updateUserBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  //updating fields
  if (req.body.name) {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { name: req.body.name } }
    );
  }

  if (req.body.regNo) {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { regNo: req.body.regNo } }
    );
  }

  if (req.body.photoUrl) {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { photoUrl: req.body.photoUrl } }
    );
  }

  if (req.body.mobileNumber) {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { mobileNumber: req.body.mobileNumber } }
    );
  }

  res.status(201).json({
    message: "User updated successfully",
    userId: req.user._id,
  });
});

exports.leaveTeam = catchAsync(async (req, res, next) => {
  //validating teamid
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const team = await Team.findById({ _id: req.params.teamId }).populate([
    "teamLeaderId",
    "members",
  ]);

  //validate team id
  if (!team) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const user = await User.findById({ _id: req.user._id });

  //check if user is part of given team
  if (user.teamId == null || user.teamId.toString() !== req.params.teamId) {
    return next(
      new AppError(
        "User is not part of given teamID or user isn't part of any team",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID
      )
    );
  }

  //check the role. Leader can leave team remove members and delete team.
  if (user.teamRole === teamRole.LEADER) {
    return next(
      new AppError("User is a Leader", 412, errorCodes.USER_IS_LEADER)
    );
  }

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { teamId: null, teamRole: null }
  );

  await Team.findOneAndUpdate(
    { _id: req.params.teamId },
    { $pull: { members: req.user._id } }
  );

  await PendingApprovalsModel.findOneAndUpdate(
    {
      userId: req.user._id,
      teamId: req.params.teamId,
      status: requestStatusTypes.APPROVED,
    },
    {
      $set: { status: requestStatusTypes.LEFT_TEAM },
    }
  );

  res.status(201).json({
    error: false,
    message: "Leaving team successfull",
  });
});

exports.joinTeamViaToken = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = joinTeamViaTokenBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findById({ _id: req.user._id });

  // if user  is already in a team
  if (user.teamId) {
    return next(
      new AppError(
        "User already part of a team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  verifyTeamToken(req.body.token)
    .then(async ({ teamTokenDetails }) => {
      const team = await Team.findById({ _id: teamTokenDetails._id });

      if (team.members.length === 4) {
        return next(new AppError("Team is Full", 412, errorCodes.TEAM_IS_FULL));
      }

      //updating users teamid and role
      await User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        { $set: { teamId: team._id, teamRole: teamRole.MEMBER } }
      );

      //updating pending approvals model of particular team id to a status
      await PendingApprovalsModel.findOneAndUpdate(
        {
          teamId: team._id,
          userId: req.user._id,
          status: requestStatusTypes.PENDING_APPROVAL,
        },
        { $set: { status: requestStatusTypes.JOINED_VIA_TOKEN } }
      );

      //updating pending approvals model of all other team ids to added to other team
      await PendingApprovalsModel.updateMany(
        {
          userId: req.user._id,
          status: requestStatusTypes.PENDING_APPROVAL,
        },
        { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
      );

      //updating team
      await Team.findOneAndUpdate(
        {
          _id: team._id,
        },
        {
          $push: { members: req.user._id },
        }
      );

      res.status(201).json({
        message: "Joined team successfully",
        teamId: team._id,
      });
    })
    .catch((err) => {
      return next(
        new AppError("Invalid Team Token", 412, errorCodes.INVALID_TEAM_TOKEN)
      );
    });
});

//--------------------------------------------------------->

exports.getTeam = catchAsync(async (req, res, next) => {
  const user = await User.findById(
    { _id: req.user._id },
    { name: 1, email: 1, mobileNumber: 1 }
  ).populate({
    path: "teamId",
    select: { teamName: 1 },
    populate: {
      path: "members",
      model: "Users",
      select: { name: 1, mobileNumber: 1, email: 1, _id: 0 },
    },
  });

  res.status(200).json({
    message: "Getting user team details successfull",
    user,
  });
});