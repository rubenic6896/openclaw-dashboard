import { z } from 'zod';

export const practitionerSignalSchema = z.object({
  url: z.string().url('Invalid URL'),
  type: z.string().min(1, 'type is required'),
  title: z.string().min(1, 'title is required'),
  platform: z.string().optional(),
  author: z.string().optional(),
  verbatim: z.string().optional(),
  context: z.string().optional(),
  relevance: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()).optional(),
  date: z.string().optional(),
  date_iso: z.string().optional(),
});

export type PractitionerSignalInput = z.infer<typeof practitionerSignalSchema>;

export interface TechSignal {
  id: string
  date: string
  category: string
  title: string
  summary: string
  relevance: number
  url: string
  source: string
  tags: string[]
}

export interface MarketSignal {
  id: string
  date: string
  type: string
  title: string
  context: string
  relevance: number
  competitor: string
  url: string
  source: string
  tags: string[]
}

export interface PractitionerSignal {
  id: string
  date: string
  date_iso: string
  type: string
  title: string
  verbatim: string
  context: string
  relevance: number
  platform: string
  url: string
  author?: string
  tags: string[]
}
