import { errorResponse } from '../utils/apiResponse.js';

const errorHandler = (error, _req, res, _next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 400, 'Book files must be 100MB or smaller', []);
  }

  if (error.name?.startsWith('Prisma')) {
    return errorResponse(
      res,
      500,
      'Unable to complete the database request right now. Please try again.',
      [],
    );
  }

  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message || 'Internal server error';

  return errorResponse(res, statusCode, message, error.errors || []);
};

export default errorHandler;
