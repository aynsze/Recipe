// js/github-api.js
// bk4
// GitHub APIとの通信を担当


const API_BASE =
    "https://api.github.com";


export class GitHubApi {

    constructor({
        owner,
        repository,
        token,
        branch = "main"
    }) {

        this.owner =
            owner;

        this.repository =
            repository;

        this.token =
            token;

        this.branch =
            branch;
    }


    /* ==============================
       共通リクエスト
       ============================== */

    async request(path, options = {}) {

        const response =
            await fetch(
                `${API_BASE}${path}`,
                {
                    ...options,

                    headers: {

                        "Accept":
                            "application/vnd.github+json",

                        "Authorization":
                            `Bearer ${this.token}`,

                        "X-GitHub-Api-Version":
                            "2026-03-10",

                        "Content-Type":
                            "application/json",

                        ...(options.headers || {})
                    }
                }
            );


        if (!response.ok) {

            let message =
                `${response.status}`;

            try {

                const data =
                    await response.json();

                if (data.message) {
                    message =
                        data.message;
                }

            } catch {
                // JSONでない場合はstatusのみ
            }


            throw new Error(
                `GitHub APIエラー: ${message}`
            );
        }


        return await response.json();
    }


    /* ==============================
       パスエンコード
       ============================== */

    encodePath(path) {

        return path
            .split("/")
            .map(
                part =>
                    encodeURIComponent(part)
            )
            .join("/");
    }


    /* ==============================
       ファイル取得
       ============================== */

    async getFile(path) {

        return await this.request(
            `/repos/${encodeURIComponent(this.owner)}` +
            `/${encodeURIComponent(this.repository)}` +
            `/contents/${this.encodePath(path)}` +
            `?ref=${encodeURIComponent(this.branch)}`
        );
    }


    /* ==============================
       ファイル作成・更新
       ============================== */

    async saveFile(
        path,
        content,
        message,
        sha = null
    ) {

        const body = {

            message,

            content:
                this.encodeBase64(content),

            branch:
                this.branch
        };


        if (sha) {
            body.sha = sha;
        }


        return await this.request(
            `/repos/${encodeURIComponent(this.owner)}` +
            `/${encodeURIComponent(this.repository)}` +
            `/contents/${this.encodePath(path)}`,
            {
                method: "PUT",

                body:
                    JSON.stringify(body)
            }
        );
    }


    /* ==============================
       ファイル削除
       ============================== */

    async deleteFile(
        path,
        message,
        sha
    ) {

        return await this.request(
            `/repos/${encodeURIComponent(this.owner)}` +
            `/${encodeURIComponent(this.repository)}` +
            `/contents/${this.encodePath(path)}`,
            {
                method: "DELETE",

                body:
                    JSON.stringify({

                        message,

                        sha,

                        branch:
                            this.branch
                    })
            }
        );
    }


    /* ==============================
       UTF-8 → Base64
       ============================== */

    encodeBase64(text) {

        const bytes =
            new TextEncoder()
                .encode(text);


        let binary = "";

        bytes.forEach(byte => {

            binary +=
                String.fromCharCode(byte);
        });


        return btoa(binary);
    }

    /* ==============================
       Base64 → UTF-8
       ============================== */

    decodeBase64(base64) {

        const binary =
            atob(
                base64.replace(/\n/g, "")
            );


        const bytes =
            Uint8Array.from(
                binary,
                char => char.charCodeAt(0)
            );


        return new TextDecoder()
            .decode(bytes);
    }

    /* ==============================
       複数ファイルを1コミットで保存
       ============================== */

    async commitFiles(
        files,
        message
    ) {

        /*
         * files:
         *
         * [
         *     {
         *         path: "data/recipe.json",
         *         content: "..."
         *     },
         *     {
         *         path: "data/index.json",
         *         content: "..."
         *     }
         * ]
         */


        if (
            !Array.isArray(files) ||
            files.length === 0
        ) {

            throw new Error(
                "コミットするファイルがありません"
            );
        }


        // ==============================
        // 現在のブランチのcommitを取得
        // ==============================

        const ref =
            await this.request(
                `/repos/${encodeURIComponent(this.owner)}` +
                `/${encodeURIComponent(this.repository)}` +
                `/git/ref/heads/${encodeURIComponent(this.branch)}`
            );


        const baseCommitSha =
            ref.object.sha;


        // ==============================
        // 現在のcommitのtreeを取得
        // ==============================

        const baseCommit =
            await this.request(
                `/repos/${encodeURIComponent(this.owner)}` +
                `/${encodeURIComponent(this.repository)}` +
                `/git/commits/${baseCommitSha}`
            );


        const baseTreeSha =
            baseCommit.tree.sha;


        // ==============================
        // 新しいtreeを作成
        // ==============================

        const tree =
            files.map(file => ({

                path:
                    file.path,

                mode:
                    "100644",

                type:
                    "blob",

                content:
                    file.content
            }));


        const newTree =
            await this.request(
                `/repos/${encodeURIComponent(this.owner)}` +
                `/${encodeURIComponent(this.repository)}` +
                `/git/trees`,
                {
                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            base_tree:
                                baseTreeSha,

                            tree
                        })
                }
            );


        // ==============================
        // commitを作成
        // ==============================

        const newCommit =
            await this.request(
                `/repos/${encodeURIComponent(this.owner)}` +
                `/${encodeURIComponent(this.repository)}` +
                `/git/commits`,
                {
                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            message,

                            tree:
                                newTree.sha,

                            parents:
                                [baseCommitSha]
                        })
                }
            );


        // ==============================
        // ブランチを新しいcommitへ移動
        // ==============================

        await this.request(
            `/repos/${encodeURIComponent(this.owner)}` +
            `/${encodeURIComponent(this.repository)}` +
            `/git/refs/heads/${encodeURIComponent(this.branch)}`,
            {
                method:
                    "PATCH",

                body:
                    JSON.stringify({

                        sha:
                            newCommit.sha,

                        force:
                            false
                    })
            }
        );


        return newCommit;
    }

}