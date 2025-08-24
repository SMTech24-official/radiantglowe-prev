import { TerrorSources, TgenerateErrorResponse } from './handleInterface';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDuplicateError = (err: any): TgenerateErrorResponse => {
    // Extract value within double quotes using regex
    const match = err.message.match(/"([^"]*)"/);
  
    // The extracted value will be in the first capturing group
    const extractedMessage = match && match[1];
  
    const errorSource: TerrorSources = [
      {
        path: '',
        message: `${extractedMessage} is already exists`,
      },
    ];
  
    const statusCode = 400;
  
    return {
      statusCode,
      message: 'Invalid ID',
      errorSource,
    };
  };
  
  export default handleDuplicateError;