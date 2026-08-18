const express = require('express');
const vm = require('vm');
const CodingProblem = require('../models/CodingProblem');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/coding  (public) - list problems, search & filter
router.get('/', async (req, res) => {
  try {
    const { q, difficulty } = req.query;
    const filter = {};
    if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { tags: { $regex: q, $options: 'i' } }];
    if (difficulty) filter.difficulty = difficulty;

    const problems = await CodingProblem.find(filter)
      .select('title difficulty tags createdAt')
      .sort({ createdAt: -1 });
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/coding/:id  (public) - problem detail, WITHOUT hidden test cases
router.get('/:id', async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);
    res.json({
      problem: {
        _id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: problem.tags,
        description: problem.description,
        functionName: problem.functionName,
        starterCode: problem.starterCode,
        examples: problem.examples,
        visibleTestCases,
        hiddenTestCount: problem.testCases.length - visibleTestCases.length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Runs `code` (which must define `functionName`) against each test case in an isolated
// VM context with a timeout. NOTE: this is an educational-project level sandbox — it stops
// infinite loops and scopes global access, but is NOT hardened against a determined attacker.
// Do not expose this endpoint on a public production deployment without a real sandboxed runner.
function judge(code, functionName, testCases) {
  return testCases.map((tc, idx) => {
    const context = { __result__: undefined, __error__: null };
    vm.createContext(context);
    const args = Array.isArray(tc.input) ? tc.input : [tc.input];
    const argsLiteral = JSON.stringify(args);
    const script = `
      ${code}
      try {
        __result__ = ${functionName}(...${argsLiteral});
      } catch (e) {
        __error__ = e.message;
      }
    `;
    try {
      new vm.Script(script, { timeout: 2000 }).runInContext(context, { timeout: 2000 });
    } catch (e) {
      context.__error__ = e.message.includes('Script execution timed out')
        ? 'Time limit exceeded (possible infinite loop)'
        : e.message;
    }

    if (context.__error__) {
      return { index: idx, passed: false, error: context.__error__, expected: tc.expectedOutput, actual: null, input: tc.input };
    }

    const passed = JSON.stringify(context.__result__) === JSON.stringify(tc.expectedOutput);
    return { index: idx, passed, expected: tc.expectedOutput, actual: context.__result__, input: tc.input };
  });
}

// @route POST /api/coding/:id/run  (auth) - run against visible test cases only (for iterating)
router.post('/:id/run', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'No code submitted' });
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const visibleCases = problem.testCases.filter((tc) => !tc.isHidden);
    const results = judge(code, problem.functionName, visibleCases);
    res.json({ results, passedCount: results.filter((r) => r.passed).length, total: results.length });
  } catch (err) {
    res.status(500).json({ message: 'Execution failed: ' + err.message });
  }
});

// @route POST /api/coding/:id/submit  (auth) - run against ALL test cases (visible + hidden)
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'No code submitted' });
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const results = judge(code, problem.functionName, problem.testCases);
    const passedCount = results.filter((r) => r.passed).length;
    const allPassed = passedCount === results.length;

    // Hide the actual input/expected values for hidden cases in the response
    const safeResults = results.map((r, i) => (problem.testCases[i].isHidden
      ? { index: r.index, passed: r.passed, hidden: true }
      : r));

    res.json({ allPassed, passedCount, total: results.length, results: safeResults });
  } catch (err) {
    res.status(500).json({ message: 'Execution failed: ' + err.message });
  }
});

// @route POST /api/coding  (admin only) - create a problem
router.post('/', protect, allowRoles('admin'), async (req, res) => {
  try {
    const { title, difficulty, tags, description, functionName, starterCode, examples, testCases } = req.body;
    if (!title || !description || !functionName || !Array.isArray(testCases) || !testCases.length) {
      return res.status(400).json({ message: 'Title, description, function name and at least one test case are required' });
    }
    const problem = await CodingProblem.create({
      title, difficulty: difficulty || 'Easy',
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      description, functionName, starterCode: starterCode || '',
      examples: examples || [], testCases, createdBy: req.user._id
    });
    res.status(201).json({ problem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/coding/:id  (admin only)
router.delete('/:id', protect, allowRoles('admin'), async (req, res) => {
  try {
    await CodingProblem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
