import { Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import redis from "../config/redis";

export async function getGithubStats(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.githubUsername) {
      return res.status(400).json({ message: "No GitHub username set on profile" });
    }

    const cacheKey = `github:${user.githubUsername}`;

    // 1. Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Serving GitHub data from cache");
      return res.status(200).json(JSON.parse(cached));
    }

    // 2. Cache miss — hit the real API
    const response = await fetch(
      `https://api.github.com/users/${user.githubUsername}/repos?sort=updated&per_page=10`,
      {
        headers: {
          "User-Agent": "IntelliPrep-App",
          "Authorization": `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ message: "GitHub username not found" });
      }
      return res.status(502).json({ message: "Failed to fetch data from GitHub" });
    }

    const repos = await response.json();

    const languageCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    }

    const result = {
      username: user.githubUsername,
      totalRepos: repos.length,
      languageBreakdown: languageCounts,
      recentRepos: repos.map((r: any) => ({
        name: r.name,
        language: r.language,
        stars: r.stargazers_count,
        updatedAt: r.updated_at,
      })),
    };

    // 3. Store in cache for next time — expires in 10 minutes (600 seconds)
    await redis.set(cacheKey, JSON.stringify(result), "EX", 600);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}