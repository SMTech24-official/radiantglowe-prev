import { ZodError, ZodIssue } from 'zod';
import { TerrorSources, TgenerateErrorResponse } from './handleInterface'; 


const handleZodError = (err: ZodError): TgenerateErrorResponse => {
  const errorSource: TerrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: '  Validation Error',
    errorSource,
  };
};

export default handleZodError;