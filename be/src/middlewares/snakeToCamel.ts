import { Request, Response, NextFunction } from "express";

const toCamelCase = (str: string) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const convertKeysToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamel);
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[toCamelCase(key)] = convertKeysToCamel(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

export const camelCaseResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const oldJson = res.json;

  res.json = function (data) {
    const camelData = convertKeysToCamel(data);
    return oldJson.call(this, camelData);
  };
  next();
};
