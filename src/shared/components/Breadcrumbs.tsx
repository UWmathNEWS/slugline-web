import React from "react";
import type { ForwardAttributes } from "../types";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

import "./styles/Breadcrumbs.scss";

interface BreadcrumbItemProps extends LinkProps {
  content: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItemProps[];
  includeHome?: boolean;
}

/**
 * Breadcrumbs for navigation
 *
 * @param items A list of links to include in the breadcrumbs, in order of descending hierarchy
 * @param includeHome Include a link to the home page as the first item
 * @param className An optional class name to append to the Breadcrumbs element
 * @constructor
 */
const Breadcrumbs: React.FC<BreadcrumbsProps & ForwardAttributes> = ({
  items,
  includeHome = true,
  className = "",
}) => {
  if (includeHome) {
    items.unshift({
      content: "Home",
      to: "/",
    });
  }

  return (
    <nav className={`Breadcrumbs ${className}`} role="navigation">
      <ol className="Breadcrumbs_itemList">
        {items.map((item, i) => (
          <li key={i} className="Breadcrumbs_item">
            <Link to={item.to} className="Breadcrumbs_link">
              {item.content}
            </Link>
            <span className="Breadcrumbs_sep" aria-hidden="true">
              /
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
