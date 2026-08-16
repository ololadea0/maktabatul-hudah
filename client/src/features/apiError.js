export function getApiErrorMessage(error) {
  const response = error.response?.data;
  const validationErrors = Array.isArray(response?.errors)
    ? response.errors
        .map((item) => {
          const message = item.msg || item.message;

          return item.field && message ? `${item.field}: ${message}` : message;
        })
        .filter(Boolean)
    : [];

  return validationErrors.join("; ") || response?.message || "Something went wrong. Please try again.";
}
