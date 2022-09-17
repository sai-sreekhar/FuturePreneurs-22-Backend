const User = require("../../models/userModel");
const Team = require("../../models/teamModel");
const PendingApprovalsModel = require("../../models/pendingApprovalsModel");
const TeamQuizModel = require("../../models/teamQuizModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const nodemailer = require("nodemailer");
const {
  errorCodes,
  requestStatusTypes,
  teamRole,
  approvalStatusTypes,
  objectIdLength,
  noOfQuestionsToAnswer,
  quizId,
  // SESConfig,
} = require("../../utils/constants");
const {
  createTeamBodyValidation,
  updateTeamBodyValidation,
  updateRequestBodyValidation,
  removeMemberBodyValidation,
  submitAnswerValidtionSchema,
} = require("./validationSchema");
const { generateTeamToken } = require("./utils");
const QuestionsModel = require("../../models/questionsModel");
const QuizModel = require("../../models/quizModel");
const AnswersModel = require("../../models/answersModel");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { transporter } = require("../../utils/nodemailer");
// const AWS = require("aws-sdk");

exports.createTeam = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = createTeamBodyValidation(req.body);
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

  //check whether teamname already taken
  const team = await Team.findOne({ teamName: req.body.teamName });
  if (team) {
    return next(
      new AppError("TeamName Already Exists", 412, errorCodes.TEAM_NAME_EXISTS)
    );
  }

  //if user is already in a team
  if (user.teamId || user.teamRole) {
    return next(
      new AppError(
        "User Already Part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const request = await PendingApprovalsModel.findOne({
    userId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  //user shouldnt have pending requests
  if (request) {
    return next(
      new AppError(
        "Remove Requests Sent to other Teams to Create a NewTeam",
        412,
        errorCodes.USER_HAS_PENDING_REQUESTS
      )
    );
  }

  const newTeam = await new Team({
    teamName: req.body.teamName,
    teamLeaderId: req.user._id,
    members: [req.user._id],
  }).save();

  await User.updateMany(
    { _id: req.user._id },
    { $set: { teamId: newTeam._id, teamRole: teamRole.LEADER } }
  );

  res.status(201).json({
    message: "New Team Created Successfully",
    teamId: newTeam._id,
  });
});

exports.getTeamDetails = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const team = await Team.findById(
    { _id: req.params.teamId },
    { completedQuestions: 0 }
  ).populate("members", {
    email: 1,
    firstName: 1,
    lastName: 1,
    regNo: 1,
    mobileNumber: 1,
    teamRole: 1,
  });

  //validate team id
  if (!team) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //check if user is part of given team
  // if (user.teamId == null || user.teamId.toString() !== req.params.teamId) {
  //   return next(
  //     new AppError(
  //       "User is not part of given teamID or user isn't part of any team",
  //       412,
  //       errorCodes.INVALID_USERID_FOR_TEAMID
  //     )
  //   );
  // }

  res.status(200).json({
    message: "Getting Team Details Successfull",
    team,
  });
});

exports.updateTeam = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = updateTeamBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  //checking if team name is already taken
  const teamName = await Team.findOne({ teamName: req.body.teamName });
  if (teamName) {
    return next(
      new AppError("TeamName already exists", 412, errorCodes.TEAM_NAME_EXISTS)
    );
  }

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

  //check whether user belongs to the given team and role
  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the team or user isn't a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  await Team.updateOne(
    { _id: req.params.teamId },
    { $set: { teamName: req.body.teamName } }
  );

  res.status(201).json({
    message: "Team updated successfully",
  });
});

exports.deleteTeam = catchAsync(async (req, res, next) => {
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
  //check whether user belongs to the given team and role
  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the Team or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  //check team size
  if (team.members.length !== 1) {
    return next(
      new AppError(
        "Teamsize more than 1. Remove TeamMembers and Delete the Team",
        412,
        errorCodes.TEAMSIZE_MORE_THAN_ONE
      )
    );
  }

  await Team.findOneAndDelete({
    _id: req.params.teamId,
  });

  await User.findByIdAndUpdate(
    { _id: req.user._id },
    { teamId: null, teamRole: null }
  );

  res.status(200).json({
    message: "Team Deleted Successfully",
  });
});

