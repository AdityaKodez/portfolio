"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
import { UIMessage, DefaultChatTransport } from "ai";
import { useCallback, useMemo, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export interface ProjectContext {
  title: string;
  excerpt: string;
  github: string;
}

interface UseChatOptions {
  onFirstMessage?: () => void;
  projectContext?: ProjectContext;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .map((part) => {
      if (part.type === "text") {
        return part.text;
      }
      return "";
    })
    .join("")
    .trim();
}

function isChatRole(role: string): role is "user" | "assistant" {
  return role === "user" || role === "assistant";
}

export function useChat(options?: UseChatOptions) {
  const hasStartedChatRef = useRef(false);
  const transport = new DefaultChatTransport({
    api: "/api/gemini",
  });
  const {
    messages: uiMessages,
    sendMessage,
    stop,
    setMessages,
    status,
    error,
  } = useAIChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const messages = useMemo<ChatMessage[]>(() => {
    const mapped = uiMessages
      .filter((message) => isChatRole(message.role))
      .map((message) => ({
        id: message.id,
        role: message.role as "user" | "assistant",
        content: getMessageText(message),
        isStreaming: false,
      }))
      .filter(
        (message) => message.role === "user" || message.content.length > 0,
      );

    if (isLoading) {
      const lastMessage = mapped[mapped.length - 1];
      if (!lastMessage || lastMessage.role !== "assistant") {
        mapped.push({
          id: "assistant-pending",
          role: "assistant",
          content: "",
          isStreaming: true,
        });
      } else {
        lastMessage.isStreaming = true;
      }
    }

    if (status === "error" && error && !isLoading) {
      mapped.push({
        id: "assistant-error",
        role: "assistant",
        content:
          error.message || "Sorry, something went wrong. Please try again.",
        isStreaming: false,
      });
    }

    return mapped;
  }, [uiMessages, isLoading, status, error]);

  const wrappedSendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      if (!hasStartedChatRef.current) {
        hasStartedChatRef.current = true;
        options?.onFirstMessage?.();
      }

      void sendMessage(
        {
          text: trimmed,
        },
        {
          body: {
            projectContext: options?.projectContext,
          },
        },
      );
    },
    [isLoading, options, sendMessage],
  );

  const stopGeneration = useCallback(() => {
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    hasStartedChatRef.current = false;
    setMessages([]);
  }, [setMessages, stop]);

  return {
    messages,
    isLoading,
    sendMessage: wrappedSendMessage,
    stopGeneration,
    reset,
  };
}
