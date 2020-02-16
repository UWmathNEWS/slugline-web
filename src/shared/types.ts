export interface Article {
  id: number,
  title: string,
  slug: string,
  sub_title: string,
  author: string,
  content_html: string,
  is_article_of_issue: boolean,
  is_promo: boolean,
  issue: number,
  user: number
}

export interface Issue {
  id: number,
  publish_date: string,
  volume_num: number,
  issue_num: number,
  pdf: string
}

export interface User {
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  is_staff: boolean,
  writer_name: string
}
