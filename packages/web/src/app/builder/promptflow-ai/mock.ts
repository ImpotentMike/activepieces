import { AiProposal } from './types';

// UI-only demo content: real Phase-1 workflows, used until the panel is wired to a backend.
const examplePrompts = [
  'Run a Trudax query every Monday and email the team',
  'Send a WhatsApp summary daily at 6pm',
  'Notify the CMU officer when a KM submission comes in',
];

const confirmationReply =
  'Got it — a weekly Trudax report sent over WhatsApp. Here is what I would set up:';

const trudaxWeeklyProposal: AiProposal = {
  summary: 'Run the Trudax saved question every Monday and share the results.',
  steps: [
    {
      title: 'Schedule trigger',
      detail: 'Every Monday, 9:00 AM',
    },
    {
      title: 'Execute Trudax saved question',
      detail: 'Weekly operations report',
    },
    {
      title: 'Send results via WhatsApp',
      detail: 'To the operations group',
    },
  ],
};

export const promptflowAiMock = {
  examplePrompts,
  confirmationReply,
  trudaxWeeklyProposal,
};
