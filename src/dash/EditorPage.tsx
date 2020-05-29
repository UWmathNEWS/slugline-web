import React, { useState, useCallback } from "react";
import SluglineEditor from "../editor/SluglineEditor";
import { useParams } from "react-router-dom";
import { useAPI, useAPILazyCSRF, RequestState } from "../api/hooks";
import { Row, Col, Spinner } from "react-bootstrap";
import { Node } from "slate";
import { useDebouncedCallback } from "../shared/hooks";
import EditorInfo from "../editor/EditorInfo";
import { ErrorPage } from "../shared/errors/ErrorPage";
import api from "../api/api";

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
    return RequestState.Running;
  }
};

const ARTICLE_SAVE_DELAY_MSECS = 10000;

const EditorPage: React.FC = () => {
  const { articleId } = useParams();

  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const [article, articleError] = useAPI(
    useCallback(() => {
      return api.articles.retrieve({ id: articleId || "" });
    }, [articleId])
  );

  const [articleContent, articleContentError] = useAPI(
    useCallback(() => {
      return api.articleContent.retrieve({ id: articleId || "" });
    }, [articleId])
  );

  const [updateArticle, updateArticleInfo] = useAPILazyCSRF(api.articles.patch);

  const saveArticle = useCallback(
    async (title: string, subtitle: string, author: string) => {
      await updateArticle({
        id: articleId || "",
        body: {
          title: title,
          sub_title: subtitle,
          author: author,
        },
      });
      setLastSaved(new Date());
    },
    [updateArticle, setLastSaved, articleId]
  );

  const [saveArticleDebounced] = useDebouncedCallback(
    saveArticle,
    ARTICLE_SAVE_DELAY_MSECS
  );

  const [updateArticleContent, updateArticleContentInfo] = useAPILazyCSRF(
    api.articleContent.patch
  );

  const saveArticleContent = useCallback(
    async (content_raw: Node[]) => {
      await updateArticleContent({
        id: articleId || "",
        body: {
          content_raw: JSON.stringify(content_raw),
        },
      });
      setLastSaved(new Date());
    },
    [updateArticleContent, setLastSaved, articleId]
  );

  const [saveArticleContentDebounced] = useDebouncedCallback(
    saveArticleContent,
    ARTICLE_SAVE_DELAY_MSECS
  );

  if (articleError) {
    return <ErrorPage error={articleError} />;
  }

  if (articleContentError) {
    return <ErrorPage error={articleContentError} />;
  }

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
          saveArticle={saveArticleDebounced}
          saveArticleContent={saveArticleContentDebounced}
        />
      </Col>
      <Col sm={3}>
        <EditorInfo
          lastSaveTime={lastSaved}
          editorRequestState={getEditorRequestState(
            updateArticleInfo.state,
            updateArticleContentInfo.state
          )}
        />
      </Col>
    </Row>
  );
};

export default EditorPage;
