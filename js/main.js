// js/main.js
// bk9
// 全体を組み合わせるファイル

import { RecipeList } from "./recipe-list.js";
import { RecipeForm } from "./recipe-form.js";
import { getGithubApi, isLoggedIn } from "./github-auth.js";
import { showNotice } from "./notice.js";
import { setupGithubAuth } from "./github-auth-ui.js";

// ==============================
// index.json読み込み
// ==============================

async function loadIndex() {

    const github =
        getGithubApi();

    const file =
        await github.getFile(
            "data/index.json"
        );

    const content =
        github.decodeBase64(
            file.content
        );

    const files =
        JSON.parse(content);

    if (!Array.isArray(files)) {

        throw new Error(
            "index.jsonは配列である必要があります"
        );
    }

    // ==============================
    // ファイル名の重複チェック
    // ==============================

    const seen =
        new Set();

    const uniqueFiles = [];

    files.forEach(file => {

        if (typeof file !== "string") {

            showNotice(
                "index.jsonに文字列ではないファイル名があります"
            );

            return;
        }

        if (seen.has(file)) {

            showNotice(
                `index.jsonに重複したファイル名があります: ${file}`
            );

            return;
        }

        seen.add(file);

        uniqueFiles.push(file);
    });

    return uniqueFiles;
}

// ==============================
// レシピJSON読み込み
// ==============================

async function loadRecipes(files) {

    const github =
        getGithubApi();

    const results =
        await Promise.all(

            files.map(async file => {

                try {

                    const githubFile =
                        await github.getFile(
                            `data/${file}`
                        );

                    const content =
                        github.decodeBase64(
                            githubFile.content
                        );

                    const recipe =
                        JSON.parse(content);

                    return {

                        success:
                            true,

                        recipe: {

                            ...recipe,

                            file
                        }
                    };

                } catch (error) {

                    showNotice(
                        `レシピを読み込めませんでした: ${file}`
                    );

                    console.error(
                        `レシピ読み込み失敗: ${file}`,
                        error
                    );

                    return {

                        success:
                            false,

                        recipe:
                            null
                    };
                }
            })
        );

    return results
        .filter(
            result =>
                result.success
        )
        .map(
            result =>
                result.recipe
        );
}

// ==============================
// アプリ初期化
// ==============================

