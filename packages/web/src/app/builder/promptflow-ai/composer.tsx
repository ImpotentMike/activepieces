import { t } from 'i18next';
import { ArrowUp } from 'lucide-react';
import { RefObject } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function AiComposer({
  value,
  onChange,
  onSend,
  textareaRef,
}: AiComposerProps) {
  const canSend = value.trim().length > 0;

  const send = () => {
    if (canSend) {
      onSend(value.trim());
    }
  };

  return (
    <div className="border-t p-3">
      <div className="flex flex-col gap-1.5 rounded-lg border border-input bg-background px-3 py-2 transition-colors focus-within:border-ring">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          minRows={1}
          maxRows={6}
          placeholder={t('Describe a workflow to build…')}
          className="resize-none rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={!canSend}
            onClick={send}
            aria-label={t('Send')}
            className="text-muted-foreground"
          >
            <ArrowUp />
          </Button>
        </div>
      </div>
    </div>
  );
}

type AiComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};
