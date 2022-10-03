const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const TeamQuizModel = require("../../models/teamQuizModel");
const AnswersModel = require("../../models/answersModel");
const Team = require("../../models/teamModel");
const {
  errorCodes,
  objectIdLength,
  noOfQuestionsToAnswer,
  questionTypes,
  teamRole,
  quizStatusTypes,
  noOfSets,
} = require("../../utils/constants");
const QuestionsModel = require("../../models/questionsModel");
const { submitAnswerValidationSchema } = require("./validationSchema");
const userModel = require("../../models/userModel");

let noOfTeams = 0;

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
    let arr = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25,
    ];
    let len = arr.length;
    while (--len > 0) {
      let randIndex = Math.floor(Math.random() * (len + 1));
      [arr[randIndex], arr[len]] = [arr[len], arr[randIndex]];
    }

    teamQuiz = await new TeamQuizModel({
      teamId: req.params.teamId,
      startTime: Date.now(),
      endTime: Date.now() + 2400000,
      setNum: 1, //noOfTeams % noOfSets,
      questionsOrder: arr,
      presentQuestionIdx: 0,
      score: 0,
    }).save();
    noOfTeams++;
  }

  if (teamQuiz.endTime < Date.now()) {
    return next(
      new AppError("Time Limit Reached", 412, errorCodes.TIME_LIMIT_REACHED)
    );
  }

  if (teamQuiz.presentQuestionIdx >= noOfQuestionsToAnswer) {
    return next(
      new AppError(
        "Maximum Questions capacity reached",
        412,
        errorCodes.MAX_QUESTIONS_REACHED
      )
    );
  }

  // await TeamQuizModel.findOneAndUpdate(
  //   {
  //     teamId: req.params.teamId,
  //   },
  //   {
  //     $inc: { presentQuestionIdx: 1 },
  //   }
  // );

  // let newPresentQuestionIdx = teamQuiz.presentQuestionIdx + 1;
  let question;
  if (teamQuiz.presentQuestionIdx >= 25) {
    question = await QuestionsModel.findOne({
      setNum: teamQuiz.setNum,
      questionNum: teamQuiz.presentQuestionIdx + 1,
    });
  } else {
    question = await QuestionsModel.findOne({
      setNum: teamQuiz.setNum,
      questionNum: teamQuiz.questionsOrder[teamQuiz.presentQuestionIdx],
    });
  }

  res.status(201).json({
    message: "Get Question Successfull",
    setNum: question.setNum,
    questionNum: question.questionNum,
    questionType: question.questionType,
    caseStudy: question.caseStudy,
    imageSrc: question.imageSrc,
    question: question.question,
    options: question.options,
    endTime: teamQuiz.endTime,
    presentQuestionNum: teamQuiz.presentQuestionIdx + 1,
  });
});

exports.submitAnswer = catchAsync(async (req, res, next) => {
  const { error } = submitAnswerValidationSchema(req.body);
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

  const question = await QuestionsModel.findOne({
    questionNum: req.body.questionNum,
    setNum: req.body.setNum,
  });

  if (!question) {
    return next(
      new AppError("Invalid QuestionId", 412, errorCodes.INVALID_QUESTION_ID)
    );
  }

  await TeamQuizModel.findOneAndUpdate(
    {
      teamId: req.params.teamId,
    },
    {
      $inc: { presentQuestionIdx: 1 },
    }
  );

  if (question.questionType === questionTypes.DESCRIPTIVE) {
    await new AnswersModel({
      teamId: req.params.teamId,
      questionId: question._id,
      setNum: teamQuiz.setNum,
      questionNum: req.body.questionNum,
      descriptiveAnswer: req.body.descriptiveAnswer,
    }).save();
  } else {
    await new AnswersModel({
      teamId: req.params.teamId,
      questionId: question._id,
      setNum: teamQuiz.setNum,
      questionNum: req.body.questionNum,
      answerIdxs: req.body.answerIdxs,
    }).save();

    if (req.body.answerIdxs.length === 0) {
      await TeamQuizModel.findOneAndUpdate(
        {
          teamId: req.params.teamId,
        },
        {
          $inc: { score: 0 },
        }
      );
    } else if (
      JSON.stringify(req.body.answerIdxs) !==
      JSON.stringify(question.correctIdxs)
    ) {
      await TeamQuizModel.findOneAndUpdate(
        {
          teamId: req.params.teamId,
        },
        {
          $inc: { score: -1 },
        }
      );
    } else if (
      JSON.stringify(req.body.answerIdxs) ===
      JSON.stringify(question.correctIdxs)
    ) {
      await TeamQuizModel.findOneAndUpdate(
        {
          teamId: req.params.teamId,
        },
        {
          $inc: { score: 4 },
        }
      );
    }
  }

  res.status(201).json({
    message: "Submitted Answer Successfully",
  });
});

exports.hasStartedQuiz = catchAsync(async (req, res, next) => {
  const user = await userModel.findOne({ _id: req.user._id });

  //check whether user belongs to the given team and role
  if (user.teamRole == null || user.teamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User isn't a leader or user doesn't have team",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  let teamQuiz = await TeamQuizModel.findOne({ teamId: user.teamId });

  if (!teamQuiz) {
    res.status(201).json({
      message: "Sent Response Successfully",
      status: quizStatusTypes.NOT_STARTED,
    });
  } else {
    res.status(201).json({
      message: "Sent Response Successfully",
      status: quizStatusTypes.STARTED,
    });
  }
});
