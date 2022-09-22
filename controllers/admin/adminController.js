const User = require("../../models/userModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const QuestionsModel = require("../../models/questionsModel");
const AnswersModel = require("../../models/answersModel");
const QuizModel = require("../../models/quizModel");
const TeamQuizModel = require("../../models/teamQuizModel");
const {
  errorCodes,
  teamRole,
  objectIdLength,
  quizId,
} = require("../../utils/constants");
const {
  setQuestionBodyValidation,
  modifyQuestionBodyValidation,
} = require("./validationSchema");
const TeamModel = require("../../models/teamModel");
const UserModel = require("../../models/userModel");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { transporter } = require("../../utils/nodemailer");
const mailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.NODEMAILER_CLIENT_ID,
  process.env.NODEMAILER_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.NODEMAILER_REFRESH_TOKEN,
});

const accessToken = oauth2Client.getAccessToken();
async function sendEmail(user) {
  let transporter = mailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.NODEMAILER_EMAIL,
      clientId: process.env.NODEMAILER_CLIENT_ID,
      clientSecret: process.env.NODEMAILER_CLIENT_SECRET,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  try {
    let info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: String(user),
      subject: "FUTUREPRENEURS-ECELL-VIT",
      html: "Hello Futurepreneur,<br> We hope you are having a great time during this pre-graVITas season.<br> Thank you for showing interest and enthusiasm for our flagship event FuturePreneurs 8.0. You have taken the first step by becoming a part of our whatsapp group.<br>Make sure you have registered on our official website and created or joined a team.<br> In case you haven't, go to http://fp.ecellvit.com/dashboard<br> You can directly join or find a team!<br> Whatsapp group link : https://chat.whatsapp.com/LNZVaG2PndRFuQFyCJUDGD<br> We hope to see you soon at our fascinating event and get an amazing learning experience about the entrepreneurial world.<br>Best of luck!<br> Team E-Cell<br>",
    });
    console.log(user);
    console.log("Message Sent : %s", info.messageId);
    console.log("Preview URL: %s", mailer.getTestMessageUrl(info));
  } catch (err) {
    console.log(err);
  }
}

exports.getUsersCount = catchAsync(async (req, res, next) => {
  const users = await UserModel.find();

  res.status(201).json({
    message: "Users Length Sent Successfully",
    usersCount: users.length,
  });
});

exports.getTeamsCount = catchAsync(async (req, res, next) => {
  const teams = await TeamModel.find();

  res.status(201).json({
    message: "Teams Length Sent Successfully",
    teamsCount: teams.length,
  });
});

exports.sendEmails = catchAsync(async (req, res, next) => {
  const users = await UserModel.find(
    {
      date: {
        $lt: 1663778298087,
      },
      teamId: null,
    },
    {
      email: 1,
      _id: 0,
    }
  );

  // for (const i in userEmails) {
  //   const mail = userEmails[i];
  await sendEmail("saisrikar.svs@gmail.com");
  // }
  // console.log(userEmails);
  res.status(201).json({
    message: "Emails Sent Successfully",
    usersLength: users.length,
    users,
  });
});

exports.setQuestion = catchAsync(async (req, res, next) => {
  const { error } = setQuestionBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  //checking admin
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  //finding quizModel
  const quizModel = await QuizModel.findById({ _id: quizId });

  //increasing presentQuestingId
  const newQuestionId = quizModel.presentQuestionId + 1;

  //updating quizModel
  await QuizModel.findOneAndUpdate(
    {
      _id: quizId,
    },
    {
      $push: { questionIds: newQuestionId },
      presentQuestionId: newQuestionId,
    }
  );

  //setting newQuestion
  const newQuestion = await new QuestionsModel({
    questionId: newQuestionId,
    question: req.body.question,
    answers: req.body.answers,
    correctIndex: req.body.correctIndex,
  }).save();

  res.status(201).json({
    message: "Question Saved Succesfully",
    questionId: newQuestion._id,
  });
});

exports.getQuestions = catchAsync(async (req, res, next) => {
  //checking admin
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  //get all questions
  const questions = await QuestionsModel.find().select({
    _id: 1,
    question: 1,
  });

  res.status(200).json({
    message: "Get all questions successfull",
    questions,
  });
});

