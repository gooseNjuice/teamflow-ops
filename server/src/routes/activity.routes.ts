import { Router } from 'express';
import { listTaskActivity } from '../controllers/activity.controller.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const activityRouter = Router({ mergeParams: true });

activityRouter.get('/', asyncHandler(listTaskActivity));
