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
}

/**
 *
 * @param items A
 * @param className
 * @constructor
 */
const Breadcrumbs: React.FC<BreadcrumbsProps & ForwardAttributes> = ({
  items,
  className = "",
}) => {
  return (
    <nav className={`Breadcrumbs ${className}`} role="navigation">
      <ol className="Breadcrumbs_itemList">
        {items.map((item, i) => (
          <li key={i} className="Breadcrumbs_item">
            <Link to={item.to}>{item.content}</Link>
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
