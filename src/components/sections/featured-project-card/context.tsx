"use client";

import { createContext, use } from "react";
import type { Projects } from "#site/content";
import type { ChatMessage } from "./use-chat";

interface ProjectCardState {
  project: Projects;
  isActive: boolean;
  isChatMode: boolean;
}

interface ProjectCardActions {
  open: () => void;
  close: () => void;
  enterChatMode: () => void;
  exitChatMode: () => void;
}

interface ProjectCardMeta {
  formattedDate: string;
}

interface ProjectCardContextValue {
  state: ProjectCardState;
  actions: ProjectCardActions;
  meta: ProjectCardMeta;
}

export const ProjectCardContext = createContext<ProjectCardContextValue | null>(null);

export function useProjectCard() {
  const context = use(ProjectCardContext);
  if (!context) {
    throw new Error("useProjectCard must be used within ProjectCard.Provider");
  }
  return context;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
}

interface ChatActions {
  sendMessage: (content: string) => void;
  stopGeneration: () => void;
  reset: () => void;
}

interface ChatContextValue {
  state: ChatState;
  actions: ChatActions;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const context = use(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ProjectCard.ChatProvider");
  }
  return context;
}
