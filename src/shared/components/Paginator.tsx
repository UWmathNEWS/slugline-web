import React from "react";
import { Link, LinkProps } from "react-router-dom";
import { ForwardAttributes, Pagination } from "../types";

import "./styles/Paginator.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
          {new Array(pagination.num_pages).fill(0).map((_, page) => {
            if (
              pagination.num_pages > 5 &&
              page !== 0 &&
              page !== pagination.num_pages - 1 &&
              (page + 1 < pagination.page - 1 || pagination.page + 1 < page + 1)
            ) {
              if (
                page + 1 === pagination.page - 2 ||
                page + 1 === pagination.page + 2
              ) {
                return (
                  <li key={page} className="Paginator_item">
                    <span className="Paginator_link">&hellip;</span>
                  </li>
                );
              } else {
                return null;
              }
            } else {
              return (
                <PaginatorItem
                  key={page}
                  to={url!(page + 1)}
                  className={
                    page + 1 === pagination.page ? "Paginator_current" : ""
                  }
                  title={`Go to page ${page + 1}`}
                  aria-label={`Go to page ${page + 1}`}
                >
                  {page + 1}
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
