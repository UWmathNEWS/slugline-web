import React from "react";
import { useUserArticles, useCreateArticle } from "../../api/hooks";
import { Button } from "react-bootstrap";

import "./DashArticlesPage.scss";
import { useHistory, Link } from "react-router-dom";
import { Article, ArticleType } from "../../shared/types";
import { RichTable, Column } from "../../shared/components/RichTable";
import { getApiUrl } from "../../api/api";

interface ArticleTitleProps {
  article: Article;
}

export const ArticleTitle: React.FC<ArticleTitleProps> = (
  props: ArticleTitleProps
) => {
  if (props.article.article_type === ArticleType.Slate) {
    return (
      <Link to={`/dash/edit/${props.article.id}`}>{props.article.title}</Link>
    );
  } else {
    return <p>{props.article.title}</p>;
  }
};

const columns: Column<Article>[] = [
  {
    header: "Title",
    key: "title",
    render(_: any, article) {
      return <ArticleTitle article={article} />;
    }
  },
  {
    header: "Author",
    key: "author"
  },
  {
    header: "Issue",
    key: "issue"
  },
  {
    header: "Status",
    key: "status",
    accessor: () => "NOT IMPLEMENTED YET"
  },
  {
    header: "Last Modified",
    key: "date_modified",
    accessor: () => "NOT IMPLEMENTED YET"
  }
];

const DashArticlesPage: React.FC = () => {
  const [createArticle, ,] = useCreateArticle();

  const history = useHistory();

  const createNewArticle = async () => {
    const createResp = await createArticle();
    if (createResp.success) {
      history.push(`/dash/edit/${createResp.data.id}`);
    }
  };

  return (
    <>
      <h1>Articles</h1>
      <Button
        onClick={createNewArticle}
      >
        New Article
      </Button>
      <RichTable<Article>
        columns={columns}
        url={getApiUrl("user_articles/")}
        pk="id"
        paginated
        selectable
        searchable
        actions={[
          {
            name: "New Article",
            call: createNewArticle
          }
        ]}
      />
    </>
  );
};

export default DashArticlesPage;
