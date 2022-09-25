const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
// const AWS = require("aws-sdk");

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
