const express = require('express');
const router = express.Router();

// Curated static placement-prep content, including real study notes per topic
// (not just topic names). In a real product this could move to its own MongoDB
// collection with an admin editor — kept static here to keep scope tight.
const prepData = {
  tracks: [
    {
      id: 'aptitude',
      title: 'Aptitude & Reasoning',
      icon: 'calculator',
      description: 'Quantitative, logical reasoning and verbal ability — the first filter in most campus drives.',
      topics: [
        {
          title: 'Percentages, Profit & Loss, Time-Speed-Distance',
          points: [
            'Percentage change = ((New − Old) / Old) × 100. Successive percentage changes of a% and b% combine to a + b + (ab/100)%.',
            'Profit % = (SP − CP)/CP × 100. Loss % = (CP − SP)/CP × 100. Marked Price after discount d%: SP = MP × (1 − d/100).',
            'Speed = Distance/Time. Convert km/h to m/s by multiplying by 5/18, and m/s to km/h by multiplying by 18/5.',
            'Average speed for equal distances at speeds a and b = 2ab/(a+b) — NOT the simple average.',
            'Relative speed: same direction → subtract speeds; opposite direction → add speeds. Used heavily in train and boat problems.',
            'Practice tip: solve using ratios instead of plugging numbers first — it is 2-3x faster under exam time pressure.'
          ]
        },
        {
          title: 'Permutation, Combination & Probability',
          points: [
            'Permutation (order matters): nPr = n!/(n−r)!. Combination (order does not matter): nCr = n!/(r!(n−r)!).',
            'Circular permutations of n distinct objects = (n−1)!. If clockwise/anticlockwise are considered the same, divide by 2.',
            'Probability = Favourable outcomes / Total outcomes. For independent events, multiply probabilities; for mutually exclusive events, add them.',
            'Conditional probability: P(A|B) = P(A ∩ B) / P(B). Commonly tested with cards, dice and coloured balls from a bag.',
            'Common trap: "at least one" problems are usually easier solved as 1 − P(none) rather than direct casework.'
          ]
        },
        {
          title: 'Blood Relations, Syllogisms, Seating Arrangement',
          points: [
            'Blood relations: draw a family tree diagram as you read the statement — don\u2019t try to hold it in your head.',
            'Syllogisms: use Venn diagrams. Remember "Some A are B" does not imply "Some B are not A" — check all valid diagram cases before concluding.',
            'Seating arrangement (linear/circular): first place the fixed/most-constrained person, then fill remaining seats step by step using the clues in order of specificity.',
            'For circular arrangements, "facing the centre" and "facing outward" flip the left/right direction of neighbours — read the question carefully.',
            'Puzzles (floors, boxes, ranking): tabulate all given clues first, eliminate impossible combinations, then solve the most constrained variable first.'
          ]
        },
        {
          title: 'Reading Comprehension & Sentence Correction',
          points: [
            'Read the questions before the passage for RC — it tells you what to look for, saving a second full read.',
            'For inference questions, the answer must be supported by the text, not just "sound reasonable" — eliminate options that add outside information.',
            'Sentence correction: check subject-verb agreement, tense consistency, parallelism ("either...or", lists) and pronoun-antecedent agreement first — these cover most errors.',
            'Common error: modifiers placed far from the word they describe ("Dangling modifiers") — e.g. "Walking to class, the rain started" (who was walking?).',
            'Vocabulary-in-context questions: replace the word with your chosen option and re-read the sentence — it should keep the same tone and meaning.'
          ]
        }
      ]
    },
    {
      id: 'dsa',
      title: 'Data Structures & Algorithms',
      icon: 'code',
      description: 'The core of every technical interview — build pattern recognition, not just memorized solutions.',
      topics: [
        {
          title: 'Arrays, Strings & Two-Pointer techniques',
          points: [
            'Two-pointer pattern fits problems on a sorted array/string: e.g. pair-sum, removing duplicates, reversing in place — O(n) instead of O(n²).',
            'Prefix sum arrays turn repeated range-sum queries into O(1) lookups after an O(n) precompute — very common in subarray problems.',
            'Kadane\u2019s Algorithm finds the maximum subarray sum in O(n): keep a running sum, reset to 0 whenever it goes negative, track the max seen.',
            'For strings, hash maps (character frequency counts) solve most "anagram / permutation-in-string" style questions efficiently.',
            'Common questions: Two Sum, Move Zeroes, Longest Substring Without Repeating Characters, Product of Array Except Self.'
          ]
        },
        {
          title: 'Linked List, Stack, Queue',
          points: [
            'Fast & slow pointer (Floyd\u2019s cycle detection) finds a loop in a linked list in O(n) time, O(1) space — also finds the middle node in one pass.',
            'Reversing a linked list: iterative approach keeps three pointers (prev, curr, next) and rewires links — practice until it\u2019s muscle memory.',
            'Stack (LIFO): used for balanced parentheses, undo operations, and "Next Greater Element" style problems via a monotonic stack.',
            'Queue (FIFO): used for BFS traversal, task scheduling, and implementing a cache\u2019s eviction order.',
            'Classic interview ask: "Implement a queue using two stacks" and "Design a stack that supports getMin() in O(1)" — know both by heart.'
          ]
        },
        {
          title: 'Trees, Graphs, BFS/DFS',
          points: [
            'DFS (recursive or with an explicit stack) explores as deep as possible first — ideal for path-finding, backtracking and tree traversals (inorder/preorder/postorder).',
            'BFS (using a queue) explores level by level — the go-to choice for shortest path in an unweighted graph.',
            'Binary Search Tree property: left subtree < node < right subtree — enables O(log n) search/insert on a balanced tree.',
            'Graph representation: adjacency list is preferred over adjacency matrix for sparse graphs (saves memory, O(V+E) traversal).',
            'Know the difference: DFS is easier for "does a path exist / all paths", BFS is easier for "shortest path / minimum steps".'
          ]
        },
        {
          title: 'Dynamic Programming & Greedy',
          points: [
            'DP applies when a problem has overlapping subproblems + optimal substructure — solve the smallest cases first and build up (bottom-up) or memoize recursion (top-down).',
            'Classic DP patterns: 0/1 Knapsack, Longest Common Subsequence, Longest Increasing Subsequence, Coin Change — recognize which pattern a new problem maps to.',
            'Space optimization: many DP solutions only need the previous row/state, not the full table — reduces O(n²) space to O(n) or O(1).',
            'Greedy works when a locally optimal choice always leads to a globally optimal one (e.g. activity selection, Huffman coding) — but doesn\u2019t work for problems like 0/1 Knapsack.',
            'In interviews, always state the brute-force recursive solution first, then show how memoization/tabulation improves it — interviewers reward the reasoning, not just the final code.'
          ]
        },
        {
          title: 'Sliding Window & Binary Search patterns',
          points: [
            'Sliding window fits "contiguous subarray/substring satisfying a condition" problems — expand the right pointer, shrink the left pointer when the condition breaks.',
            'Fixed-size window: sum/average of every k-length subarray. Variable-size window: longest substring with at most k distinct characters.',
            'Binary search isn\u2019t just for sorted arrays — it also works on "search space" problems (e.g. minimum capacity to ship packages in D days) where the answer is monotonic.',
            'Binary search template: while (lo <= hi), mid = lo + (hi-lo)/2 to avoid integer overflow, then narrow the range based on a condition check.',
            'Practice recognizing the pattern from the problem statement — "minimum/maximum value such that condition X holds" is almost always binary search on the answer.'
          ]
        }
      ]
    },
    {
      id: 'cs-fundamentals',
      title: 'CS Fundamentals',
      icon: 'layers',
      description: 'OS, DBMS, CN and OOPs — the theory questions that separate shortlists from rejections.',
      topics: [
        {
          title: 'DBMS: Normalization, Joins, Transactions, Indexing',
          points: [
            'Normalization removes redundancy: 1NF (atomic columns), 2NF (no partial dependency on a composite key), 3NF (no transitive dependency) — know these three cold.',
            'JOINs: INNER (matching rows only), LEFT (all left + matches), RIGHT (all right + matches), FULL OUTER (all rows from both, matched or not).',
            'ACID properties of a transaction: Atomicity, Consistency, Isolation, Durability — be ready to explain each with a one-line example.',
            'Indexing speeds up reads (usually a B-Tree or B+ Tree) but slows down writes since the index must also be updated — trade-off to mention in interviews.',
            'Common question: "Why use an index?" → faster lookups on large tables, at the cost of extra storage and slower INSERT/UPDATE.'
          ]
        },
        {
          title: 'OS: Process Scheduling, Deadlocks, Memory Management',
          points: [
            'Process vs Thread: a process has its own memory space; threads within a process share memory but have separate stacks — this is why context-switching threads is cheaper.',
            'CPU scheduling algorithms: FCFS (simple, can cause convoy effect), SJF (optimal average wait time, but needs future knowledge), Round Robin (fair, good for time-sharing systems).',
            'Deadlock needs 4 conditions simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait — breaking any one prevents deadlock.',
            'Paging vs Segmentation: paging divides memory into fixed-size blocks (avoids external fragmentation), segmentation divides it into logical variable-size units.',
            'Virtual memory lets a process use more memory than physically available RAM, using disk as an extension (demand paging + page replacement algorithms like LRU).'
          ]
        },
        {
          title: 'Computer Networks: OSI/TCP-IP, HTTP, DNS',
          points: [
            'OSI model (7 layers): Physical, Data Link, Network, Transport, Session, Presentation, Application — TCP/IP model condenses this into 4 layers.',
            'TCP vs UDP: TCP is connection-oriented and reliable (handshake, retransmission) — used for web/email. UDP is connectionless and faster — used for streaming/gaming.',
            'TCP 3-way handshake: SYN → SYN-ACK → ACK, establishing a reliable connection before data transfer begins.',
            'HTTP is stateless; cookies/sessions/JWTs are used to maintain state across requests. HTTPS adds TLS encryption on top of HTTP.',
            'DNS resolves a domain name to an IP address through a hierarchy: root servers → TLD servers (.com, .in) → authoritative name servers.'
          ]
        },
        {
          title: 'OOPs: Inheritance, Polymorphism, SOLID principles',
          points: [
            'Four pillars of OOP: Encapsulation (bundling data + methods, hiding internals), Abstraction (exposing only what\u2019s needed), Inheritance (reusing behaviour from a parent class), Polymorphism (same interface, different behaviour).',
            'Polymorphism types: compile-time (method overloading) and runtime (method overriding via inheritance + virtual dispatch).',
            'SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion — interviewers often ask you to spot a SOLID violation in sample code.',
            'Composition vs Inheritance: prefer composition ("has-a") over inheritance ("is-a") when the relationship isn\u2019t a strict hierarchy — reduces tight coupling.',
            'Be ready with a real example: e.g. designing a `Shape` interface with `Circle`/`Rectangle` implementing `area()` — a favourite whiteboard question.'
          ]
        }
      ]
    },
    {
      id: 'system-design',
      title: 'System Design Basics',
      icon: 'network',
      description: 'For SDE-2 and senior roles — learn to reason about scale, not just syntax.',
      topics: [
        {
          title: 'Scalability, Load Balancing, Caching',
          points: [
            'Vertical scaling = bigger machine (simple, but has a hard ceiling). Horizontal scaling = more machines (near-limitless, but adds coordination complexity).',
            'Load balancers distribute traffic across servers — common algorithms: Round Robin, Least Connections, IP Hash (for session stickiness).',
            'Caching layers (e.g. Redis/Memcached) sit between the app and the database to serve hot data fast — key trade-off is cache invalidation ("There are only two hard things in CS...").',
            'Cache strategies: Write-through (write to cache + DB together, safer), Write-back (write to cache first, faster but riskier), Cache-aside (app manages cache population on miss).',
            'CDNs cache static content (images, JS, CSS) geographically closer to users, cutting latency significantly for global audiences.'
          ]
        },
        {
          title: 'SQL vs NoSQL, Sharding, Replication',
          points: [
            'SQL databases (MySQL, PostgreSQL) enforce a fixed schema and strong ACID guarantees — good fit for relational, transactional data.',
            'NoSQL databases (MongoDB, Cassandra, DynamoDB) trade some consistency for flexible schema and horizontal scalability — good fit for high-volume, less relational data.',
            'CAP theorem: a distributed system can only guarantee 2 of Consistency, Availability, Partition tolerance at once — most systems pick AP or CP depending on the use case.',
            'Sharding splits a large database across multiple machines by a shard key (e.g. user ID range) — enables horizontal scaling of writes.',
            'Replication copies data across multiple nodes for redundancy/read-scaling — Master-Slave (one writer, many readers) is the most common pattern.'
          ]
        },
        {
          title: 'Designing a URL Shortener / Rate Limiter',
          points: [
            'URL Shortener core flow: generate a unique short code (base62 encoding of an auto-increment ID, or a hash), store the mapping, redirect with a 301/302 on lookup.',
            'Key design decisions to state out loud: expected read:write ratio (usually read-heavy), whether to allow custom aliases, and how to handle collisions in the short code.',
            'Rate Limiter algorithms: Token Bucket (allows bursts up to a limit), Sliding Window Log (accurate but memory-heavy), Fixed Window Counter (simple but has edge bursts).',
            'Where to enforce a rate limiter: at the API Gateway/load balancer level, so it protects all downstream services uniformly.',
            'In an interview, always start with requirements (functional + scale numbers) before jumping to the design — interviewers evaluate your process as much as the diagram.'
          ]
        },
        {
          title: 'Microservices vs Monolith trade-offs',
          points: [
            'Monolith: single deployable unit — simpler to develop, test and deploy initially, but harder to scale specific parts independently as the team/codebase grows.',
            'Microservices: independently deployable services — enables independent scaling and technology choices per service, at the cost of network latency and operational complexity.',
            'Microservices need service discovery, API gateways, and distributed tracing/logging — tools most monoliths don\u2019t need.',
            'Common failure mode: "distributed monolith" — microservices that are still tightly coupled and must be deployed together, giving you all the complexity with none of the benefits.',
            'Rule of thumb often cited in interviews: start with a well-structured monolith, split into microservices only when a real scaling/team bottleneck justifies the added complexity.'
          ]
        }
      ]
    },
    {
      id: 'hr',
      title: 'HR & Behavioural Rounds',
      icon: 'users',
      description: 'Often decisive at the final stage — structure your stories, not just your answers.',
      topics: [
        {
          title: '"Tell me about yourself" — a 60-second framework',
          points: [
            'Structure: Present (what you do/study now) → Past (relevant experience/projects that led here) → Future (why this role/company fits your goal) — in that order.',
            'Keep it under 60-90 seconds — this is a scene-setter for the interview, not your full life story.',
            'Lead with what\u2019s most relevant to the job you\u2019re interviewing for, not a chronological list of every achievement.',
            'End with a bridge to the role: "...which is why I\u2019m excited about this opportunity at [Company]" — it naturally invites the next question.',
            'Practice out loud, not just in your head — spoken pacing is very different from how it sounds when you rehearse silently.'
          ]
        },
        {
          title: 'STAR method for behavioural questions',
          points: [
            'STAR = Situation (brief context), Task (what needed to be done), Action (what YOU specifically did), Result (the outcome, ideally with a number).',
            'Spend the least time on Situation/Task and the most time on Action — interviewers want to hear about your specific decisions and thinking.',
            'Always quantify the Result where possible: "reduced load time by 30%" lands far better than "made it faster".',
            'Prepare 4-5 flexible stories in advance (a conflict, a failure, a leadership moment, a tight-deadline project) that can be adapted to different questions.',
            'Common prompts this method covers: "Tell me about a time you failed", "a conflict with a teammate", "a time you had to learn something fast".'
          ]
        },
        {
          title: 'Strengths, weaknesses & conflict-resolution stories',
          points: [
            'For "strengths": pick one relevant to the role and back it with a specific example — don\u2019t just list adjectives.',
            'For "weaknesses": pick something genuine but not role-critical, and show the concrete step you\u2019re taking to improve it — this shows self-awareness, not a rehearsed non-answer like "I\u2019m a perfectionist".',
            'Conflict-resolution stories should focus on how you communicated and reached a resolution — avoid badmouthing the other person involved.',
            'Interviewers are listening for ownership language ("I realized...", "I decided to...") over blame language ("they didn\u2019t...", "the team failed to...").',
            'Keep every story specific and real — vague, generic answers are the easiest thing for an interviewer to probe further and expose.'
          ]
        },
        {
          title: 'Questions to ask the interviewer',
          points: [
            'Always have 2-3 questions ready — not asking any signals low genuine interest in the role.',
            'Good categories: the team\u2019s current priorities/challenges, how success is measured in this role, what growth/learning looks like in the first 6 months.',
            'Avoid questions answerable with a 30-second Google search (e.g. "What does your company do?") — it signals you didn\u2019t prepare.',
            'Asking "What do you personally enjoy about working here?" often gets a genuine, revealing answer and builds rapport.',
            'Save salary/benefits questions for the recruiter/HR round rather than a technical panel round, unless they bring it up first.'
          ]
        }
      ]
    },
    {
      id: 'resume',
      title: 'Resume & Profile Building',
      icon: 'file',
      description: 'Your resume gets ~10 seconds of attention — make every line earn its place.',
      topics: [
        {
          title: 'One-page rule & reverse-chronological format',
          points: [
            'For students/freshers, keep the resume to one page — recruiters scan, they don\u2019t read line by line on a first pass.',
            'Reverse-chronological order (most recent first) is the standard expected format for education, experience and projects.',
            'Section order that works well for freshers: Education → Skills → Projects → Experience/Internships → Achievements.',
            'Use a clean, single-column layout with consistent fonts/spacing — avoid tables/graphics that can break when parsed by Applicant Tracking Systems (ATS).',
            'Save and submit as PDF unless a Word doc is explicitly requested — it preserves formatting across devices.'
          ]
        },
        {
          title: 'Quantifying impact (numbers > adjectives)',
          points: [
            'Replace vague claims ("improved performance") with numbers ("reduced API response time from 800ms to 200ms").',
            'Use the formula: Action verb + what you did + measurable result. E.g. "Built a REST API serving 10K+ daily requests with 99.9% uptime".',
            'If you don\u2019t have a hard metric, use scale/scope instead: number of users, size of dataset, number of features shipped.',
            'Avoid generic adjectives like "hardworking" or "team player" — show it through a specific bullet point instead of claiming it.',
            'Every bullet should answer: what did you build/do, how, and what was the outcome — not just a list of technologies used.'
          ]
        },
        {
          title: 'Projects that recruiters actually notice',
          points: [
            '2-3 solid, complete projects beat 6 half-finished ones — pick depth over breadth for what you showcase.',
            'For each project, mention: the problem it solves, your specific role/contribution, the tech stack, and a live link or GitHub repo.',
            'Projects that mirror real-world use cases (a working app, an API, a data pipeline) stand out more than pure tutorial clones.',
            'Add a one-line "what I\u2019d improve next" for a project — it shows reflective thinking, which interviewers like to probe.',
            'Make sure linked projects actually run — a broken demo link during a review call undoes the credibility instantly.'
          ]
        },
        {
          title: 'LinkedIn & GitHub profile checklist',
          points: [
            'LinkedIn: a clear headshot, a headline beyond just your job title (mention your focus area/interest), and a summary that mirrors your resume\u2019s top achievements.',
            'GitHub: pin your best 3-4 repositories, each with a proper README explaining what it does, how to run it, and screenshots/GIFs if it\u2019s visual.',
            'Keep your GitHub contribution graph active — even small, consistent commits look better than long gaps followed by a burst before placements.',
            'Make sure your resume, LinkedIn and GitHub tell the same consistent story — recruiters often cross-check all three.',
            'Remove/clean up old, unfinished or duplicate repos that don\u2019t reflect your current skill level — quality over quantity.'
          ]
        }
      ]
    }
  ],
  mockInterviewTips: [
    'Think out loud during coding rounds — interviewers evaluate your process, not just the final answer.',
    'Clarify constraints and edge cases before writing code.',
    'Start with a brute-force approach, then optimize — don\u2019t wait silently for the "perfect" solution.',
    'For HR rounds, keep every answer under 90 seconds unless asked to elaborate.',
    'Always carry 2-3 well-prepared questions to ask the interviewer.'
  ],
  companyWiseLinks: [
    { company: 'TCS NQT', focus: 'Aptitude + Coding (basic)', pattern: 'MCQ-heavy, 2 coding questions' },
    { company: 'Infosys', focus: 'Aptitude + Pseudocode', pattern: 'Logical reasoning heavy' },
    { company: 'Wipro', focus: 'Aptitude + Essay + Coding', pattern: 'Business English round included' },
    { company: 'Product companies (SDE)', focus: 'DSA + LLD/HLD + CS fundamentals', pattern: '3-5 technical rounds + HR' },
    { company: 'Service companies', focus: 'Aptitude + Basic coding + HR', pattern: '1-2 technical rounds + HR' }
  ]
};

// @route GET /api/prep
router.get('/', (req, res) => {
  res.json(prepData);
});

module.exports = router;
