const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const QuestionsModel = require("../../models/questionsModel");
const TeamQuizModel = require("../../models/teamQuizModel");
const AnswersModel = require("../../models/answersModel");
const RoundThreeDataModel = require("../../models/roundThreeDataModel");
const RoundOneModel = require("../../models/roundoneModel");
const RoundTwoModel = require("../../models/roundtwoModel");
const RoundThreeModel = require("../../models/roundthreeModel");

const {
  errorCodes,
  teamRole,
  objectIdLength,
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
const roundThreeDataModel = require("../../models/roundThreeDataModel");

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
  // console.log(Date.now());
  // const users = await UserModel.find(
  //   {
  //     date: {
  //       $lt: 1663866251196,
  //     },
  //     teamId: null,
  //   },
  //   {
  //     email: 1,
  //     _id: 0,
  //   }
  // );

  const users = await UserModel.find(
    {
      hasFilledDetails: false,
    },
    {
      email: 1,
      _id: 0,
    }
  );

  // let userEmails = ["godalasai.sreekar2021@vitstudent.ac.in"];
  let userEmails = ["godalasai.sreekar2021@vitstudent.ac.in"];
  // for (let i = 0; i < users.length; i++) {
  //   userEmails.push(users[i].email);
  // }

  // for (let i = 0; i < userEmails.length; i++) {
  //   transporter.sendMail({
  //     from: process.env.NODEMAILER_EMAIL,
  //     to: userEmails[i],
  //     subject: "FUTUREPRENEURS-ECELL-VIT.",
  //     html: "Hello Futurepreneur,<br> We hope you are having a great time during this pre-graVITas season.<br> Thank you for showing interest and enthusiasm for our flagship event FuturePreneurs 8.0. You have taken the first step by becoming a part of our whatsapp group.<br>Make sure you have registered on our official website and created or joined a team.<br> In case you haven't, go to http://fp.ecellvit.com/dashboard<br> You can directly join or find a team!<br> Whatsapp group link : https://chat.whatsapp.com/LNZVaG2PndRFuQFyCJUDGD<br> We hope to see you soon at our fascinating event and get an amazing learning experience about the entrepreneurial world.<br>Best of luck!<br> Team E-Cell<br>",
  //     auth: {
  //       user: process.env.NODEMAILER_EMAIL,
  //       refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
  //       accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
  //       expires: 3599,
  //     },
  //   });
  // }

  transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: userEmails,
    subject: "FUTUREPRENEURS-ECELL-VIT.",
    html: 'Greetings from Entrepreneurship Cell VIT,<br><br>Hello and welcome to FuturePreneurs! We hope all of you are all pumped up for our flagship event.<br><br>This email is to remind you that in order to qualify for Round 0 of Futurepreneurs 8.0 on October 4th, each team must have four members. The deadline for joining an existing team or completing your own team is September 30th, 2022.<br><br>To join a team, you can either connect with other team leaders through the WhatsApp groups you’ve been added to or you can visit Futurepreneurs’ dashboard.<br>Link to Dashboard: https://fp.ecellvit.com/dashboard<br><br>After signing in, you’ll have an option that would enable you to send a request to a team in order to join them.<br><br>All the directions to do the needful are mentioned in the PDF attached below.<br>Please find the Instruction Manual in the PDF attached below.<br><br>For further queries please feel free to reach out to us via our social media handles or E-Mail us at ecell@vit.ac.in<br><br>Regards,<br>Team E-Cell, VIT<br><embed type="image/svg+xml" src="C:/Users/sridh/Downloads/ecellLogo" /><br><br>Social Media Handles:<br>Instagram: https://www.instagram.com/ecell_vit<br>Twitter: https://twitter.com/ecell_vit<br>Linkedin: https://www.linkedin.com/company/ecellvitvellore<br><br>',
    attachments: [
      {
        filename: "Instructions Manual.pdf",
        path: "C:/Users/sridh/Downloads/instructionsManual.pdf",
        contentType: "application/pdf",
      },
    ],
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
      expires: 3599,
    },
  });
  console.log(userEmails);
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

  //setting newQuestion
  const newQuestion = await new QuestionsModel({
    setNum: req.body.setNum,
    questionNum: req.body.questionNum,
    questionType: req.body.questionType,
    caseStudy: req.body.caseStudy,
    question: req.body.question,
    options: req.body.options,
    correctIdxs: req.body.correctIdxs,
  }).save();

  res.status(201).json({
    message: "Question Saved Succesfully",
    questionId: newQuestion._id,
  });
});

