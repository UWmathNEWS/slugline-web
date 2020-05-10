export const cleanFormData = (data: object) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => value !== "")
  );
};
