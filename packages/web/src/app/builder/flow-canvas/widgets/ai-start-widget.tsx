import { FlowTrigger, FlowTriggerType, isNil } from '@activepieces/shared';
import { t } from 'i18next';
import { Bot, Plus, X } from 'lucide-react';
import { useState } from 'react';

import { useBuilderStateContext } from '@/app/builder/builder-hooks';
import { usePromptFlowAi } from '@/app/builder/promptflow-ai/ai-panel-context';
import { AiComposer } from '@/app/builder/promptflow-ai/composer';
import { promptflowAiMock } from '@/app/builder/promptflow-ai/mock';
import { PfCard } from '@/components/custom/pf-card';
import { Button } from '@/components/ui/button';

const WIDTH = 560;
// Clears the floating "Trigger" label that sits above the trigger node.
const GAP_ABOVE_TRIGGER = 46;
// Headroom the canvas leaves above the trigger so the whole block lands in view on open.
const RESERVED_CANVAS_HEIGHT = 300;

export function AiStartWidget() {
  const { sendMessage, dismissStartWidget } = usePromptFlowAi();
  const [
    triggerName,
    selectStepByName,
    setOpenedPieceSelectorStepNameOrAddButtonId,
  ] = useBuilderStateContext((state) => [
    state.flowVersion.trigger.name,
    state.selectStepByName,
    state.setOpenedPieceSelectorStepNameOrAddButtonId,
  ]);
  const [draft, setDraft] = useState('');

  const startManually = () => {
    selectStepByName(triggerName);
    setOpenedPieceSelectorStepNameOrAddButtonId(triggerName);
  };

  return (
    <div className="nopan nowheel flex flex-col gap-3">
      <PfCard density="compact" className="gap-2.5 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-violet-500" />
            <span className="text-sm font-medium text-foreground">
              {t('Start with PromptFlow AI')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={dismissStartWidget}
            aria-label={t('Dismiss')}
            className="text-muted-foreground"
          >
            <X />
          </Button>
        </div>
        <p className="m-0 text-[12.5px] leading-normal text-muted-foreground">
          {t('Describe what you want to automate and I will draft the steps.')}
        </p>
        <AiComposer
          value={draft}
          onChange={setDraft}
          onSend={(text) => {
            setDraft('');
            sendMessage(text);
          }}
          minRows={2}
          maxRows={5}
          submitLabel={t('Build with AI')}
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {promptflowAiMock.starterSuggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => setDraft(suggestion.prompt)}
              className="rounded-md border border-input bg-background px-2.5 py-1 text-[12px] leading-snug text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      </PfCard>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[12px] font-medium text-muted-foreground">
          {t('or')}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={startManually}
          className="bg-background"
        >
          <Plus />
          {t('Choose a trigger manually')}
        </Button>
      </div>
    </div>
  );
}

const isVisible = ({
  trigger,
  readonly,
  hasRun,
  dismissed,
  messageCount,
}: IsVisibleParams) =>
  !readonly &&
  !hasRun &&
  !dismissed &&
  messageCount === 0 &&
  trigger.type === FlowTriggerType.EMPTY &&
  isNil(trigger.nextAction);

export const aiStartWidgetUtils = {
  isVisible,
  WIDTH,
  GAP_ABOVE_TRIGGER,
  RESERVED_CANVAS_HEIGHT,
};

type IsVisibleParams = {
  trigger: FlowTrigger;
  readonly: boolean;
  hasRun: boolean;
  dismissed: boolean;
  messageCount: number;
};
