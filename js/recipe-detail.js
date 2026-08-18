// js/recipe-detail.js
// bk2
// 詳細画面を担当


import { RecipeForm } from "./recipe-form.js";
import { github } from "./github-config.js";

const SOURCE_LABELS = {
    original: "自作",
    arranged: "アレンジ",
    reference: "参考"
};


const GROUP_CLASSES = [
    "group-A",
    "group-B",
    "group-C",
    "group-D"
];


let recipe = null;
let recipeFile = null;
let recipeSha = null;

/* ==============================
   URLからファイル名を取得
   ============================== */

function getRecipeFile() {

    const params =
        new URLSearchParams(location.search);

    return params.get("file");
}


/* ==============================
   レシピJSON読み込み
   ============================== */

async function loadRecipe(file) {

    if (!file) {

        throw new Error(
            "レシピファイルが指定されていません"
        );
    }


    /*
     * セキュリティ上、data/以外を
     * 読み込まないようにする。
     */

    const safeFile =
        file
            .split("/")
            .pop();


    const githubFile =
        await github.getFile(
            `data/${safeFile}`
        );


    const content =
        github.decodeBase64(
            githubFile.content
        );

    recipeSha =
        githubFile.sha;

    return JSON.parse(content);
}


/* ==============================
   基本情報
   ============================== */

function renderBasicInfo() {

    document.title =
        recipe.title || "レシピ";


    document.getElementById(
        "recipeTitle"
    ).textContent =
        recipe.title || "";


    /* 画像 */

    const image =
        document.getElementById(
            "recipeImage"
        );

    const noImage =
        document.getElementById(
            "noImage"
        );


    if (
        typeof recipe.image === "string" &&
        recipe.image.trim() !== ""
    ) {

        image.src =
            recipe.image;

        image.alt =
            recipe.title || "";

        image.style.display =
            "block";

        noImage.style.display =
            "none";

    } else {

        image.style.display =
            "none";

        noImage.style.display =
            "flex";
    }


    image.addEventListener(
        "error",
        () => {

            image.style.display =
                "none";

            noImage.style.display =
                "flex";
        }
    );


    /* メタ情報 */

    const meta =
        document.getElementById(
            "recipeMeta"
        );

    meta.innerHTML = "";


    const rating =
        Number(recipe.rating) || 0;


    const ratingElement =
        document.createElement("span");

    ratingElement.className =
        "meta-rating";

    if (rating > 0) {

        ratingElement.textContent =
            "★".repeat(rating) +
            "☆".repeat(5 - rating);

    } else {

        ratingElement.textContent =
            "評価なし";
    }


    const category =
        document.createElement("span");

    category.textContent =
        recipe.category || "";


    const source =
        document.createElement("span");

    source.textContent =
        SOURCE_LABELS[recipe.source] || "";


    meta.appendChild(ratingElement);
    meta.appendChild(category);
    meta.appendChild(source);


    /* URL */

    renderUrl();
}


/* ==============================
   URL表示
   ============================== */

function renderUrl() {

    const area =
        document.getElementById(
            "recipeUrl"
        );


    area.innerHTML = "";


    if (
        !recipe.url ||
        !recipe.url.trim()
    ) {
        area.style.display =
            "none";

        return;
    }


    area.style.display =
        "block";


    const link =
        document.createElement("a");

    link.href =
        recipe.url;

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";

    link.textContent =
        recipe.url;


    area.appendChild(link);


    try {

        const domain =
            document.createElement("div");

        domain.className =
            "detail-url-domain";

        domain.textContent =
            new URL(recipe.url)
                .hostname;

        area.appendChild(domain);

    } catch {
        // 不正なURLの場合はドメインを表示しない
    }
}


/* ==============================
   分量
   ============================== */

