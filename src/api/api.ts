import axios, { AxiosResponse } from "axios";
import { User } from "../auth/AuthProvider";

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

const API_ROOT = '/api';

function getApiUrl(url: string) {
    return `${API_ROOT}/${url}`;
}

export function getLatestIssue(): Promise<AxiosResponse<Issue>> {
    return axios.get<Issue>(getApiUrl('issues/latest/'));
}

export function getAllIssues(): Promise<AxiosResponse<Issue[]>> {
    return axios.get<Issue[]>(getApiUrl('issues/'));
}

export function getIssue(issue_id: number): Promise<AxiosResponse<Issue>> {
    return axios.get<Issue>(getApiUrl(`issues/${issue_id}`));
}

export function login(username: string, password: string): Promise<AxiosResponse<User>> {
    const body = {
        username: username,
        password: password
    }
    return axios.post<User>(getApiUrl('login/'), body);
}

export function logout(): Promise<AxiosResponse<void>> {
    return axios.post<void>(getApiUrl('logout/'))
}
