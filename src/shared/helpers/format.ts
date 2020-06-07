/**
 * Formats a string using Python-style syntax.
 *
 *     format("Hello, {}!", "world") // => Hello, world!
 *     format("Hello, {name}!", { name: "world" }) // => Hello, world!
 *     format("Hello, {{name}}!, "world") // => Hello, {name}!
 *
 * @param fmtStr The format string
 * @param params Parameters to pass in to be formatted
 */
const format: {
  (fmtStr: string): string;
  (fmtStr: string, params: Record<string | number, any>): string;
  (fmtStr: string, ...params: (string | number)[]): string;
} = (fmtStr: string, ...params: any[]) => {
  if (params.length === 0) return fmtStr;

  const paramsObj =
    typeof params[0] === "number" ||
    typeof params[0] === "string" ||
    typeof params[0] === "undefined"
      ? params
      : params[0];
  let unlabelledMatches = 0;

  return fmtStr.replace(/{([^}]*)}/g, (match, paramName, offset) => {
    if (!paramName) {
      return paramsObj[unlabelledMatches++];
    }
    if (paramName[0] === "{" && fmtStr[offset + match.length] === "}") {
      return paramName;
    }
    return paramsObj[
      parseInt(paramName) in paramsObj ? parseInt(paramName) : paramName
    ];
  });
};

export default format;
