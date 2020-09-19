import React from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import type { ForwardAttributes, Pagination } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./styles/Paginator.scss";

export const PaginatorItem: React.FC<ForwardAttributes & LinkProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <li className={`Paginator_item ${className || ""}`}>
      <Link {...props} className="Paginator_link">
        {children}
      </Link>
    </li>
  );
};

/**
 * A pagination component similar to react-bootstrap's Pagination
 */
// We make this a class so we can expose PaginatorItem as a static member, giving an interface consistent
// with that of react-bootstrap
class Paginator<T> extends React.Component<
  React.PropsWithChildren<
    ForwardAttributes &
      (
        | { pagination?: undefined; url?: undefined }
        | { pagination: Pagination<T>; url: (page: number) => string }
      )
  >
> {
  render() {
    const { className, children, pagination, url, ...props } = this.props;
    if (pagination !== undefined) {
      return (
        <ul className={`Paginator ${className || ""}`} {...props}>
          {pagination.page > 1 && (
            <PaginatorItem
              to={url!(pagination.page - 1)}
              className="Paginator_prev"
              title="Previous page"
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon="chevron-left" />
            </PaginatorItem>
          )}
          {new Array(pagination.num_pages).fill(0).map((_, idx) => {
            const page = idx + 1;
            // If there are more than 5 pages, we want to collapse the extraneous pages. When doing so,
            // we wish to keep the following pages:
            // - first page
            // - last page
            // - current page
            // - current page +/- 1
            if (
              pagination.num_pages > 5 &&
              page !== 1 &&
              page !== pagination.num_pages &&
              (page < pagination.page - 1 || pagination.page + 1 < page)
            ) {
              if (
                page === pagination.page - 2 ||
                page === pagination.page + 2
              ) {
                return (
                  <li key={idx} className="Paginator_item">
                    <span className="Paginator_link">&hellip;</span>
                  </li>
                );
              } else {
                return null;
              }
            } else {
              return (
                <PaginatorItem
                  key={idx}
                  to={url!(page)}
                  className={
                    page === pagination.page ? "Paginator_current" : ""
                  }
                  title={`Go to page ${page}`}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </PaginatorItem>
              );
            }
          })}
          {pagination.page < pagination.num_pages && (
            <PaginatorItem
              to={url!(pagination.page + 1)}
              className="Paginator_next"
              title="Next page"
              aria-label="Next page"
            >
              <FontAwesomeIcon icon="chevron-right" />
            </PaginatorItem>
          )}
        </ul>
      );
    } else {
      return (
        <ul className={`Paginator ${className || ""}`} {...props}>
          {children}
        </ul>
      );
    }
  }

  static Item = PaginatorItem;
}

export default Paginator;
