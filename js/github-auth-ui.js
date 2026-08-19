// js/github-auth-ui.js
// bk3
// GitHub認証UIを担当


import {
    login,
    isLoggedIn
} from "./github-auth.js";

import { showNotice } from "./notice.js";


/* ==============================
   認証UI初期化
   ============================== */

export function setupGithubAuth(onLogin) {

    const loginButton =
        document.getElementById(
            "githubLoginButton"
        );

    const modal =
        document.getElementById(
            "githubLoginModal"
        );

    const modalBackground =
        document.getElementById(
            "githubLoginModalBackground"
        );

    const cancelButton =
        document.getElementById(
            "githubLoginCancelButton"
        );

    const submitButton =
        document.getElementById(
            "githubLoginSubmitButton"
        );

    const patInput =
        document.getElementById(
            "githubPatInput"
        );


    if (
        !loginButton ||
        !modal ||
        !modalBackground ||
        !cancelButton ||
        !submitButton ||
        !patInput
    ) {

        console.warn(
            "GitHub認証UIの要素が見つかりません"
        );

        return;
    }


    /* ==============================
       状態表示
       ============================== */

    function updateStatus() {

        if (isLoggedIn()) {

            loginButton.textContent =
                "ログイン中";

            loginButton.disabled =
                true;

        } else {

            loginButton.textContent =
                "ログイン";

            loginButton.disabled =
                false;
        }
    }


    /* ==============================
       モーダルを開く
       ============================== */

    function openModal() {

        patInput.value = "";

        modal.classList.add("open");

        modalBackground.classList.add(
            "open"
        );

        patInput.focus();
    }


    /* ==============================
       モーダルを閉じる
       ============================== */

    function closeModal() {

        modal.classList.remove("open");

        modalBackground.classList.remove(
            "open"
        );

        patInput.value = "";
    }


    /* ==============================
       ログイン
       ============================== */

    async function handleLogin() {

        const token =
            patInput.value.trim();


        if (!token) {

            showNotice(
                "PATを入力してください"
            );

            return;
        }


        submitButton.disabled =
            true;


        const notice =
            showNotice(
                "ログイン中...",
                {
                    duration: null
                }
            );


        try {

            await login(token);


            notice.close();

            closeModal();

            updateStatus();


            showNotice(
                "ログインしました"
            );

            if (onLogin) {
                await onLogin();
            }

        } catch (error) {

            notice.close();


            console.error(
                "GitHubログイン失敗:",
                error
            );


            showNotice(
                `ログインに失敗しました: ${error.message}`
            );


        } finally {

            submitButton.disabled =
                false;
        }
    }


    /* ==============================
       イベント
       ============================== */

    loginButton.addEventListener(
        "click",
        openModal
    );


    cancelButton.addEventListener(
        "click",
        closeModal
    );


    modalBackground.addEventListener(
        "click",
        closeModal
    );


    submitButton.addEventListener(
        "click",
        handleLogin
    );


    patInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                handleLogin();
            }
        }
    );


    /* ==============================
       初期状態
       ============================== */

    updateStatus();
}