import format from "./format";
import config from "../../config";

/**
 * Returns a formatted document title. If called with two or more parameters, calls helpers.format on all parameters
 * to format the title, and returns a title of the form "{format} | {site title}". If called with one parameter,
 * returns a title of the form "{parameter} | {site title}". If called with zero parameters, returns a title of the
 * form "{site title} - {site description}". The site title and site description can be configured in config.ts as
 * config.title and config.description.
 *
 * @param title - The title of the current page.
 * @param params - Parameters to pass to helpers.format to format the page title.
 */
const makeTitle = (title?: string, ...params: any[]) => {
  if (title && params.length > 0) {
    return `${format(title, ...params)} | ${config.title}`;
  } else if (title) {
    return `${title} | ${config.title}`;
  } else {
    return `${config.title} - ${config.description}`;
  }
};

export default makeTitle;
