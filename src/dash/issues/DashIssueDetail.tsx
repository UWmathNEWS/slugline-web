import React from "react";
import { useParams } from "react-router-dom";
import { useIssue, useIssueArticles } from "../../api/hooks";
import { Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArticleTitle } from "../articles/DashArticlesPage";
import Error404 from "../../shared/errors/Error404";
import { ErrorPage } from "../../shared/errors/ErrorPage";

const DashIssueDetail = () => {
  const { issueId } = useParams();

  const id = parseInt(issueId || "");

  const [issue, issueError] = useIssue(id);
  const [resp, issueArticlesError] = useIssueArticles(id);

  if (issueError) {
    return <ErrorPage error={issueError} />;
  }

  if (issueArticlesError) {
    return <ErrorPage error={issueArticlesError} />;
  }

  if (!issue) {
    return <Spinner animation="border" />;
  }

  return (
    <>
      <h1>{`v${issue?.volume_num}i${issue?.issue_num}`}</h1>
      <h3>Articles</h3>
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
        </tr>
        {resp.page?.results.map((article) => (
          <tr>
            <td>
              <ArticleTitle article={article} />
            </td>
            <td>{article.author}</td>
          </tr>
        ))}
      </Table>
    </>
  );
};

export default DashIssueDetail;
