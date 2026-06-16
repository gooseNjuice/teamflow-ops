export type SearchResultType = 'task' | 'project' | 'user';

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  targetId: string;
  url: string;
  metadata?: Record<string, unknown>;
};