function formatAmount(ingredient, ratio) {

    const amount =
        ingredient.amount;


    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {
        return ingredient.unit || "";
    }


    /*
     * 数値の場合だけ倍率計算。
     *
     * "1/2" や "適量" などの文字列は
     * そのまま表示する。
     */
    if (
        typeof amount === "number" &&
        Number.isFinite(amount)
    ) {

        let value =
            amount * ratio;


        value =
            Math.round(value * 100) / 100;


        if (
            ingredient.unit === "大さじ" ||
            ingredient.unit === "中さじ" ||
            ingredient.unit === "小さじ"
        ) {

            return (
                ingredient.unit +
                value
            );
        }


        return (
            value +
            (ingredient.unit || "")
        );
    }


    return (
        String(amount) +
        (ingredient.unit || "")
    );
}


/* ==============================
   材料
   ============================== */

function renderIngredients(ratio) {

    const container =
        document.getElementById(
            "ingredients"
        );


    container.innerHTML = "";


    (recipe.ingredients || [])
        .forEach(ingredient => {

            const row =
                document.createElement("div");

            row.className =
                "ingredient-item";


            /* group */

            const group =
                document.createElement("div");

            group.className =
                "ingredient-group";

            group.textContent =
                ingredient.group || "";


            /* name */

            const name =
                document.createElement("div");

            name.className =
                "ingredient-name";

            name.textContent =
                ingredient.name || "";


            /* amount */

            const amount =
                document.createElement("div");

            amount.className =
                "ingredient-amount";

            amount.textContent =
                formatAmount(
                    ingredient,
                    ratio
                );


            if (
                ingredient.group &&
                ["A", "B", "C", "D"]
                    .includes(ingredient.group)
            ) {

                row.classList.add(
                    `group-${ingredient.group}`
                );
            }


            row.appendChild(group);
            row.appendChild(name);
            row.appendChild(amount);

            container.appendChild(row);
        });
}


/* ==============================
   事前準備
   ============================== */

function renderPreparation() {

    const section =
        document.getElementById(
            "preparationSection"
        );

    const list =
        document.getElementById(
            "preparation"
        );


    list.innerHTML = "";


    const preparation =
        recipe.preparation || [];


    if (preparation.length === 0) {

        section.style.display =
            "none";

        return;
    }


    section.style.display =
        "block";


    preparation.forEach(text => {

        const li =
            document.createElement("li");

        li.textContent =
            text;

        list.appendChild(li);
    });
}


/* ==============================
   手順
   ============================== */

function renderSteps() {

    const list =
        document.getElementById(
            "steps"
        );


    list.innerHTML = "";


    (recipe.steps || [])
        .forEach(text => {

            const li =
                document.createElement("li");

            li.textContent =
                text;

            list.appendChild(li);
        });
}


/* ==============================
   メモ
   ============================== */

function renderMemo() {

    const section =
        document.getElementById(
            "memoSection"
        );

    const memo =
        document.getElementById(
            "memo"
        );


    memo.textContent =
        recipe.memo || "";


    if (
        !recipe.memo ||
        !recipe.memo.trim()
    ) {

        section.style.display =
            "none";

    } else {

        section.style.display =
            "block";
    }
}


/* ==============================
   全体表示
   ============================== */

function renderRecipe() {

    renderBasicInfo();
    renderIngredients(1);
    renderPreparation();
    renderSteps();
    renderMemo();
}


/* ==============================
   分量倍率
   ============================== */

function setupServingSelect() {

    const select =
        document.getElementById(
            "servingSelect"
        );

    const note =
        document.getElementById(
            "servingNote"
        );


    select.addEventListener(
        "change",
        () => {

            const ratio =
                Number(select.value);


            renderIngredients(ratio);


            switch (ratio) {

                case 2:
                    note.textContent =
                        "2倍の分量";
                    break;

                case 0.5:
                    note.textContent =
                        "半分の分量";
                    break;

                case 0.33:
                    note.textContent =
                        "1/3の分量";
                    break;

                default:
                    note.textContent =
                        "";
            }
        }
    );
}


