// js/auth.js
// bk1
// GitHub認証情報を管理


let githubToken = null;


// PATを設定
export function setToken(token) {

    githubToken =
        token?.trim() || null;
}


// PATを取得
export function getToken() {

    return githubToken;
}


// PATを破棄
export function clearToken() {

    githubToken = null;
}


// PATが設定されているか
export function hasToken() {

    return Boolean(githubToken);
}