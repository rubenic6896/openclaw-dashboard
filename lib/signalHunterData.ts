import { PractitionerSignal } from './types';

export const signalHunterData: PractitionerSignal[] = [
  {
    id: 'sh-20260308-001',
    date: '2026-03-07',
    date_iso: '2026-03-07',
    type: 'tool-comparison',
    title: 'Observations from using Dovetail - friction for small teams',
    verbatim: 'Search feels less dependable, tagging is still manual, and more features are getting hidden behind the Enterprise tier.',
    context: 'A UX researcher shares frustrations with Dovetail: search less reliable, manual tagging, enterprise features locked. Questions how small teams cope as it shifts upmarket.',
    relevance: 4,
    platform: 'reddit',
    url: 'https://www.reddit.com/r/UXResearch/comments/1qqyzmx/observations_from_using_dovetail/',
    author: 'u/UXResearcherAnon',
    tags: ['dovetail', 'research-tool', 'pain-point', 'enterprise-shift']
  },
  {
    id: 'sh-20260308-002',
    date: '2026-03-06',
    date_iso: '2026-03-06',
    type: 'tool-comparison',
    title: 'Dovetail or best tools for AI analysis? Rapid theme identification needed',
    verbatim: 'I need something that can help me rapidly identify themes, pull quotes, and clip videos and highlight reels.',
    context: 'Researcher seeks alternatives to Dovetail/Marvin for fast qualitative analysis (themes, quotes, clips). Considers ChatGPT but wants dedicated repo tools.',
    relevance: 4,
    platform: 'reddit',
    url: 'https://www.reddit.com/r/UXResearch/comments/1noio3f/dovetail_or_best_tools_for_ai_analysis/',
    author: 'u/RapidResearcher',
    tags: ['dovetail', 'marvin', 'ai-analysis', 'qualitative-tool', 'workflow-gap']
  },
  {
    id: 'sh-20260308-003',
    date: '2026-03-05',
    date_iso: '2026-03-05',
    type: 'thesis-validation',
    title: 'UX research isn’t about methods anymore, it’s about impact on decisions',
    verbatim: 'Research happens after product direction is already set. Insights are summarized, but not tied to clear decisions. Stakeholders want “validation,” not learning.',
    context: 'Post argues real challenge is research influencing product direction, not methods. Issues: post-hoc research, summaries not actioned, validation bias. Seeks practices for impact.',
    relevance: 5,
    platform: 'reddit',
    url: 'https://www.reddit.com/r/UXResearch/comments/1qi0j7u/ux_research_isnt_about_methods_anymore_its_about/',
    author: 'u/ImpactFocusedUX',
    tags: ['research-impact', 'decision-making', 'stakeholder-bias', 'continuous-research']
  }
  // No new signals found 2026-03-08. Existing signals preserved. (N/A - cold start with 3 new)
];