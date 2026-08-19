// js/auth.js
// bk2
// GitHub認証情報を管理


const TOKEN_KEY =
    "github-token";


/* ==============================
   PATを設定
   ============================== */

export function setToken(token) {

    const value =
        token?.trim() || "";


    if (value) {

        sessionStorage.setItem(
            TOKEN_KEY,
            value
        );

    } else {

        sessionStorage.removeItem(
            TOKEN_KEY
        );
    }
}


/* ==============================
   PATを取得
   ============================== */

export function getToken() {

    return sessionStorage.getItem(
        TOKEN_KEY
    );
}


/* ==============================
   PATを破棄
   ============================== */

export function clearToken() {

    sessionStorage.removeItem(
        TOKEN_KEY
    );
}


/* ==============================
   PATが設定されているか
   ============================== */

export function hasToken() {

    return Boolean(
        getToken()
    );
}