exports.getTeamRequests = catchAsync(async (req, res, next) => {
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

  //check whether user belongs to the given team and role
  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the Team or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const requests = await PendingApprovalsModel.find({
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  }).populate("userId", {
    email: 1,
    firstName: 1,
    lastName: 1,
    regNo: 1,
    mobileNumber: 1,
  });

  res.status(200).json({
    message: "Get Team Requests Successfull",
    requests,
  });
});

exports.updateRequest = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = updateRequestBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

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

  //check whether user belongs to the given team and role
  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the Team or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  //check whether userid (user whose status is to be updated) is valid
  const requestedUser = await User.findById({ _id: req.body.userId });
  if (!requestedUser) {
    return next(
      new AppError(
        "Invalid UserId of Requested User",
        412,
        errorCodes.INVALID_USERID
      )
    );
  }

  // if user (user whose status is to be updated) is already in a team
  if (requestedUser.teamId) {
    return next(
      new AppError(
        "Requested User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //searching for pending request
  const request = await PendingApprovalsModel.findOne({
    userId: req.body.userId,
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

  //checking status and updtaing
  if (req.body.status === approvalStatusTypes.REJECTED) {
    await PendingApprovalsModel.updateOne(
      {
        userId: req.body.userId,
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      },
      { $set: { status: requestStatusTypes.REJECTED } }
    );

    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      {
        $inc: { noOfPendingRequests: -1 },
      }
    );
  }

  if (req.body.status === approvalStatusTypes.APPROVED) {
    //checking team size
    if (team.members.length === 4) {
      return next(new AppError("Team is Full", 412, errorCodes.TEAM_IS_FULL));
    }
    //updating users teamid and role
    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      { $set: { teamId: req.params.teamId, teamRole: teamRole.MEMBER } }
    );

    //updating pending approvals model of particular team id to approved
    await PendingApprovalsModel.findOneAndUpdate(
      {
        userId: req.body.userId,
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      },
      { $set: { status: requestStatusTypes.APPROVED } }
    );

    //updating pending approvals model of all other team ids to added to other team
    await PendingApprovalsModel.updateMany(
      {
        userId: req.body.userId,
        status: requestStatusTypes.PENDING_APPROVAL,
      },
      { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
    );

    //updating team
    await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $push: { members: req.body.userId },
      }
    );

    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      {
        noOfPendingRequests: 0,
      }
    );

    const user = await User.findById({ _id: req.body.userId });
    transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: "FUTUREPRENEURS-ECELL-VIT. Request Approved By Team",
      text:
        user.firstName +
        " " +
        user.lastName +
        " " +
        "your request is accepted by team " +
        team.teamName +
        ".Click on the link to view the Team Details https://future-preneurs-22.vercel.app/.",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
        accessToken: process.env.NODEMAILER_REFRESH_TOKEN,
        expires: 3599,
      },
    });
  }

  res.status(201).json({
    message: "Updated Request Successfully",
  });
});

exports.removeMember = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = removeMemberBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }
  //checking for invalid team id
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

  //checking whether user to remove id is valid
  const userToRemove = await User.findById({ _id: req.body.userId });
  if (!userToRemove) {
    return next(
      new AppError("Invalid UserId to Remove", 412, errorCodes.INVALID_USERID)
    );
  }

  //check whether user belongs to the given team and role
  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the team or user isn't a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  //checking whether user to remove belomgs to the team id
  if (
    userToRemove.teamId == null ||
    userToRemove.teamId.toString() !== req.params.teamId
  ) {
    return next(
      new AppError(
        "User to remove and TeamId didnt Match",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID
      )
    );
  }

  //updating user teamid and teamrole
  await User.findOneAndUpdate(
    { _id: req.body.userId },
    { teamId: null, teamRole: null }
  );

  //updating team
  await Team.findOneAndUpdate(
    { _id: req.params.teamId },
    { $pull: { members: req.body.userId } }
  );

  //updating PendingApprovalsModel
  await PendingApprovalsModel.findOneAndUpdate(
    {
      userId: req.body.userId,
      teamId: req.params.teamId,
      $or: [
        { status: requestStatusTypes.APPROVED },
        { status: requestStatusTypes.JOINED_VIA_TOKEN },
      ],
    },
    {
      $set: { status: requestStatusTypes.REMOVED_FROM_TEAM },
    }
  );

  res.status(201).json({
    message: "User Removed Successfully",
  });
});

