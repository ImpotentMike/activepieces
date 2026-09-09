import { apId } from '@activepieces/shared';
import { t } from 'i18next';
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

import { promptflowAiMock } from './mock';
import { AiPanelMessage } from './types';

const MOCK_REPLY_DELAY_MS = 600;

const PromptFlowAiContext = createContext<PromptFlowAiContextValue | null>(
  null,
);

export function PromptFlowAiProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<AiPanelMessage[]>([]);
  const [startWidgetDismissed, setStartWidgetDismissed] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const pendingRepliesRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pendingReplies = pendingRepliesRef.current;
    return () => {
      pendingReplies.forEach(clearTimeout);
    };
  }, []);

  const sendMessage = (text: string) => {
    setExpanded(true);
    setMessages((current) => [
      ...current,
      { id: apId(), role: 'user', kind: 'text', text },
    ]);
    // Mocked script: confirmation, then a proposal card. UI-only until the panel is wired up.
    pendingRepliesRef.current.push(
      setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: apId(),
            role: 'assistant',
            kind: 'text',
            text: promptflowAiMock.confirmationReply,
          },
        ]);
      }, MOCK_REPLY_DELAY_MS),
      setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: apId(),
            role: 'assistant',
            kind: 'proposal',
            proposal: promptflowAiMock.trudaxWeeklyProposal,
          },
        ]);
      }, MOCK_REPLY_DELAY_MS * 2),
    );
  };

  const openPanel = () => {
    setExpanded(true);
    // The composer only mounts once the panel is expanded, so focus waits for that render.
    setTimeout(() => composerRef.current?.focus());
  };

  const applyProposal = () => {
    toast(t('Preview only — applying to the canvas is not wired up yet'));
  };

  const discardProposal = (messageId: string) => {
    setMessages((current) =>
      current.filter((message) => message.id !== messageId),
    );
  };

  return (
    <PromptFlowAiContext.Provider
      value={{
        expanded,
        messages,
        startWidgetDismissed,
        composerRef,
        openPanel,
        collapsePanel: () => setExpanded(false),
        dismissStartWidget: () => setStartWidgetDismissed(true),
        sendMessage,
        applyProposal,
        discardProposal,
      }}
    >
      {children}
    </PromptFlowAiContext.Provider>
  );
}

export function usePromptFlowAi() {
  const context = useContext(PromptFlowAiContext);
  if (!context) {
    throw new Error('Missing PromptFlowAiProvider in the tree');
  }
  return context;
}

export type PromptFlowAiContextValue = {
  expanded: boolean;
  messages: AiPanelMessage[];
  startWidgetDismissed: boolean;
  composerRef: RefObject<HTMLTextAreaElement | null>;
  openPanel: () => void;
  collapsePanel: () => void;
  dismissStartWidget: () => void;
  sendMessage: (text: string) => void;
  applyProposal: () => void;
  discardProposal: (messageId: string) => void;
};
