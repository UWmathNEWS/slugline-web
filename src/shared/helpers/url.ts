/**
 * Resolves a URI, similar to path.resolve in Node.js.
 *
 * @param parts - The discrete parts of the URI to resolve.
 */

export const resolve = (...parts: string[]) => {
  if (parts.length === 0) return "";

  // Split the protocol
  const protocolEnd = /^\w+:\/\/|^\/\//.test(parts[0])
    ? parts[0].indexOf("//") + 2
    : 0;
  const protocol = parts[0].slice(0, protocolEnd);
  if (protocolEnd < parts[0].length) {
    parts[0] = parts[0].slice(protocolEnd);
  } else {
    parts.shift();
  }
  return (
    protocol +
    parts
      // Split the URL into its constituent parts
      .flatMap((part) => part.split("/"))
      // Treat the parts as a stack, and clean it up as such
      .reduce((acc, part, i, { length }) => {
        if (part === "..") {
          // Go up a directory level
          acc.pop();
          return acc;
        } else if (part === "." || (part === "" && 0 < i && i < length - 1)) {
          // Same directory level, do nothing
          // note: this keeps the leading and trailing slash in a URI
          return acc;
        } else {
          // Go down a directory level
          acc.push(part);
          return acc;
        }
      }, [] as string[])
      .join("/")
  );
};
