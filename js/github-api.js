// js/github-api.js
// bk1
// GitHub APIとの通信を担当


const GITHUB_API_BASE =
    "https://api.github.com";


export class GitHubAPI {

    constructor({
        owner,
        repo,
        token
    }) {

        this.owner = owner;
        this.repo = repo;
        this.token = token;
    }


    /**
     * GitHub APIへリクエスト
     */
    async request(path, options = {}) {

        const response =
            await fetch(
                `${GITHUB_API_BASE}${path}`,
                {
                    ...options,

                    headers: {
                        "Accept":
                            "application/vnd.github+json",

                        "Authorization":
                            `Bearer ${this.token}`,

                        "X-GitHub-Api-Version":
                            "2022-11-28",

                        ...options.headers
                    }
                }
            );


        if (!response.ok) {

            let message =
                `GitHub API Error: ${response.status}`;

            try {

                const data =
                    await response.json();

                if (data.message) {
                    message += ` ${data.message}`;
                }

            } catch {
                // JSONでない場合はステータスだけ使用
            }

            throw new Error(message);
        }


        return await response.json();
    }


    /**
     * ファイルを取得
     */
    async getFile(path) {

        return await this.request(
            `/repos/${this.owner}/${this.repo}/contents/${path}`
        );
    }


    /**
     * ファイルを保存
     *
     * sha があれば更新
     * なければ新規作成
     */
    async putFile({
        path,
        content,
        message,
        sha = undefined
    }) {

        const body = {
            message,
            content
        };


        if (sha) {
            body.sha = sha;
        }


        return await this.request(
            `/repos/${this.owner}/${this.repo}/contents/${path}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(body)
            }
        );
    }
}