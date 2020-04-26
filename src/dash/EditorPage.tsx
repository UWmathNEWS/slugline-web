import React, { useCallback, useState } from "react";
import SluglineEditor from "../editor/SluglineEditor";
import { useParams } from "react-router-dom";
import {
  useArticle,
  useArticleContent,
  useUpdateArticleContent,
  useUpdateArticle,
} from "../api/hooks";
import { Row, Col, Spinner } from "react-bootstrap";
import { Node } from "slate";
import { useDebouncedCallback } from "../shared/hooks";
import EditorInfo from "../editor/EditorInfo";
import { RequestState } from "../shared/types";

const getEditorRequestState = (
  articleState: RequestState,
  contentState: RequestState
): RequestState => {
  if (
    articleState === RequestState.NotStarted &&
    contentState === RequestState.NotStarted
  ) {
    return RequestState.NotStarted;
  } else if (
    articleState === RequestState.Complete &&
    contentState === RequestState.Complete
  ) {
    return RequestState.Complete;
  } else {
    return RequestState.Started;
  }
};

const ARTICLE_SAVE_DELAY_MSECS = 10000;

const EditorPage: React.FC = () => {
  const { articleId } = useParams();
  const id = parseInt(articleId || "");

  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const [article, articleError] = useArticle(id);
  const [articleContent, articleContentError] = useArticleContent(id);

  const [updateArticle, updateArticleState] = useUpdateArticle(id);

  const saveArticle = useDebouncedCallback(
    async (title: string, subtitle: string) => {
      await updateArticle({
        title: title,
        sub_title: subtitle,
      });
      setLastSaved(new Date());
    },
    ARTICLE_SAVE_DELAY_MSECS
  );

  const [
    updateArticleContent,
    updateArticleContentState,
  ] = useUpdateArticleContent(id);

  const saveArticleContent = useDebouncedCallback(
    async (content_raw: Node[]) => {
      await updateArticleContent({
        content_raw: JSON.stringify(content_raw),
      });
      setLastSaved(new Date());
    },
    ARTICLE_SAVE_DELAY_MSECS
  );

  if (!article || !articleContent) {
    return <Spinner animation="border" />;
  }

  const editorContent =
    articleContent.content_raw !== ""
      ? JSON.parse(articleContent.content_raw)
      : undefined;

  return (
    <Row>
      <Col sm={9}>
        <SluglineEditor
          title={article.title}
          subtitle={article.sub_title}
          content_raw={editorContent}
          saveArticle={saveArticle}
          saveArticleContent={saveArticleContent}
        />
      </Col>
      <Col sm={3}>
        <EditorInfo
          lastSaveTime={lastSaved}
          editorRequestState={getEditorRequestState(
            updateArticleState,
            updateArticleContentState
          )}
        />
      </Col>
    </Row>
  );
};

export default EditorPage;
