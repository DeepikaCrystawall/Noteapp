export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

export const errorResponse = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const body = {
    success: false,
    message,
    code,
  };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};
