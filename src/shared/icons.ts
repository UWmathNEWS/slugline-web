import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBold,
  faItalic,
  faUnderline
} from "@fortawesome/free-solid-svg-icons";

export const initLibrary = () => {
  library.add(faBold, faItalic, faUnderline);
};