exports.resetQuiz = catchAsync(async (req, res, next) => {
  await AnswersModel.deleteMany({
    teamId: req.params.teamId,
  });

  await TeamQuizModel.findOneAndDelete({
    teamId: req.params.teamId,
  });
  res.status(201).json({
    message: "Reset Quiz Succesfull",
  });
});

exports.merge = catchAsync(async (req, res, next) => {
  // const threeMemTeam = await TeamModel.findOne({
  //   members: { $size: 2 },
  // });
  // const oneMemTeam = await TeamModel.findOne({
  //   members: { $size: 1 },
  // });
  // console.log(threeMemTeam, oneMemTeam);

  // const user = await userModel.findById({
  //   _id: oneMemTeam.teamLeaderId,
  // });
  // console.log(user);
  // await TeamModel.findOneAndDelete({
  //   _id: oneMemTeam._id,
  // });

  // await userModel.findOneAndUpdate(
  //   {
  //     _id: oneMemTeam.teamLeaderId,
  //   },
  //   {
  //     $set: { teamId: threeMemTeam._id, teamRole: 1 },
  //   }
  // );
  // await teamModel.findOneAndUpdate(
  //   {
  //     _id: threeMemTeam._id,
  //   },
  //   {
  //     $push: { members: user._id },
  //   }
  // );

  // const qualifiedTeams = await TeamQuizModel.find({
  //   score: { $lt: 94 },
  // });
  // console.log(qualifiedTeams.length);

  // for (let i = 0; i < qualifiedTeams.length; i++) {
  //   const x = await TeamModel.findOneAndUpdate(
  //     {
  //       _id: qualifiedTeams[i].teamId,
  //     },
  //     {
  //       isTeamQualified: false,
  //     }
  //   );
  //   console.log(x);
  // }

  const users = await UserModel.find();
  for (let i = 0; i < users.length; i++) {
    const team = await TeamModel.findOne({
      _id: users[i].teamId,
    });
    if (team) {
      if (team.isTeamQualified && team.isTeamQualified === true) {
        await UserModel.findOneAndUpdate(
          {
            _id: users[i]._id,
          },
          { isQualified: true }
        );
      } else {
        await UserModel.findOneAndUpdate(
          {
            _id: users[i]._id,
          },
          { isQualified: false }
        );
      }
    } else {
      await UserModel.findOneAndUpdate(
        {
          _id: users[i]._id,
        },
        { isQualified: false }
      );
    }
  }

  res.send(users);
});

// exports.getQuestions = catchAsync(async (req, res, next) => {
//   //checking admin
//   const admin = await User.findById({ _id: req.user._id });
//   if (admin.teamRole !== teamRole.ADMIN) {
//     return next(
//       new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
//     );
//   }

//   //get all questions
//   const questions = await QuestionsModel.find().select({
//     _id: 1,
//     question: 1,
//   });

//   res.status(200).json({
//     message: "Get all questions successfull",
//     questions,
//   });
// });

// exports.getQuestion = catchAsync(async (req, res, next) => {
//   //checking questionId
//   if (req.params.questionId.length !== objectIdLength) {
//     return next(
//       new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
//     );
//   }

//   //checking admin
//   const admin = await User.findById({ _id: req.user._id });
//   if (admin.teamRole !== teamRole.ADMIN) {
//     return next(
//       new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
//     );
//   }

//   //searching for a question
//   const question = await QuestionsModel.findById({
//     _id: req.params.questionId,
//   });
//   if (!question) {
//     return next(
//       new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
//     );
//   }

//   res.status(200).json({
//     message: "Get question successfull",
//     question,
//   });
// });

