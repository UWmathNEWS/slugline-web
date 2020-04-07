import React from "react";
import { useUserArticles } from "../api/hooks";
import { Table, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./DashArticlesPage.scss";

const DashArticlesPage: React.FC = () => {
  const [resp, error] = useUserArticles();

  if (!resp) {
    return <Spinner animation="border" />;
  }

  return (
    <>
      <div className="table-header">
        <FontAwesomeIcon
          onClick={() => {
            if (resp.previous) {
              resp.previous();
            }
          }}
          className="pagination-icon"
          icon="chevron-left"
        />
        <span className="pagination-text">{`${resp.page?.page} / ${resp.page?.num_pages}`}</span>
        <FontAwesomeIcon
          onClick={() => {
            if (resp.next) {
              resp.next();
            }
          }}
          className="pagination-icon"
          icon="chevron-right"
        />
      </div>
      <Table>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Issue</th>
          <th>Status</th>
          <th>Last Modified</th>
        </tr>
        {resp.page?.results.map((article) => (
          <tr>
            <td>{article.title}</td>
            <td>{article.author}</td>
            <td>{article.issue}</td>
            <td>NOT REAL</td>
            <td>NOT REAL</td>
          </tr>
        ))}
      </Table>
    </>
  );
};

export default DashArticlesPage;