exports.getAllTeams = catchAsync(async (req, res, next) => {
  // const startTime = Date.now();
  // const teams = await Team.find().populate("members", {
  //   name: 1,
  //   teamRole: 1,
  //   email: 1,
  //   mobileNumber: 1,
  // });
  // const endTime = Date.now();
  // console.log("Time Taken = ", endTime - startTime);
  // console.log(teams);
  res.status(201).json({
    message: "Get All Teams Successfull",
    paginatedResult: res.paginatedResults,
  });
});

exports.getTeamToken = catchAsync(async (req, res, next) => {
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

  //check whether user belongs to the given team and role
  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the Team or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const { teamToken } = await generateTeamToken(team);

  res.status(201).json({
    message: "Team Token Generated Succesfully",
    teamToken,
  });
});

//Quiz Part
exports.getQuestion = catchAsync(async (req, res, next) => {
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

  //check whether user belongs to the given team and role
  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the Team or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  let teamQuiz = await TeamQuizModel.findOne({ teamId: req.params.teamId });
  if (!teamQuiz) {
    teamQuiz = await new TeamQuizModel({
      teamId: req.params.teamId,
      startTime: Date.now(),
      endTime: Date.now() + 900001,
      score: 0,
    }).save();
  }

  if (teamQuiz.endTime < Date.now()) {
    return next(
      new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
    );
  }

  if (team.completedQuestions.length === noOfQuestionsToAnswer) {
    return next(
      new AppError(
        "Maximum Questions capacity reached",
        412,
        errorCodes.MAX_QUESTIONS_REACHED
      )
    );
  }
  const quizModel = await QuizModel.findById({ _id: quizId });

  const totalQuestions = quizModel.questionIds.length;
  let questionIdx = Math.floor(Math.random() * totalQuestions);
  let curQuestionId = quizModel.questionIds[questionIdx];

  let idxCount = 0;
  while (
    team.completedQuestions.includes(curQuestionId) &&
    idxCount <= totalQuestions
  ) {
    // questionIdx = Math.floor(Math.random() * totalQuestions);
    idxCount++;
    questionIdx = (questionIdx + 1) % totalQuestions;
  }

  curQuestionId = quizModel.questionIds[questionIdx];
  const question = await QuestionsModel.findOne(
    { questionId: curQuestionId },
    { question: 1, answers: 1 }
  );

  await Team.findOneAndUpdate(
    { _id: req.params.teamId },
    {
      $push: { completedQuestions: curQuestionId },
    }
  );

  res.status(201).json({
    message: "get question successfull",
    question,
    endTime: teamQuiz.endTime,
  });
});

exports.submitAnswer = catchAsync(async (req, res, next) => {
  const { error } = submitAnswerValidtionSchema(req.body);
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

  //check whether user belongs to the given team and role
  if (team.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the team or user isn't a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  let teamQuiz = await TeamQuizModel.findOne({ teamId: req.params.teamId });
  if (!teamQuiz) {
    return next(new AppError("No Data Found", 412, errorCodes.NO_DATA_FOUND));
  }

  if (teamQuiz.endTime < Date.now()) {
    return next(
      new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
    );
  }

  const question = await QuestionsModel.findOne({ _id: req.body.questionId });
  if (!question) {
    return next(
      new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
    );
  }

  await new AnswersModel({
    teamId: req.params.teamId,
    questionId: req.body.questionId,
    answerIdx: req.body.submittedIdx,
  }).save();

  if (req.body.submittedIdx === question.correctIndex) {
    await TeamQuizModel.findOneAndUpdate(
      {
        teamId: req.params.teamId,
      },
      {
        $inc: { score: 1 },
      }
    );
  }

  res.status(201).json({
    message: "submitted answer successfull",
  });
});