exports.getQuestion = catchAsync(async (req, res, next) => {
  //checking questionId
  if (req.params.questionId.length !== objectIdLength) {
    return next(
      new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
    );
  }

  //checking admin
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  //searching for a question
  const question = await QuestionsModel.findById({
    _id: req.params.questionId,
  });
  if (!question) {
    return next(
      new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
    );
  }

  res.status(200).json({
    message: "Get question successfull",
    question,
  });
});

exports.modifyQuestion = catchAsync(async (req, res, next) => {
  //checking questionId
  if (req.params.questionId.length !== objectIdLength) {
    return next(
      new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
    );
  }

  const { error } = modifyQuestionBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  //checking admin
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  //searching for question
  const question = await QuestionsModel.findById({
    _id: req.params.questionId,
  });
  if (!question) {
    return next(
      new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
    );
  }

  await QuestionsModel.findOneAndUpdate(
    {
      _id: req.params.questionId,
    },
    {
      question: req.body.question,
      answers: req.body.answers,
      correctIndex: req.body.correctIndex,
    }
  );

  res.status(201).json({
    message: "Question Modified Succesfully",
    questionId: question._id,
  });
});

exports.deleteQuestion = catchAsync(async (req, res, next) => {
  //checking questionId
  if (req.params.questionId.length !== objectIdLength) {
    return next(
      new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
    );
  }

  //checking admin
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  //searching for question
  const question = await QuestionsModel.findById({
    _id: req.params.questionId,
  });
  if (!question) {
    return next(
      new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
    );
  }

  //updating quizModel
  await QuizModel.findOneAndUpdate(
    {
      _id: quizId,
    },
    {
      $pull: { questionIds: question.questionId },
    }
  );

  //deleting
  await QuestionsModel.findOneAndDelete({
    _id: req.params.questionId,
  });

  res.status(201).json({
    message: "Question Deleted Succesfully",
  });
});

exports.getTeamsScores = catchAsync(async (req, res, next) => {
  //checking admin
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  const teamsScores = await TeamQuizModel.aggregate([
    { $sort: { score: 1 } },
    { $project: { _id: 0, startTime: 0, endTime: 0 } },
  ]);

  await TeamModel.populate(teamsScores, {
    path: "teamId",
    select: { teamName: 1 },
  });

  res.status(200).json({
    message: "Get All Teams Scores Succesfull",
    teamsScores,
  });
});

exports.getTeamsScores = catchAsync(async (req, res, next) => {
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  const teamsScores = await TeamQuizModel.aggregate([
    { $sort: { score: 1 } },
    { $project: { _id: 0, startTime: 0, endTime: 0 } },
  ]);

  await TeamModel.populate(teamsScores, {
    path: "teamId",
    select: { teamName: 1 },
  });

  res.status(200).json({
    message: "Get All Teams Scores Succesfull",
    teamsScores,
  });
});

exports.getTeamAnswers = catchAsync(async (req, res, next) => {
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const team = await TeamModel.findById({ _id: req.params.teamId });

  if (!team) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const answers = await AnswersModel.find(
    {
      teamId: req.params.teamId,
    },
    { _id: 0, teamId: 0 }
  ).populate("questionId", {
    _id: 0,
    question: 1,
    answers: 1,
    correctIndex: 1,
  });

  res.status(200).json({
    message: "Get Team Answers Succesfull",
    answers,
  });
});

exports.setEndTime = catchAsync(async (req, res, next) => {
  const admin = await User.findById({ _id: req.user._id });
  if (admin.teamRole !== teamRole.ADMIN) {
    return next(
      new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
    );
  }

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const team = await TeamModel.findById({ _id: req.params.teamId });

  if (!team) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  // console.log(Date.UTC());
  const teamQuizModel = await TeamQuizModel.findOneAndUpdate(
    { _teamId: req.params.id },
    {
      endTime: Date.UTC() + req.body.minutes * 60000,
    }
  );

  res.status(200).json({
    message: "EndTime Set Successfully",
    teamQuizModel,
  });
});
