import mongoose from 'mongoose';
import { TerrorSources, TgenerateErrorResponse } from './handleInterface';




const handleCastError = (
  err: mongoose.Error.CastError,
): TgenerateErrorResponse => {
  const errorSource: TerrorSources = [
    {
      path: err.path,
      message: err.message,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid ID',
    errorSource,
  };
};

export default handleCastError;