// exports.modifyQuestion = catchAsync(async (req, res, next) => {
//   //checking questionId
//   if (req.params.questionId.length !== objectIdLength) {
//     return next(
//       new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
//     );
//   }

//   const { error } = modifyQuestionBodyValidation(req.body);
//   if (error) {
//     return next(
//       new AppError(
//         error.details[0].message,
//         400,
//         errorCodes.INPUT_PARAMS_INVALID
//       )
//     );
//   }

//   //checking admin
//   const admin = await User.findById({ _id: req.user._id });
//   if (admin.teamRole !== teamRole.ADMIN) {
//     return next(
//       new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
//     );
//   }

//   //searching for question
//   const question = await QuestionsModel.findById({
//     _id: req.params.questionId,
//   });
//   if (!question) {
//     return next(
//       new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
//     );
//   }

//   await QuestionsModel.findOneAndUpdate(
//     {
//       _id: req.params.questionId,
//     },
//     {
//       question: req.body.question,
//       answers: req.body.answers,
//       correctIndex: req.body.correctIndex,
//     }
//   );

//   res.status(201).json({
//     message: "Question Modified Succesfully",
//     questionId: question._id,
//   });
// });

// exports.deleteQuestion = catchAsync(async (req, res, next) => {
//   //checking questionId
//   if (req.params.questionId.length !== objectIdLength) {
//     return next(
//       new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
//     );
//   }

//   //checking admin
//   const admin = await User.findById({ _id: req.user._id });
//   if (admin.teamRole !== teamRole.ADMIN) {
//     return next(
//       new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
//     );
//   }

//   //searching for question
//   const question = await QuestionsModel.findById({
//     _id: req.params.questionId,
//   });
//   if (!question) {
//     return next(
//       new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
//     );
//   }

//   //updating quizModel
//   await QuizModel.findOneAndUpdate(
//     {
//       _id: quizId,
//     },
//     {
//       $pull: { questionIds: question.questionId },
//     }
//   );

//   //deleting
//   await QuestionsModel.findOneAndDelete({
//     _id: req.params.questionId,
//   });

//   res.status(201).json({
//     message: "Question Deleted Succesfully",
//   });
// });

// exports.getTeamsScores = catchAsync(async (req, res, next) => {
//   //checking admin
//   const admin = await User.findById({ _id: req.user._id });
//   if (admin.teamRole !== teamRole.ADMIN) {
//     return next(
//       new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
//     );
//   }

//   const teamsScores = await TeamQuizModel.aggregate([
//     { $sort: { score: 1 } },
//     { $project: { _id: 0, startTime: 0, endTime: 0 } },
//   ]);

//   await TeamModel.populate(teamsScores, {
//     path: "teamId",
//     select: { teamName: 1 },
//   });

//   res.status(200).json({
//     message: "Get All Teams Scores Succesfull",
//     teamsScores,
//   });
// });

// exports.getTeamsScores = catchAsync(async (req, res, next) => {
//   const admin = await User.findById({ _id: req.user._id });
//   if (admin.teamRole !== teamRole.ADMIN) {
//     return next(
//       new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
//     );
//   }

//   const teamsScores = await TeamQuizModel.aggregate([
//     { $sort: { score: 1 } },
//     { $project: { _id: 0, startTime: 0, endTime: 0 } },
//   ]);

//   await TeamModel.populate(teamsScores, {
//     path: "teamId",
//     select: { teamName: 1 },
//   });

//   res.status(200).json({
//     message: "Get All Teams Scores Succesfull",
//     teamsScores,
//   });
// });

// exports.getTeamAnswers = catchAsync(async (req, res, next) => {
//   const admin = await User.findById({ _id: req.user._id });
//   if (admin.teamRole !== teamRole.ADMIN) {
//     return next(
//       new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
//     );
//   }

//   if (req.params.teamId.length !== objectIdLength) {
//     return next(
//       new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
//     );
//   }

//   const team = await TeamModel.findById({ _id: req.params.teamId });

//   if (!team) {
//     return next(
//       new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
//     );
//   }

