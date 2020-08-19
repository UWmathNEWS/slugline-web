import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faCode,
  faLink,
  faDollarSign,
  faChevronLeft,
  faChevronRight,
  faSort,
  faCaretUp,
  faCaretDown,
  faHeading,
  faListOl,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";

export const initLibrary = () => {
  library.add(
    faBold,
    faItalic,
    faUnderline,
    faStrikethrough,
    faCode,
    faLink,
    faDollarSign,
    faChevronLeft,
    faChevronRight,
    faSort,
    faCaretUp,
    faCaretDown,
    faHeading,
    faListOl,
    faListUl
  );
};
