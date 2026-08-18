// js/recipe-list.js
// bk1
// 一覧表示・検索・カテゴリ・並び替えを担当

const CATEGORY_ORDER = [
    "主食",
    "肉類",
    "魚類",
    "副菜",
    "おやつ",
    "他"
];

const SOURCE_LABELS = {
    original: "自作",
    arranged: "アレンジ",
    reference: "参考"
};


/**
 * レシピ一覧を管理するクラス
 */
export class RecipeList {

    constructor({
        gridElement,
        emptyMessageElement,
        searchInput,
        sortSelect,
        categoryListElement,
        onRecipeClick
    }) {
        this.gridElement = gridElement;
        this.emptyMessageElement = emptyMessageElement;
        this.searchInput = searchInput;
        this.sortSelect = sortSelect;
        this.categoryListElement = categoryListElement;
        this.onRecipeClick = onRecipeClick;

        this.recipes = [];
        this.selectedCategory = "すべて";
    }


    /**
     * 初期化
     */
    init(recipes) {
        this.recipes = [...recipes];

        this.createCategoryButtons();

        this.searchInput.addEventListener("input", () => {
            this.render();
        });

        this.sortSelect.addEventListener("change", () => {
            this.render();
        });

        this.render();
    }


    /**
     * レシピを追加
     */
    addRecipe(recipe) {
        this.recipes.push(recipe);
        this.render();
    }


    /**
     * カテゴリボタンを作成
     */
    createCategoryButtons() {

        this.categoryListElement.innerHTML = "";

        const categories = [
            "すべて",
            ...CATEGORY_ORDER
        ];

        categories.forEach(category => {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "category-button";

            if (category === this.selectedCategory) {
                button.classList.add("active");
            }

            button.textContent = category;

            button.addEventListener("click", () => {

                this.selectedCategory = category;

                this.createCategoryButtons();
                this.render();
            });

            this.categoryListElement.appendChild(button);
        });
    }


    /**
     * 検索・カテゴリで絞り込む
     */
    getFilteredRecipes() {

        const keyword =
            this.searchInput.value
                .trim()
                .toLowerCase();

        return this.recipes.filter(recipe => {

            if (
                this.selectedCategory !== "すべて" &&
                recipe.category !== this.selectedCategory
            ) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            const ingredientText =
                (recipe.ingredients || [])
                    .map(ingredient => ingredient.name || "")
                    .join(" ");

            const searchableText = [
                recipe.title || "",
                recipe.category || "",
                recipe.memo || "",
                ingredientText
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(keyword);
        });
    }


    /**
     * 並び替え
     */
    sortRecipes(recipes) {

        const sorted = [...recipes];

        switch (this.sortSelect.value) {

            case "rating":
                sorted.sort((a, b) => {

                    const ratingA = Number(a.rating) || 0;
                    const ratingB = Number(b.rating) || 0;

                    if (ratingA !== ratingB) {
                        return ratingB - ratingA;
                    }

                    return this.categoryOrder(a.category)
                        - this.categoryOrder(b.category);
                });

                break;


            case "newest":
                // index.jsonの並びを新しい順として扱う
                sorted.reverse();
                break;


            case "oldest":
                // index.jsonの並びをそのまま使用
                break;


            case "category":
            default:
                sorted.sort((a, b) => {

                    const categoryA =
                        this.categoryOrder(a.category);

                    const categoryB =
                        this.categoryOrder(b.category);

                    if (categoryA !== categoryB) {
                        return categoryA - categoryB;
                    }

                    return (Number(a.rating) || 0)
                        - (Number(b.rating) || 0);
                });

                break;
        }

        return sorted;
    }


    /**
     * カテゴリの並び順
     */
    categoryOrder(category) {

        const index = CATEGORY_ORDER.indexOf(category);

        return index === -1
            ? CATEGORY_ORDER.length
            : index;
    }


    /**
     * 一覧を表示
     */
    render() {

        const filtered = this.getFilteredRecipes();
        const sorted = this.sortRecipes(filtered);

        this.gridElement.innerHTML = "";

        this.emptyMessageElement.style.display =
            sorted.length === 0
                ? "block"
                : "none";

        sorted.forEach(recipe => {

            const card = this.createCard(recipe);

            this.gridElement.appendChild(card);
        });
    }


    /**
     * レシピカードを作成
     */
    createCard(recipe) {

        const card = document.createElement("article");

        card.className = "recipe-card";

        card.addEventListener("click", () => {

            if (this.onRecipeClick) {
                this.onRecipeClick(recipe);
            }
        });


        // 画像
        const imageWrap = document.createElement("div");

        imageWrap.className = "recipe-image-wrap";


        if (
            typeof recipe.image === "string" &&
            recipe.image.trim() !== ""
        ) {

            const image = document.createElement("img");

            image.className = "recipe-image";
            image.src = recipe.image;
            image.alt = recipe.title || "レシピ画像";
            image.loading = "lazy";

            image.addEventListener("error", () => {

                image.remove();

                const noImage =
                    document.createElement("div");

                noImage.className = "no-image";
                noImage.textContent = "🍽";

                imageWrap.prepend(noImage);
            });

            imageWrap.appendChild(image);

        } else {

            const noImage =
                document.createElement("div");

            noImage.className = "no-image";
            noImage.textContent = "🍽";

            imageWrap.appendChild(noImage);
        }


        // 評価
        const rating = Number(recipe.rating) || 0;

        if (rating > 0) {

            const ratingElement =
                document.createElement("div");

            ratingElement.className = "recipe-rating";
            ratingElement.textContent = `★ ${rating}`;

            imageWrap.appendChild(ratingElement);
        }


        // 情報
        const info = document.createElement("div");

        info.className = "recipe-info";


        // タイトル
        const title =
            document.createElement("h2");

        title.className = "recipe-title";
        title.textContent = recipe.title || "";

        info.appendChild(title);


        // メタ情報
        const meta =
            document.createElement("div");

        meta.className = "recipe-meta";


        const source =
            document.createElement("span");

        source.className = "recipe-source";

        source.textContent =
            SOURCE_LABELS[recipe.source] || "";


        const category =
            document.createElement("span");

        category.className = "recipe-category";

        category.textContent =
            recipe.category || "";


        meta.appendChild(source);
        meta.appendChild(category);

        info.appendChild(meta);


        card.appendChild(imageWrap);
        card.appendChild(info);

        return card;
    }
}