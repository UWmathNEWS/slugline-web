/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020  Terry Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
