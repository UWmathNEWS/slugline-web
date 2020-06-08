import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { ArticleTitle } from "../articles/DashArticlesPage";
import ErrorPage from "../../shared/errors/ErrorPage";
import { RichTable, Column } from "../../shared/components/RichTable";
import { Article, RouteComponentProps } from "../../shared/types";
import Visor from "../../shared/components/Visor";
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

const DashIssueDetail: React.FC<RouteComponentProps> = (props) => {
  const { issueId } = useParams();

  const [issue, issueError, issueReqInfo] = useAPI(
    useCallback(() => {
      return api.issues.get({ id: issueId || "" });
    }, [issueId])
  );

  const listIssueArticles = useCallback(() => {
    return api.issues.articles({ id: issueId || "" });
  }, [issueId]);

  if (issueError) {
    return <ErrorPage statusCode={issueReqInfo.statusCode || 500} />;
  }

  if (!issue) {
    return <Spinner animation="border" />;
  }

  return (
    <>
      <Visor
        title={props.route.title}
        titleParams={[issue.volume_num, issue.issue_code]}
        location={props.location.pathname}
      />
      <h1>{`v${issue?.volume_num}i${issue?.issue_code}`}</h1>
      <h3>Articles</h3>
      <RichTable<Article>
        columns={columns}
        list={listIssueArticles}
        paginated
        selectable
        searchable
      />
    </>
  );
};

export default DashIssueDetail;
