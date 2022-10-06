const User = require("../../models/userModel");
const { OAuth2Client } = require("google-auth-library");
const Team = require("../../models/teamModel");
const PendingApprovalsModel = require("../../models/pendingApprovalsModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  errorCodes,
  requestStatusTypes,
  teamRole,
  objectIdLength,
  // SESConfig,
} = require("../../utils/constants");
const {
  updateUserBodyValidation,
  joinTeamViaTokenBodyValidation,
  fillUserDetailsBodyValidation,
  hasFilledDetailsBodyValidation,
} = require("./validationSchema");
const { verifyTeamToken } = require("./utils");
const client = new OAuth2Client(process.env.CLIENT_ID);
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { transporter } = require("../../utils/nodemailer");
// const AWS = require("aws-sdk");

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

  if (user.noOfPendingRequests >= 5) {
    return next(
      new AppError(
        "Can't send more than 5 requests",
        412,
        errorCodes.PENDING_REQUESTS_LIMIT_REACHED
      )
    );
  }

  //checking whether user is already a part of team
  if (user.teamId) {
    return next(
      new AppError(
        "User already part of a Team",
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

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $inc: { noOfPendingRequests: 1 },
    }
  );

  const teamLeader = await User.findById({ _id: team.teamLeaderId });

  transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: teamLeader.email,
    subject: "FUTUREPRENEURS-ECELL-VIT. Pending Approval From a Participant",
    html:
      user.firstName +
      " " +
      user.lastName +
      " " +
      "has sent a request to join your team " +
      team.teamName +
      ".<br>" +
      "To Approve or reject the request click on the link https://fp.ecellvit.com/.<br>" +
      user.firstName +
      " " +
      user.lastName +
      "'s Mobile Number: " +
      user.mobileNumber +
      "<br>" +
      user.firstName +
      " " +
      user.lastName +
      "'s Email: " +
      user.email,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
      expires: 3599,
    },
  });
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
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const requests = await PendingApprovalsModel.find({
    userId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  }).populate({
    path: "teamId",
    select: "teamName teamLeaderId members",
    populate: {
      path: "teamName teamLeaderId",
      select: "email firstName lastName regNo mobileNumber teamRole",
    },
  });

  res.status(200).json({
    message: "Get User Requests Successfull",
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
        "User already part of a Team",
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
        "No Pending Request Found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  await PendingApprovalsModel.updateOne(
    {
      userId: req.user._id,
      teamId: req.params.teamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    },
    { $set: { status: requestStatusTypes.REQUEST_TAKEN_BACK } }
  );

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $inc: { noOfPendingRequests: -1 },
    }
  );

  res.status(201).json({
    message: "Removed Request Successfully",
  });
});

exports.fillUserDetails = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = fillUserDetailsBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        regNo: req.body.regNo,
        mobileNumber: req.body.mobileNumber,
        hasFilledDetails: true,
      },
    }
  );

  res.status(201).json({
    message: "User Details Filled successfully",
    userId: req.user._id,
  });
});

exports.hasFilledDetails = catchAsync(async (req, res, next) => {
  const { error } = hasFilledDetailsBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const token = req.body.token;
  const emailFromClient = req.body.email;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  if (!ticket) {
    return next(
      new AppError(
        "Please SignOut and SignIn Again",
        401,
        errorCodes.INVALID_TOKEN
      )
    );
  }

  const { email } = ticket.getPayload();
  if (email !== emailFromClient) {
    return next(
      new AppError(
        "Please SignOut and SignIn Again",
        401,
        errorCodes.INVALID_TOKEN
      )
    );
  }

  const user = await User.findOne({ email: emailFromClient });

  return res.status(201).json({
    message: "Checking User Successfull",
    teamId: user.teamId,
    hasFilledDetails: user.hasFilledDetails,
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
  if (req.body.firstName) {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { firstName: req.body.firstName } }
    );
  }

  if (req.body.lastName) {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { lastName: req.body.lastName } }
    );
  }

  if (req.body.regNo) {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { regNo: req.body.regNo } }
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
        "User is not part of given TeamID or user isn't part of any Team",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID
      )
    );
  }

  //check the role. Leader can leave team remove members and delete team.
  if (user.teamRole === teamRole.LEADER) {
    return next(
      new AppError(
        "Leader can't Leave the Team",
        412,
        errorCodes.USER_IS_LEADER
      )
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
      $or: [
        { status: requestStatusTypes.APPROVED },
        { status: requestStatusTypes.JOINED_VIA_TOKEN },
      ],
    },
    {
      $set: { status: requestStatusTypes.LEFT_TEAM },
    }
  );

  res.status(201).json({
    error: false,
    message: "Leaving Team Successfull",
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
        "User already part of a Team",
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
        {
          $set: {
            teamId: team._id,
            teamRole: teamRole.MEMBER,
            noOfPendingRequests: 0,
          },
        }
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
        message: "Joined Team Successfully",
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
    {
      email: 1,
      firstName: 1,
      lastName: 1,
      regNo: 1,
      mobileNumber: 1,
      teamRole: 1,
      isQualified: 1,
    }
  ).populate({
    path: "teamId",
    select: { teamName: 1, isTeamQualified: 1 },
    populate: {
      path: "members",
      model: "Users",
      select: {
        email: 1,
        firstName: 1,
        lastName: 1,
        regNo: 1,
        mobileNumber: 1,
        teamRole: 1,
        isQualified: 1,
      },
    },
  });

  res.status(200).json({
    message: "Getting User Team Details Successfull",
    user,
  });
});
