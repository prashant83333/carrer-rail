// Run with: node seedContent.js
// Adds a few sample coding problems and a quiz, attributed to the admin account.
// Safe to re-run — it skips items that already exist by title.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const CodingProblem = require('./models/CodingProblem');
const Quiz = require('./models/Quiz');

const codingProblems = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to target. Assume exactly one solution exists.',
    functionName: 'twoSum',
    starterCode: 'function twoSum(nums, target) {\n  // your code here\n}',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }
    ],
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], isHidden: false },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2], isHidden: false },
      { input: [[3, 3], 6], expectedOutput: [0, 1], isHidden: true }
    ]
  },
  {
    title: 'Reverse a String',
    difficulty: 'Easy',
    tags: ['String'],
    description: 'Write a function that takes a string `s` and returns it reversed.',
    functionName: 'reverseString',
    starterCode: 'function reverseString(s) {\n  // your code here\n}',
    examples: [{ input: 's = "hello"', output: '"olleh"' }],
    testCases: [
      { input: ['hello'], expectedOutput: 'olleh', isHidden: false },
      { input: ['CareerRail'], expectedOutput: 'liaRreeraC', isHidden: false },
      { input: [''], expectedOutput: '', isHidden: true }
    ]
  },
  {
    title: 'FizzBuzz',
    difficulty: 'Easy',
    tags: ['Basics', 'Loops'],
    description: 'Given an integer `n`, return an array of strings from 1 to n where: multiples of 3 → "Fizz", multiples of 5 → "Buzz", multiples of both → "FizzBuzz", otherwise the number itself as a string.',
    functionName: 'fizzBuzz',
    starterCode: 'function fizzBuzz(n) {\n  // your code here\n}',
    examples: [{ input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' }],
    testCases: [
      { input: [5], expectedOutput: ['1', '2', 'Fizz', '4', 'Buzz'], isHidden: false },
      { input: [15], expectedOutput: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'], isHidden: true }
    ]
  },
  {
    title: 'Palindrome Check',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    description: 'Write a function that checks whether a given string `s` is a palindrome (reads the same forwards and backwards). Return `true` or `false`.',
    functionName: 'isPalindrome',
    starterCode: 'function isPalindrome(s) {\n  // your code here\n}',
    examples: [{ input: 's = "madam"', output: 'true' }],
    testCases: [
      { input: ['madam'], expectedOutput: true, isHidden: false },
      { input: ['hello'], expectedOutput: false, isHidden: false },
      { input: ['a'], expectedOutput: true, isHidden: true }
    ]
  },
  {
    title: 'Find the Maximum Subarray Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', "Kadane's Algorithm"],
    description: 'Given an integer array `nums`, find the contiguous subarray with the largest sum and return that sum.',
    functionName: 'maxSubArray',
    starterCode: 'function maxSubArray(nums) {\n  // your code here\n}',
    examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6' }],
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expectedOutput: 6, isHidden: false },
      { input: [[1]], expectedOutput: 1, isHidden: false },
      { input: [[5, 4, -1, 7, 8]], expectedOutput: 23, isHidden: true }
    ]
  }
];

const sampleQuiz = {
  title: 'JavaScript Basics',
  subject: 'Programming',
  description: 'A quick check on core JavaScript fundamentals — variables, types, and array methods.',
  durationMinutes: 8,
  questions: [
    {
      questionText: 'Which keyword declares a block-scoped variable in JavaScript?',
      options: ['var', 'let', 'global', 'define'],
      correctIndex: 1
    },
    {
      questionText: 'What does `typeof []` return?',
      options: ['"array"', '"object"', '"list"', '"undefined"'],
      correctIndex: 1
    },
    {
      questionText: 'Which array method creates a new array with the results of calling a function on every element?',
      options: ['forEach', 'filter', 'map', 'reduce'],
      correctIndex: 2
    },
    {
      questionText: 'What is the output of `console.log(1 == "1")`?',
      options: ['true', 'false', 'undefined', 'Error'],
      correctIndex: 0
    },
    {
      questionText: 'Which method converts a JSON string into a JavaScript object?',
      options: ['JSON.stringify()', 'JSON.parse()', 'Object.toJSON()', 'JSON.toObject()'],
      correctIndex: 1
    }
  ]
};

const run = async () => {
  await connectDB();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('❌ No admin account found — run `node seedAdmin.js` first.');
    return mongoose.connection.close();
  }

  for (const p of codingProblems) {
    const exists = await CodingProblem.findOne({ title: p.title });
    if (exists) { console.log('↷ Skipped (exists):', p.title); continue; }
    await CodingProblem.create({ ...p, createdBy: admin._id });
    console.log('✅ Added coding problem:', p.title);
  }

  const quizExists = await Quiz.findOne({ title: sampleQuiz.title });
  if (quizExists) {
    console.log('↷ Skipped (exists):', sampleQuiz.title);
  } else {
    await Quiz.create({ ...sampleQuiz, createdBy: admin._id });
    console.log('✅ Added quiz:', sampleQuiz.title);
  }

  mongoose.connection.close();
};

run();
