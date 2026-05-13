import { ReactNode } from 'react';

import { ApSidebarToggle } from '@/components/custom/ap-sidebar-toggle';
import { useEmbedding } from '@/components/providers/embed-provider';
import { cn } from '@/lib/utils';

export const PageHeader = ({
  title,
  description,
  leftContent,
  rightContent,
  showSidebarToggle = false,
  breadcrumb,
  tabs,
  className = '',
}: PageHeaderProps) => {
  const { embedState } = useEmbedding();

  if (embedState.hidePageHeader) {
    return null;
  }

  const hasShellChrome = Boolean(breadcrumb || tabs);

  return (
    <div
      className={cn(
        'sticky top-0 z-30 flex w-full flex-col bg-background',
        className,
      )}
    >
      {breadcrumb && (
        <div
          data-slot="page-header-breadcrumb"
          className="flex h-12 items-center gap-2 border-b border-gray-100 px-4 text-[13px] text-muted-foreground"
        >
          {breadcrumb}
        </div>
      )}
      <div
        data-slot="page-header-title-row"
        className={cn(
          'flex items-center justify-between gap-3 px-4',
          hasShellChrome ? 'min-h-16 py-3' : 'py-3',
        )}
      >
        <div className="flex min-w-0 grow items-center gap-1">
          {showSidebarToggle && <ApSidebarToggle />}
          <div className="min-w-0 grow">
            {typeof title === 'string' ? (
              <h1
                className={cn(
                  'font-semibold tracking-tight',
                  hasShellChrome ? 'text-[22px] leading-tight' : 'text-base',
                )}
              >
                {title}
              </h1>
            ) : (
              title
            )}
            {description && (
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            )}
          </div>
          {leftContent}
        </div>
        {rightContent}
      </div>
      {tabs && (
        <div
          data-slot="page-header-tabs"
          role="tablist"
          className="flex h-11 items-center gap-1 border-t border-gray-100 px-4"
        >
          {tabs}
        </div>
      )}
    </div>
  );
};

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  breadcrumb?: ReactNode;
  tabs?: ReactNode;
  showSidebarToggle?: boolean;
  className?: string;
}