//   const answers = await AnswersModel.find(
//     {
//       teamId: req.params.teamId,
//     },
//     { _id: 0, teamId: 0 }
//   ).populate("questionId", {
//     _id: 0,
//     question: 1,
//     answers: 1,
//     correctIndex: 1,
//   });

//   res.status(200).json({
//     message: "Get Team Answers Succesfull",
//     answers,
//   });
// });

// exports.setEndTime = catchAsync(async (req, res, next) => {
//   const admin = await User.findById({ _id: req.user._id });
//   if (admin.teamRole !== teamRole.ADMIN) {
//     return next(
//       new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
//     );
//   }

//   if (req.params.teamId.length !== objectIdLength) {
//     return next(
//       new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
//     );
//   }

//   const team = await TeamModel.findById({ _id: req.params.teamId });

//   if (!team) {
//     return next(
//       new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
//     );
//   }

//   // console.log(Date.UTC());
//   const teamQuizModel = await TeamQuizModel.findOneAndUpdate(
//     { _teamId: req.params.id },
//     {
//       endTime: Date.UTC() + req.body.minutes * 60000,
//     }
//   );

//   res.status(200).json({
//     message: "EndTime Set Successfully",
//     teamQuizModel,
//   });
// });

exports.roundThree = catchAsync(async (req, res, next) => {
  // const admin = await User.findById({ _id: req.user._id });
  // if (admin.teamRole !== teamRole.ADMIN) {
  //   return next(
  //     new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
  //   );
  // }

  const x = await new RoundThreeDataModel({
    item: req.body.item,
    price: req.body.price,
    mapChoice: req.body.mapChoice,
    score: req.body.score,
  }).save();

  res.status(200).json({
    message: "Set Successfully",
    x,
  });
});

exports.removeRoundsData = catchAsync(async (req, res, next) => {
  // const admin = await User.findById({ _id: req.user._id });
  // if (admin.teamRole !== teamRole.ADMIN) {
  //   return next(
  //     new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
  //   );
  // }

  await RoundOneModel.deleteOne({ teamId: req.params.teamId });
  await RoundTwoModel.deleteOne({ teamId: req.params.teamId });
  await RoundThreeModel.deleteOne({ teamId: req.params.teamId });
  await TeamModel.findOneAndUpdate(
    { _id: req.params.teamId },
    {
      $set: {
        hasRoundOneStarted: false,
        hasRoundOneEnd: false,
        hasRoundTwoStarted: false,
        hasRoundTwoEnd: false,
        hasRoundThreeStarted: false,
        hasRoundThreeEnd: false,
        currentRound: null,
        roundOneScore: 0,
        roundTwoScore: 0,
        roundThreeScore: 0,
        totalScore: 0,
      },
    }
  );
  res.status(200).json({
    message: "Deleted Successfully",
  });
});

exports.getScores = catchAsync(async (req, res, next) => {
  // const admin = await User.findById({ _id: req.user._id });
  // if (admin.teamRole !== teamRole.ADMIN) {
  //   return next(
  //     new AppError("Only Admins can access", 400, errorCodes.NOT_ADMIN)
  //   );
  // }
  const teams = await TeamModel.find({
    isTeamQualified: true,
    hasRoundThreeEnd: true,
  });
  console.log(teams);
  console.log(teams.length);
  for (let i = 0; i < teams.length; i++) {
    const x = teams[i];
    let r1 = await RoundOneModel.findOne({ teamId: x._id });
    let r2 = await RoundTwoModel.findOne({ teamId: x._id });
    let r3 = await RoundThreeModel.findOne({ teamId: x._id });

    let score1 = r1.roundOneScore ? r1.roundOneScore : 0;
    let score2 = r2.roundTwoScore ? r2.roundTwoScore : 0;
    let score3 = r3.roundThreeScore ? r3.roundThreeScore : 0;
    let total = score1 + score2 + score3;
    await TeamModel.findOneAndUpdate(
      { _id: x._id },
      { $set: { totalScore: total } }
    );
    console.log(total);
  }

  res.status(200).json({
    message: "Done",
  });
});
