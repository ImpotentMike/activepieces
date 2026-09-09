export type AiProposalStep = {
  title: string;
  detail?: string;
};

export type AiProposal = {
  summary: string;
  steps: AiProposalStep[];
};

export type AiStarterSuggestion = {
  label: string;
  prompt: string;
};

export type AiPanelMessage =
  | {
      id: string;
      role: 'user' | 'assistant';
      kind: 'text';
      text: string;
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'proposal';
      proposal: AiProposal;
    };
