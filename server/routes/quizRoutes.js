const express = require('express');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/quizzes  (public) - list active quizzes (no answers)
router.get('/', async (req, res) => {
  try {
    const { subject, q } = req.query;
    const filter = { isActive: true };
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (q) filter.title = { $regex: q, $options: 'i' };

    const quizzes = await Quiz.find(filter)
      .select('title subject description durationMinutes questions createdAt')
      .sort({ createdAt: -1 });

    // Only expose question count, not the actual questions/answers, on the list view
    const summarized = quizzes.map((qz) => ({
      _id: qz._id,
      title: qz.title,
      subject: qz.subject,
      description: qz.description,
      durationMinutes: qz.durationMinutes,
      questionCount: qz.questions.length,
      createdAt: qz.createdAt
    }));
    res.json({ quizzes: summarized });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/quizzes/:id/start  (auth) - fetch questions WITHOUT correct answers, to attempt
router.get('/:id/start', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isActive) return res.status(404).json({ message: 'Quiz not found' });

    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options
    }));
    res.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        description: quiz.description,
        durationMinutes: quiz.durationMinutes,
        questions: safeQuestions
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/quizzes/:id/submit  (auth) - submit answers, get scored + correct answers back
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { answers, timeTakenSeconds } = req.body; // answers: array of selected option index, same order as questions
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Answers do not match the number of questions' });
    }

    let score = 0;
    const review = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) score += 1;
      return {
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex: answers[i],
        isCorrect
      };
    });

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      user: req.user._id,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    res.status(201).json({ attemptId: attempt._id, score, totalQuestions: quiz.questions.length, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/quizzes/attempts/mine  (auth) - quiz history
router.get('/attempts/mine', protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate('quiz', 'title subject')
      .sort({ createdAt: -1 });
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/quizzes  (admin only) - create a quiz
router.post('/', protect, allowRoles('admin'), async (req, res) => {
  try {
    const { title, subject, description, durationMinutes, questions } = req.body;
    if (!title || !subject || !Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ message: 'Title, subject and at least one question are required' });
    }
    for (const q of questions) {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctIndex !== 'number') {
        return res.status(400).json({ message: 'Each question needs text, exactly 4 options, and a correct index' });
      }
    }
    const quiz = await Quiz.create({
      title, subject, description: description || '', durationMinutes: durationMinutes || 10,
      questions, createdBy: req.user._id
    });
    res.status(201).json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/quizzes/:id  (admin only)
router.delete('/:id', protect, allowRoles('admin'), async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