/* ==============================
   編集フォーム
   ============================== */

function setupEditForm() {

    const recipeForm =
        new RecipeForm({

            modal:
                document.getElementById(
                    "recipeModal"
                ),

            modalBackground:
                document.getElementById(
                    "modalBackground"
                ),

            closeButton:
                document.getElementById(
                    "closeModalButton"
                ),

            saveButton:
                document.getElementById(
                    "saveRecipeButton"
                ),

            titleInput:
                document.getElementById(
                    "inputTitle"
                ),

            fileNameInput:
                document.getElementById(
                    "inputFileName"
                ),

            categoryInput:
                document.getElementById(
                    "inputCategory"
                ),

            sourceInput:
                document.getElementById(
                    "inputSource"
                ),

            ratingInput:
                document.getElementById(
                    "inputRating"
                ),

            ratingValue:
                document.getElementById(
                    "ratingValue"
                ),

            imageInput:
                document.getElementById(
                    "inputImage"
                ),

            urlInput:
                document.getElementById(
                    "inputUrl"
                ),

            memoInput:
                document.getElementById(
                    "inputMemo"
                ),

            ingredientsContainer:
                document.getElementById(
                    "ingredientsForm"
                ),

            preparationContainer:
                document.getElementById(
                    "preparationForm"
                ),

            stepsContainer:
                document.getElementById(
                    "stepsForm"
                ),

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


    /* 編集ボタン */

    document.getElementById(
        "editButton"
    ).addEventListener(
        "click",
        () => {

            recipeForm.open(recipe);
        }
    );


    /*
     * 編集内容をGitHubへ保存する。
     *
     * recipeShaを指定することで、
     * 既存のレシピJSONを更新する。
     */
    recipeForm.setSaveHandler(
        async (
            updatedRecipe,
            editingRecipe,
            fileName
        ) => {

            try {

                // ==============================
                // JSON作成
                // ==============================

                const content =
                    JSON.stringify(
                        updatedRecipe,
                        null,
                        2
                    );


                // ==============================
                // GitHubへ保存
                // ==============================

                const savedFile =
                    await github.saveFile(
                        `data/${recipeFile}`,
                        content,
                        `fix: レシピ「${updatedRecipe.title}」を更新`,
                        recipeSha
                    );

                recipeSha =
                    savedFile.content.sha;


                // ==============================
                // 画面を更新
                // ==============================

                recipe =
                    updatedRecipe;


                renderRecipe();


                console.log(
                    "GitHubへの保存成功:",
                    recipeFile
                );


            } catch (error) {

                console.error(
                    "GitHubへの保存失敗:",
                    error
                );


                alert(
                    `レシピの保存に失敗しました。\n\n${error.message}`
                );


                /*
                 * falseを返すことで、
                 * RecipeForm側ではモーダルを閉じない。
                 */

                return false;
            }
        }
    );
}


/* ==============================
   戻る
   ============================== */

function setupBackButton() {

    document.getElementById(
        "backButton"
    ).addEventListener(
        "click",
        () => {

            if (history.length > 1) {

                history.back();

            } else {

                location.href =
                    "index.html";
            }
        }
    );
}


/* ==============================
   初期化
   ============================== */

async function main() {

    try {

        recipeFile =
            getRecipeFile();


        recipe =
            await loadRecipe(
                recipeFile
            );


        renderRecipe();

        setupServingSelect();

        setupEditForm();

        setupBackButton();


    } catch (error) {

        console.error(error);

        document.body.innerHTML = `
            <main style="
                padding: 30px 20px;
                text-align: center;
            ">
                <h1>レシピを読み込めませんでした</h1>
                <p>${escapeHtml(error.message)}</p>
                <button
                    onclick="location.href='index.html'"
                >
                    一覧へ戻る
                </button>
            </main>
        `;
    }
}


/* ==============================
   HTMLエスケープ
   ============================== */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


main();