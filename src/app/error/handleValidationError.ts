import mongoose from 'mongoose';
import { TerrorSources, TgenerateErrorResponse } from './handleInterface';



const handleValidationError = (
  err: mongoose.Error.ValidationError,
): TgenerateErrorResponse => {
  const errorSource: TerrorSources = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    },
  );

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSource,
  };
};

export default handleValidationError;