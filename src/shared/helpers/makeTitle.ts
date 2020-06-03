import format from "./format";
import config from "../../config";

const makeTitle = (title: string, ...params: any[]) => {
  if (title) {
    return `${format(title, ...params)} | ${config.title}`;
  } else {
    return `${config.title} - ${config.description}`;
  }
};

export default makeTitle;
