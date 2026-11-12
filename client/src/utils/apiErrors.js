export const getApiErrorMessage = (error, fallbackMessage, networkMessage) => {
  if (!error?.response) {
    console.error('API request failed before receiving an HTTP response:', error)
    return networkMessage
  }

  return error.response.data?.message || fallbackMessage
}
