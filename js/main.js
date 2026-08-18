// js/main.js
// bk1
// 全体を組み合わせるファイル


import { RecipeList } from "./recipe-list.js";
import { RecipeForm } from "./recipe-form.js";


async function loadIndex() {

    const response =
        await fetch("./data/index.json");

    if (!response.ok) {
        throw new Error(
            `index.jsonの読み込みに失敗しました: ${response.status}`
        );
    }

    return await response.json();
}


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
            gridElement: recipeGrid,
            emptyMessageElement: emptyMessage,
            searchInput,
            sortSelect,
            categoryListElement: categoryList,

            onRecipeClick: recipe => {

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


    // 保存されたレシピを一覧に仮追加
    recipeForm.setSaveHandler(recipe => {

        recipeList.addRecipe(recipe);

        console.log(
            "追加したレシピ:",
            recipe
        );
    });


    // ==============================
    // 追加ボタン
    // ==============================

    addButton.addEventListener(
        "click",
        () => recipeForm.open()
    );
}


// ==============================
// アプリ起動
// ==============================

async function main() {

    try {

        const recipes =
            await loadIndex();

        if (!Array.isArray(recipes)) {
            throw new Error(
                "index.jsonは配列である必要があります"
            );
        }

        initializeApp(recipes);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "recipeGrid"
        ).innerHTML = "";

        const message =
            document.getElementById(
                "emptyMessage"
            );

        message.textContent =
            "レシピデータを読み込めませんでした";

        message.style.display = "block";
    }
}


main();