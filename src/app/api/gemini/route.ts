import "@/env";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  streamText,
  tool,
  type UIMessage,
  stepCountIs,
} from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";
import { geminiRatelimit } from "@/lib/ratelimit";
import { redis } from "@/lib/redis";

interface ProjectContext {
  title: string;
  excerpt: string;
  github: string;
}

const README_CACHE_TTL_SECONDS = 60 * 60 * 24;
const README_MISS_TTL_SECONDS = 60 * 30;
const README_MISS_SENTINEL = "__README_NOT_FOUND__";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function parseGithubRepo(
  githubUrl: string,
): { owner: string; repo: string } | null {
  try {
    const pathname = new URL(githubUrl).pathname.replace(/^\/+|\/+$/g, "");
    const [owner, repoRaw] = pathname.split("/");
    if (!owner || !repoRaw) return null;
    const repo = repoRaw.replace(/\.git$/i, "");
    if (!repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

async function fetchReadmeFromGitHub(
  owner: string,
  repo: string,
): Promise<string | null> {
  for (const branch of ["main", "master"]) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/README.md`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.text();
    }
  }
  return null;
}

async function fetchReadme(githubUrl: string): Promise<string | null> {
  try {
    const parsed = parseGithubRepo(githubUrl);
    if (!parsed) return null;

    const cacheKey = `cache:gemini:readme:${parsed.owner}:${parsed.repo}`;
    const cached = await redis.get<string>(cacheKey);

    if (cached === README_MISS_SENTINEL) return null;
    if (typeof cached === "string" && cached.length > 0) return cached;

    const readme = await fetchReadmeFromGitHub(parsed.owner, parsed.repo);
    if (!readme) {
      await redis.set(cacheKey, README_MISS_SENTINEL, {
        ex: README_MISS_TTL_SECONDS,
      });
      return null;
    }

    await redis.set(cacheKey, readme, {
      ex: README_CACHE_TTL_SECONDS,
    });
    return readme;
  } catch {
    return null;
  }
}

function buildSystemPrompt(project: ProjectContext | undefined): string {
  const baseInstructions = `You are a helpful assistant on Sachi Goyal's portfolio website (sachi.dev).
CRITICAL: Be extremely concise. Avoid all filler, pleasantries, and lengthy introductions. 
Provide direct answers. If a question can be answered in one sentence, do so.
Use markdown for structure (lists, bolding) but keep text minimal.`;

  if (!project) {
    return baseInstructions;
  }

  return `${baseInstructions}
You are discussing the project "${project.title}".
Use the get_project_context tool ONLY if project-specific details are missing from your current context.
Focus strictly on "${project.title}" and Sachi's work on it.`;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "anonymous";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success, reset } = await geminiRatelimit.limit(ip);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "You have exceeded the rate limit. Please try again later.",
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      },
    );
  }

  const { messages, projectContext } = (await request.json()) as {
    messages: UIMessage[];
    projectContext?: ProjectContext;
  };

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    system: buildSystemPrompt(projectContext),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(projectContext ? 2 : 1),
    tools: projectContext
      ? {
          get_project_context: tool({
            description:
              "Fetch project metadata and README content for precise project answers.",
            inputSchema: z.object({
              includeReadme: z
                .boolean()
                .optional()
                .default(true)
                .describe("Include README content in the result."),
            }),
            execute: async ({ includeReadme }) => {
              const readme = includeReadme
                ? await fetchReadme(projectContext.github)
                : null;

              return {
                title: projectContext.title,
                excerpt: projectContext.excerpt,
                github: projectContext.github,
                readme,
              };
            },
          }),
        }
      : undefined,
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "X-Content-Type-Options": "nosniff",
    },
  });
}
