import { Request, Response } from 'express';

import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { PageService } from './page.service';
import { sendResponse } from '../../utils/sendResponse';
import { pageValidationSchemas } from './page.validation';

const createPage = catchAsync(async (req: Request, res: Response) => {
  const { pageName } = req.params;
  // const validatedData = await pageValidationSchemas[pageName].parseAsync({ body: req.body });
  const page = await PageService.createPage(pageName, req.body);

  sendResponse(res, {
    status: 201,
    success: true,
    message: `${pageName} page created successfully`,
    data: page,
  });
});

const getPage = catchAsync(async (req: Request, res: Response) => {
  const { pageName } = req.params;
  const page = await PageService.getPage(pageName);

  sendResponse(res, {
    status: 200,
    success: true,
    message: `${pageName} page retrieved successfully`,
    data: page,
  });
});

const updatePage = catchAsync(async (req: Request, res: Response) => {
  const { pageName } = req.params;
  const page = await PageService.updatePage(pageName, req.body);

  sendResponse(res, {
    status: 200,
    success: true,
    message: `${pageName} page updated successfully`,
    data: page,
  });
});

const deletePage = catchAsync(async (req: Request, res: Response) => {
  const { pageName } = req.params;
  await PageService.deletePage(pageName);

  sendResponse(res, {
    status: 200,
    success: true,
    message: `${pageName} page deleted successfully`,
    data: null,
  });
});

export const PageController = {
  createPage,
  getPage,
  updatePage,
  deletePage,
};