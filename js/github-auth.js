// js/github-auth.js
// bk2
// GitHubログイン・ログアウトを管理

import {
    setToken,
    getToken,
    clearToken,
    hasToken
} from "./auth.js";

import { GitHubApi } from "./github-api.js";

// ★自分のものに置換する
const GITHUB_OWNER =
    "aynsze";

const GITHUB_REPOSITORY =
    "Recipe";

const GITHUB_BRANCH =
    "main";

/* ==============================
   GitHub API取得
   ============================== */

export function getGithubApi() {

    const token =
        getToken();

    /*
     * トークンがなくても
     * Publicリポジトリの読み込みには
     * GitHub APIを使用できる。
     *
     * 書き込み時はGitHub API側で
     * 認証が必要になる。
     */

    return new GitHubApi({

        owner:
            GITHUB_OWNER,

        repository:
            GITHUB_REPOSITORY,

        token:
            token || null,

        branch:
            GITHUB_BRANCH
    });
}

/* ==============================
   ログイン
   ============================== */

export async function login(token) {

    const newToken =
        token?.trim();

    if (!newToken) {

        throw new Error(
            "PATを入力してください"
        );
    }

    const api =
        new GitHubApi({

            owner:
                GITHUB_OWNER,

            repository:
                GITHUB_REPOSITORY,

            token:
                newToken,

            branch:
                GITHUB_BRANCH
        });

    /*
     * GitHub APIへアクセスして
     * PATが有効か確認する。
     */

    await api.request(
        `/repos/${encodeURIComponent(GITHUB_OWNER)}` +
        `/${encodeURIComponent(GITHUB_REPOSITORY)}`
    );

    /*
     * 認証成功後に保存する。
     */

    setToken(newToken);
}

/* ==============================
   ログアウト
   ============================== */

export function logout() {

    clearToken();
}

/* ==============================
   ログイン状態
   ============================== */

export function isLoggedIn() {

    return hasToken();
}