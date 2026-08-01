import mongoose from "mongoose";
import dotenv from "dotenv";
import { Problem } from "../models/Problem";

dotenv.config();

const problems = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Table"],
    externalUrl: "https://leetcode.com/problems/two-sum/",
    source: "LeetCode",
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: ["Stack", "String"],
    externalUrl: "https://leetcode.com/problems/valid-parentheses/",
    source: "LeetCode",
  },
  {
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topics: ["Linked List"],
    externalUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
    source: "LeetCode",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topics: ["String", "Sliding Window"],
    externalUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    source: "LeetCode",
  },
  {
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    topics: ["Tree", "BFS"],
    externalUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    source: "LeetCode",
  },
  {
    title: "Course Schedule",
    difficulty: "Medium",
    topics: ["Graph", "Topological Sort"],
    externalUrl: "https://leetcode.com/problems/course-schedule/",
    source: "LeetCode",
  },
  {
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topics: ["Array", "Two Pointers", "Dynamic Programming"],
    externalUrl: "https://leetcode.com/problems/trapping-rain-water/",
    source: "LeetCode",
  },
  {
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    topics: ["Linked List", "Heap"],
    externalUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
    source: "LeetCode",
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not defined");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  await Problem.deleteMany({}); // clear old seed data first, avoid duplicates
  await Problem.insertMany(problems);

  console.log(`Seeded ${problems.length} problems`);
  await mongoose.disconnect();
  process.exit(0);
}

seed();