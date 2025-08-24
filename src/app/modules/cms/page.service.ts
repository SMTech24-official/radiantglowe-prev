
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Page } from './page.model';
import { IPage } from './page.interface';

const createPage = async (pageName: string, content: any): Promise<IPage> => {
  const existingPage = await Page.findOne({ pageName });
  if (existingPage) {
    throw new AppError(httpStatus.BAD_REQUEST, `${pageName} page already exists`);
  }

  const page = await Page.create({ pageName, content });
  return page;
};

const getPage = async (pageName: string): Promise<IPage> => {
  const page = await Page.findOne({ pageName });
  if (!page) {
    throw new AppError(httpStatus.NOT_FOUND, `${pageName} page not found`);
  }
  return page;
};

const updatePage = async (pageName: string, content: any): Promise<IPage> => {
  const page = await Page.findOneAndUpdate(
    { pageName },
    { content },
    { new: true, runValidators: true }
  );
  if (!page) {
    throw new AppError(httpStatus.NOT_FOUND, `${pageName} page not found`);
  }
  return page;
};

const deletePage = async (pageName: string): Promise<void> => {
  const page = await Page.findOneAndDelete({ pageName });
  if (!page) {
    throw new AppError(httpStatus.NOT_FOUND, `${pageName} page not found`);
  }
};

export const PageService = {
  createPage,
  getPage,
  updatePage,
  deletePage,
};