import React from "react";
import { useUserArticles } from "../api/api";
import { Table, Spinner } from "react-bootstrap";

const DashArticlesPage: React.FC = () => {
  const [resp, error] = useUserArticles();

  if (!resp) {
    return <Spinner animation="border" />;
  }

  return (
    <Table>
      <tr>
        <th>Title</th>
        <th>Author</th>
        <th>Issue</th>
        <th>Status</th>
        <th>Last Modified</th>
      </tr>
      {resp.page?.results.map(article => (
        <tr>
          <td>{article.title}</td>
          <td>{article.author}</td>
          <td>{article.issue}</td>
          <td>NOT REAL</td>
          <td>NOT REAL</td>
        </tr>
      ))}
    </Table>
  );
};

export default DashArticlesPage;
