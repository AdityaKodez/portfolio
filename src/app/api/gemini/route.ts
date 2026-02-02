import "@/env";
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { geminiRatelimit } from "@/lib/ratelimit";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProjectContext {
  title: string;
  excerpt: string;
  body: string;
}

function buildSystemPrompt(project: ProjectContext): string {
  return `You are a helpful assistant discussing the project "${project.title}".
Here is the project description: ${project.excerpt}
Here is more detail about the project:
${project.body}

Help answer questions about this project. Be concise and helpful. Use markdown formatting when appropriate.`;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
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
      }
    );
  }
  const { messages, projectContext } = (await request.json()) as {
    messages: Message[];
    projectContext?: ProjectContext;
  };

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const systemInstruction = projectContext
    ? buildSystemPrompt(projectContext)
    : undefined;

  const ai = new GoogleGenAI({});

  const stream = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
