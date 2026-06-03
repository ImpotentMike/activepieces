import { apId } from '@activepieces/shared';
import { t } from 'i18next';
import { Bot, PanelLeftClose } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { AiComposer } from './composer';
import { AiConversation } from './conversation';
import { promptflowAiMock } from './mock';
import { AiPanelMessage } from './types';

const MOCK_REPLY_DELAY_MS = 600;

export function PromptFlowAiPanel() {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<AiPanelMessage[]>([]);
  const [composerValue, setComposerValue] = useState('');
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const pendingRepliesRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      pendingRepliesRef.current.forEach(clearTimeout);
    };
  }, []);

  const sendMessage = (text: string) => {
    setComposerValue('');
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

  const applyProposal = () => {
    toast(t('Preview only — applying to the canvas is not wired up yet'));
  };

  const discardProposal = (messageId: string) => {
    setMessages((current) =>
      current.filter((message) => message.id !== messageId),
    );
  };

  return (
    <aside
      className={cn(
        'relative h-full shrink-0 overflow-hidden border-r bg-background transition-[width] duration-200 ease-out',
        expanded ? 'w-[340px]' : 'w-10',
      )}
    >
      {expanded ? (
        <div className="flex h-full w-[340px] flex-col">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-violet-500" />
              <span className="text-sm font-medium text-foreground">
                {t('PromptFlow AI')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setExpanded(false)}
              aria-label={t('Collapse')}
              className="text-muted-foreground"
            >
              <PanelLeftClose />
            </Button>
          </div>
          <div className="min-h-0 flex-1">
            <AiConversation
              messages={messages}
              onPickExamplePrompt={(prompt) => {
                setComposerValue(prompt);
                composerRef.current?.focus();
              }}
              onApplyProposal={applyProposal}
              onDiscardProposal={discardProposal}
            />
          </div>
          <AiComposer
            value={composerValue}
            onChange={setComposerValue}
            onSend={sendMessage}
            textareaRef={composerRef}
          />
        </div>
      ) : (
        <div className="flex h-full w-10 flex-col items-center py-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setExpanded(true)}
                aria-label={t('PromptFlow AI')}
                className="text-muted-foreground"
              >
                <Bot />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{t('PromptFlow AI')}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>
  );
}
