import axios, { AxiosResponse } from "axios";
import { Issue, User } from "../shared/types";

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
