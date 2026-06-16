import type { RequestHandler } from 'express';
import { searchWorkspace } from '../services/search.service.ts';

export const searchWorkspaceHandler: RequestHandler = async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  const results = await searchWorkspace(query);

  return res.json(results);
};
