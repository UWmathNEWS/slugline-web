import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { ArticleTitle } from "../articles/DashArticlesPage";
import { ErrorPage } from "../../shared/errors/ErrorPage";
import { RichTable, Column } from "../../shared/components/RichTable";
import { Article } from "../../shared/types";
import api from "../../api/api";
import { useAPI } from "../../api/hooks";

const columns: Column<Article>[] = [
  {
    header: "Title",
    key: "title",
    render(_: any, article) {
      return <ArticleTitle article={article} />;
    },
  },
  {
    header: "Author",
    key: "author",
  },
];

const DashIssueDetail = () => {
  const { id } = useParams();

  const [issue, issueError] = useAPI(
    useCallback(() => {
      return api.issues.retrieve({ id: id || "" });
    }, [id])
  );

  if (issueError) {
    return <ErrorPage error={issueError} />;
  }

  if (!issue) {
    return <Spinner animation="border" />;
  }

  return (
    <>
      <h1>{`v${issue?.volume_num}i${issue?.issue_code}`}</h1>
      <h3>Articles</h3>
      <RichTable<Article>
        columns={columns}
        get={api.articles.get}
        pk="id"
        paginated
        selectable
        searchable
      />
    </>
  );
};

export default DashIssueDetail;
