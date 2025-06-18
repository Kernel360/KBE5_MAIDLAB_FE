export const mapApiResponseToInternal = <T, U>(
  apiData: T,
  mapper: (data: T) => U,
): U => {
  return mapper(apiData);
};

export const mapInternalToApiRequest = <T, U>(
  internalData: T,
  mapper: (data: T) => U,
): U => {
  return mapper(internalData);
};
