import { t } from 'i18next';
import { useEffect, useRef } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import { promptflowAiMock } from './mock';
import { AiProposalCard } from './proposal-card';
import { AiPanelMessage } from './types';

export function AiConversation({
  messages,
  onPickExamplePrompt,
  onApplyProposal,
  onDiscardProposal,
}: AiConversationProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return <AiEmptyState onPickExamplePrompt={onPickExamplePrompt} />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-3">
        {messages.map((message) => {
          if (message.kind === 'proposal') {
            return (
              <AiProposalCard
                key={message.id}
                proposal={message.proposal}
                onApply={() => onApplyProposal(message.id)}
                onDiscard={() => onDiscardProposal(message.id)}
              />
            );
          }
          if (message.role === 'user') {
            return (
              <div key={message.id} className="flex justify-end">
                <p className="m-0 max-w-[85%] rounded-lg bg-muted px-3 py-2 text-[13px] leading-normal text-foreground">
                  {message.text}
                </p>
              </div>
            );
          }
          return (
            <p
              key={message.id}
              className="m-0 max-w-[95%] text-[13px] leading-relaxed text-foreground"
            >
              {message.text}
            </p>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function AiEmptyState({
  onPickExamplePrompt,
}: {
  onPickExamplePrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex h-full flex-col justify-end gap-3 p-3">
      <div className="flex flex-col gap-1">
        <p className="m-0 text-sm font-medium text-foreground">
          {t('Describe what you want to automate')}
        </p>
        <p className="m-0 text-[12.5px] text-muted-foreground">
          {t('Try one of these to get started')}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {promptflowAiMock.examplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPickExamplePrompt(prompt)}
            className="rounded-md border border-input bg-background px-3 py-2 text-left text-[13px] leading-snug text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

type AiConversationProps = {
  messages: AiPanelMessage[];
  onPickExamplePrompt: (prompt: string) => void;
  onApplyProposal: (messageId: string) => void;
  onDiscardProposal: (messageId: string) => void;
};
