import { Router } from 'express';
import { searchWorkspaceHandler } from '../controllers/search.controller.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const searchRouter = Router();

searchRouter.get('/', asyncHandler(searchWorkspaceHandler));
