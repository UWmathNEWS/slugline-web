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
 * A pagination component similar to react-bootstrap's Pagination.
 *
 * @param pagination A Pagination<T> to generate the paginator from. Must be defined with url, or omitted.
 * @param url A transformer that takes a page number and returns the URL corresponding to that page. Must be defined
 *            with pagination, or omitted.
 * @param className Additional classes to attach to the top-level pagination component
 * @param children The contents of the paginator, if pagination is omitted
 * @param props Remaining props to forward to the top-level pagination component
 */
const Paginator = <T extends any>({
  pagination,
  url,
  className,
  children,
  ...props
}: React.PropsWithChildren<
  ForwardAttributes &
    (
      | { pagination?: undefined; url?: undefined }
      | { pagination: Pagination<T>; url: (page: number) => string }
    )
>) => {
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
            if (page === pagination.page - 2 || page === pagination.page + 2) {
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
                className={page === pagination.page ? "Paginator_current" : ""}
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
};

export default Paginator;
