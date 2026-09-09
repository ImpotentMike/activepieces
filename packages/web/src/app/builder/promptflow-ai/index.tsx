import { t } from 'i18next';
import { Bot, PanelLeftClose } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { usePromptFlowAi } from './ai-panel-context';
import { AiComposer } from './composer';
import { AiConversation } from './conversation';

export function PromptFlowAiPanel() {
  const {
    expanded,
    messages,
    composerRef,
    openPanel,
    collapsePanel,
    sendMessage,
    applyProposal,
    discardProposal,
  } = usePromptFlowAi();
  const [composerValue, setComposerValue] = useState('');

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
              onClick={collapsePanel}
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
          <div className="border-t p-3">
            <AiComposer
              value={composerValue}
              onChange={setComposerValue}
              onSend={(text) => {
                setComposerValue('');
                sendMessage(text);
              }}
              textareaRef={composerRef}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-10 flex-col items-center py-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={openPanel}
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