function initializeApp(recipes) {

    // ==============================
    // DOM
    // ==============================

    const recipeGrid =
        document.getElementById("recipeGrid");

    const emptyMessage =
        document.getElementById("emptyMessage");

    const searchInput =
        document.getElementById("searchInput");

    const sortSelect =
        document.getElementById("sortSelect");

    const categoryList =
        document.getElementById("categoryList");

    const addButton =
        document.getElementById("addButton");

    const modal =
        document.getElementById("recipeModal");

    const modalBackground =
        document.getElementById("modalBackground");

    const closeModalButton =
        document.getElementById("closeModalButton");

    const saveRecipeButton =
        document.getElementById("saveRecipeButton");

    // ==============================
    // レシピ一覧
    // ==============================

    const recipeList =
        new RecipeList({

            gridElement:
                recipeGrid,

            emptyMessageElement:
                emptyMessage,

            searchInput,

            sortSelect,

            categoryListElement:
                categoryList,

            onRecipeClick:
                recipe => {

                    location.href =
                        `detail.html?file=${encodeURIComponent(recipe.file)}`;
                }
        });

    recipeList.init(recipes);

    // ==============================
    // レシピ追加フォーム
    // ==============================

    const recipeForm =
        new RecipeForm({

            modal,
            modalBackground,

            closeButton:
                closeModalButton,

            saveButton:
                saveRecipeButton,

            titleInput:
                document.getElementById("inputTitle"),

            fileNameInput:
                document.getElementById("inputFileName"),

            categoryInput:
                document.getElementById("inputCategory"),

            sourceInput:
                document.getElementById("inputSource"),

            ratingInput:
                document.getElementById("inputRating"),

            ratingValue:
                document.getElementById("ratingValue"),

            imageInput:
                document.getElementById("inputImage"),

            urlInput:
                document.getElementById("inputUrl"),

            memoInput:
                document.getElementById("inputMemo"),

            ingredientsContainer:
                document.getElementById("ingredients"),

            preparationContainer:
                document.getElementById("preparation"),

            stepsContainer:
                document.getElementById("steps"),

            addIngredientButton:
                document.getElementById(
                    "addIngredientButton"
                ),

            addPreparationButton:
                document.getElementById(
                    "addPreparationButton"
                ),

            addStepButton:
                document.getElementById(
                    "addStepButton"
                )
        });

    // ==============================
    // 保存
    // ==============================

    recipeForm.setSaveHandler(
        async (recipe, editingRecipe, fileName) => {

            console.log("レシピ:", recipe);
            console.log("編集対象:", editingRecipe);
            console.log("ファイル名:", fileName);

            if (editingRecipe) {

                // ==============================
                // 編集
                // ==============================

                /*
                 * 現在は一覧画面からの編集処理は
                 * まだ実装しない。
                 */

                console.log(
                    "編集ファイル:",
                    editingRecipe.file
                );

                console.log(
                    "更新後JSON:",
                    recipe
                );

            } else {

                // ==============================
                // 新規追加
                // ==============================

                /*
                 * 既存ファイル名との重複チェック
                 */

                const exists =
                    recipeList.recipes.some(
                        existingRecipe =>
                            existingRecipe.file === fileName
                    );

                if (exists) {

                    showNotice(
                        `ファイル名が重複しています: ${fileName}`
                    );

                    return false;
                }

                const savingNotice =
                    showNotice(
                        "保存中...",
                        {
                            duration: null
                        }
                    );

                try {

                    const github =
                        getGithubApi();

                    // ==============================
                    // レシピJSON作成
                    // ==============================

                    const content =
                        JSON.stringify(
                            recipe,
                            null,
                            2
                        );

                    // ==============================
                    // index.json取得
                    // ==============================

                    const indexFile =
                        await github.getFile(
                            "data/index.json"
                        );

                    const indexContent =
                        github.decodeBase64(
                            indexFile.content
                        );

                    const files =
                        JSON.parse(indexContent);

                    if (!Array.isArray(files)) {

                        throw new Error(
                            "index.jsonは配列ではありません"
                        );
                    }

                    // ==============================
                    // index.jsonに追加
                    // ==============================

                    files.push(fileName);

                    const newIndexContent =
                        JSON.stringify(
                            files,
                            null,
                            2
                        );

                    // ==============================
                    // レシピJSON + index.json
                    // 1コミットでGitHubへ保存
                    // ==============================

                    await github.commitFiles(

                        [

                            {
                                path:
                                    `data/${fileName}`,

                                content:
                                    content
                            },

                            {
                                path:
                                    "data/index.json",

                                content:
                                    newIndexContent
                            }

                        ],

                        `feat: レシピ「${recipe.title}」を追加`
                    );

                    savingNotice.close();

                    // ==============================
                    // 画面に追加
                    // ==============================

                    recipeList.addRecipe({

                        ...recipe,

                        file:
                            fileName
                    });

                    console.log(
                        "GitHubへの保存成功:",
                        fileName
                    );

                } catch (error) {

                    savingNotice.close();

                    console.error(
                        "GitHubへの保存失敗:",
                        error
                    );

                    alert(
                        `レシピの保存に失敗しました。\n\n${error.message}`
                    );

                    return false;
                }
            }
        }
    );

    // ==============================
    // 追加ボタン
    // ==============================

    addButton.addEventListener(
        "click",
        () => {

            /*
             * 閲覧は未ログインでも可能。
             *
             * ただしレシピ追加には
             * GitHubログインが必要。
             */

            if (!isLoggedIn()) {

                showNotice(
                    "レシピを追加するにはGitHubにログインしてください"
                );

                return;
            }

            recipeForm.open();
        }
    );
}

// ==============================
// アプリ読み込み
// ==============================

async function loadApp() {

    try {

        const files =
            await loadIndex();

        const recipes =
            await loadRecipes(files);

        initializeApp(recipes);

    } catch (error) {

        console.error(error);

        const grid =
            document.getElementById(
                "recipeGrid"
            );

        grid.innerHTML =
            "";

        const message =
            document.getElementById(
                "emptyMessage"
            );

        message.textContent =
            "レシピデータを読み込めませんでした";

        message.style.display =
            "block";
    }
}

// ==============================
// 初期化
// ==============================

async function main() {

    /*
     * GitHub認証UIを初期化。
     *
     * 認証は閲覧には必要ない。
     */

    setupGithubAuth();

    /*
     * ログイン状態に関係なく
     * レシピを読み込む。
     */

    await loadApp();
}

main();