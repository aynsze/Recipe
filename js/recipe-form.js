// js/recipe-form.js
// bk3
// JSON型を作る部分、追加・編集共通化

const UNIT_OPTIONS = [
    "g",
    "kg",
    "ml",
    "L",
    "個",
    "枚",
    "袋",
    "本",
    "束",
    "大さじ",
    "中さじ",
    "小さじ",
    "適量",
    "少々"
];


const GROUP_OPTIONS = [
    "",
    "A",
    "B",
    "C",
    "D"
];


export class RecipeForm {

    constructor({
        modal,
        modalBackground,
        closeButton,
        saveButton,

        titleInput,
        fileNameInput,

        categoryInput,
        sourceInput,
        ratingInput,
        ratingValue,
        imageInput,
        urlInput,
        memoInput,

        ingredientsContainer,
        preparationContainer,
        stepsContainer,

        addIngredientButton,
        addPreparationButton,
        addStepButton
    }) {

        this.modal = modal;
        this.modalBackground = modalBackground;

        this.closeButton = closeButton;
        this.saveButton = saveButton;

        this.titleInput = titleInput;
        this.fileNameInput = fileNameInput;

        this.categoryInput = categoryInput;
        this.sourceInput = sourceInput;
        this.ratingInput = ratingInput;
        this.ratingValue = ratingValue;
        this.imageInput = imageInput;
        this.urlInput = urlInput;
        this.memoInput = memoInput;

        this.ingredientsContainer =
            ingredientsContainer;

        this.preparationContainer =
            preparationContainer;

        this.stepsContainer =
            stepsContainer;

        this.addIngredientButton =
            addIngredientButton;

        this.addPreparationButton =
            addPreparationButton;

        this.addStepButton =
            addStepButton;

        this.onSave = null;

        this.editingRecipe = null;

        this.setupEvents();
    }


    /* ==============================
       イベント
       ============================== */

    setupEvents() {

        this.closeButton.addEventListener(
            "click",
            () => this.close()
        );


        this.modalBackground.addEventListener(
            "click",
            () => this.close()
        );


        this.ratingInput.addEventListener(
            "input",
            () => this.updateRating()
        );


        this.addIngredientButton.addEventListener(
            "click",
            () => this.addIngredientRow()
        );


        this.addPreparationButton.addEventListener(
            "click",
            () => this.addPreparationRow()
        );


        this.addStepButton.addEventListener(
            "click",
            () => this.addStepRow()
        );


        this.saveButton.addEventListener(
            "click",
            () => this.save()
        );
    }


    /* ==============================
       開く
       ============================== */

    open(recipe = null) {

        this.editingRecipe =
            recipe
                ? structuredClone(recipe)
                : null;


        if (recipe) {

            // 編集
            this.loadRecipe(recipe);

            this.setFileNameMode(false);

        } else {

            // 新規追加
            this.reset();

            this.setFileNameMode(true);
        }


        this.modal.classList.add("open");

        this.modalBackground.classList.add(
            "open"
        );


        this.modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        this.titleInput.focus();
    }


    /* ==============================
       ファイル名入力欄の表示
       ============================== */

    setFileNameMode(isNew) {

        const wrapper =
            this.fileNameInput?.closest(
                ".file-name-field"
            );


        if (!wrapper) {
            return;
        }


        wrapper.style.display =
            isNew ? "" : "none";
    }


    /* ==============================
       閉じる
       ============================== */

    close() {

        this.modal.classList.remove(
            "open"
        );

        this.modalBackground.classList.remove(
            "open"
        );


        this.modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";


        this.editingRecipe =
            null;
    }


    /* ==============================
       新規フォーム
       ============================== */

    reset() {

        this.titleInput.value = "";

        this.fileNameInput.value = "";


        this.categoryInput.value =
            "主食";

        this.sourceInput.value =
            "original";

        this.ratingInput.value =
            "0";

        this.ratingValue.textContent =
            "未設定";

        this.imageInput.value = "";

        this.urlInput.value = "";

        this.memoInput.value = "";


        this.ingredientsContainer.innerHTML =
            "";

        this.preparationContainer.innerHTML =
            "";

        this.stepsContainer.innerHTML =
            "";


        this.addIngredientRow();
        this.addPreparationRow();
        this.addStepRow();
    }


    /* ==============================
       編集対象をフォームに読み込む
       ============================== */

    loadRecipe(recipe) {

        this.titleInput.value =
            recipe.title || "";


        this.categoryInput.value =
            recipe.category || "他";


        this.sourceInput.value =
            recipe.source || "original";


        this.ratingInput.value =
            Number(recipe.rating) || 0;


        this.updateRating();


        this.imageInput.value =
            recipe.image || "";


        this.urlInput.value =
            recipe.url || "";


        this.memoInput.value =
            recipe.memo || "";


        this.ingredientsContainer.innerHTML =
            "";

        this.preparationContainer.innerHTML =
            "";

        this.stepsContainer.innerHTML =
            "";


        /* 材料 */

        const ingredients =
            Array.isArray(recipe.ingredients)
                ? recipe.ingredients
                : [];


        ingredients.forEach(
            ingredient => {

                this.addIngredientRow(
                    ingredient
                );
            }
        );


        this.addIngredientRow();


        /* 事前準備 */

        const preparation =
            Array.isArray(recipe.preparation)
                ? recipe.preparation
                : [];


        preparation.forEach(
            text => {

                this.addPreparationRow(
                    text
                );
            }
        );


        this.addPreparationRow();


        /* 手順 */

        const steps =
            Array.isArray(recipe.steps)
                ? recipe.steps
                : [];


        steps.forEach(
            text => {

                this.addStepRow(
                    text
                );
            }
        );


        this.addStepRow();
    }


    /* ==============================
       評価
       ============================== */

    updateRating() {

        const value =
            Number(
                this.ratingInput.value
            );


        this.ratingValue.textContent =
            value === 0
                ? "未設定"
                : value;
    }


    /* ==============================
       select作成
       ============================== */

    createSelect(
        options,
        className
    ) {

        const select =
            document.createElement(
                "select"
            );


        select.className =
            className;


        options.forEach(option => {

            const element =
                document.createElement(
                    "option"
                );


            element.value =
                option;


            element.textContent =
                option === ""
                    ? "-"
                    : option;


            select.appendChild(
                element
            );
        });


        return select;
    }


    /* ==============================
       材料行
       ============================== */

    addIngredientRow(data = {}) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "ingredient-row";


        const group =
            this.createSelect(
                GROUP_OPTIONS,
                "ingredient-group"
            );


        group.value =
            data.group || "";


        const name =
            document.createElement(
                "input"
            );


        name.type =
            "text";

        name.className =
            "ingredient-name";

        name.placeholder =
            "材料";

        name.value =
            data.name || "";


        const amount =
            document.createElement(
                "input"
            );


        amount.type =
            "text";

        amount.className =
            "ingredient-amount";

        amount.placeholder =
            "量";


        if (
            data.amount !== undefined &&
            data.amount !== null
        ) {

            amount.value =
                data.amount;
        }


        const unit =
            this.createSelect(
                UNIT_OPTIONS,
                "ingredient-unit"
            );


        unit.value =
            data.unit || "g";


        const remove =
            document.createElement(
                "button"
            );


        remove.type =
            "button";

        remove.className =
            "remove-button";

        remove.textContent =
            "×";


        remove.addEventListener(
            "click",
            () => row.remove()
        );


        row.appendChild(group);
        row.appendChild(name);
        row.appendChild(amount);
        row.appendChild(unit);
        row.appendChild(remove);


        this.ingredientsContainer
            .appendChild(row);
    }


    /* ==============================
       事前準備行
       ============================== */

    addPreparationRow(value = "") {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "preparation-row";


        const number =
            document.createElement(
                "div"
            );


        number.className =
            "step-number";


        const input =
            document.createElement(
                "textarea"
            );


        input.className =
            "preparation-input";

        input.placeholder =
            "事前準備";

        input.value =
            value;


        const remove =
            document.createElement(
                "button"
            );


        remove.type =
            "button";

        remove.className =
            "remove-button";

        remove.textContent =
            "×";


        remove.addEventListener(
            "click",
            () => {

                row.remove();

                this.updatePreparationNumbers();
            }
        );


        row.appendChild(number);
        row.appendChild(input);
        row.appendChild(remove);


        this.preparationContainer
            .appendChild(row);


        this.updatePreparationNumbers();
    }


    /* ==============================
       手順行
       ============================== */

    addStepRow(value = "") {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "step-row";


        const number =
            document.createElement(
                "div"
            );


        number.className =
            "step-number";


        const input =
            document.createElement(
                "textarea"
            );


        input.className =
            "step-input";

        input.placeholder =
            "手順";

        input.value =
            value;


        const remove =
            document.createElement(
                "button"
            );


        remove.type =
            "button";

        remove.className =
            "remove-button";

        remove.textContent =
            "×";


        remove.addEventListener(
            "click",
            () => {

                row.remove();

                this.updateStepNumbers();
            }
        );


        row.appendChild(number);
        row.appendChild(input);
        row.appendChild(remove);


        this.stepsContainer
            .appendChild(row);


        this.updateStepNumbers();
    }


    /* ==============================
       番号
       ============================== */

    updatePreparationNumbers() {

        const rows =
            this.preparationContainer
                .querySelectorAll(
                    ".preparation-row"
                );


        rows.forEach(
            (row, index) => {

                row.querySelector(
                    ".step-number"
                ).textContent =
                    index + 1;
            }
        );
    }


    updateStepNumbers() {

        const rows =
            this.stepsContainer
                .querySelectorAll(
                    ".step-row"
                );


        rows.forEach(
            (row, index) => {

                row.querySelector(
                    ".step-number"
                ).textContent =
                    index + 1;
            }
        );
    }


    /* ==============================
       材料取得
       ============================== */

    getIngredients() {

        const ingredients = [];


        const rows =
            this.ingredientsContainer
                .querySelectorAll(
                    ".ingredient-row"
                );


        rows.forEach(row => {

            const name =
                row.querySelector(
                    ".ingredient-name"
                )
                    .value
                    .trim();


            if (!name) {
                return;
            }


            const group =
                row.querySelector(
                    ".ingredient-group"
                ).value;


            const amountValue =
                row.querySelector(
                    ".ingredient-amount"
                )
                    .value
                    .trim();


            const unit =
                row.querySelector(
                    ".ingredient-unit"
                ).value;


            let amount =
                amountValue;


            if (
                amountValue !== "" &&
                !Number.isNaN(
                    Number(amountValue)
                )
            ) {

                amount =
                    Number(amountValue);
            }


            ingredients.push({

                group:
                    group || null,

                name,

                amount,

                unit:
                    unit || null
            });
        });


        return ingredients;
    }


    /* ==============================
       事前準備取得
       ============================== */

    getPreparation() {

        const preparation = [];


        const rows =
            this.preparationContainer
                .querySelectorAll(
                    ".preparation-row"
                );


        rows.forEach(row => {

            const value =
                row.querySelector(
                    ".preparation-input"
                )
                    .value
                    .trim();


            if (value) {
                preparation.push(value);
            }
        });


        return preparation;
    }


    /* ==============================
       手順取得
       ============================== */

    getSteps() {

        const steps = [];


        const rows =
            this.stepsContainer
                .querySelectorAll(
                    ".step-row"
                );


        rows.forEach(row => {

            const value =
                row.querySelector(
                    ".step-input"
                )
                    .value
                    .trim();


            if (value) {
                steps.push(value);
            }
        });


        return steps;
    }


    /* ==============================
       レシピJSON作成
       ============================== */

    getRecipe() {

        return {

            title:
                this.titleInput.value.trim(),

            source:
                this.sourceInput.value,

            category:
                this.categoryInput.value,

            rating:
                Number(
                    this.ratingInput.value
                ),

            image:
                this.imageInput.value.trim(),

            url:
                this.urlInput.value.trim(),

            ingredients:
                this.getIngredients(),

            preparation:
                this.getPreparation(),

            steps:
                this.getSteps(),

            memo:
                this.memoInput.value.trim()
        };
    }


    /* ==============================
       ファイル名
       ============================== */

    getFileName() {

        let fileName =
            this.fileNameInput.value.trim();


        /*
         * ファイル名が空欄の場合は
         * タイトルから自動生成する。
         */

        if (!fileName) {

            fileName =
                this.titleInput.value.trim();
        }


        /*
         * パスとして解釈される文字を禁止。
         *
         * 日本語・英数字・空白・
         * ハイフン・アンダースコアなどは使用可能。
         */

        if (
            /[\/\\:*?"<>|]/.test(fileName)
        ) {

            alert(
                "ファイル名に使用できない文字が含まれています"
            );

            this.fileNameInput.focus();

            return null;
        }


        /*
         * .jsonが付いていなければ追加
         */

        if (
            !fileName
                .toLowerCase()
                .endsWith(".json")
        ) {

            fileName += ".json";
        }


        return fileName;
    }


    /* ==============================
       保存
       ============================== */

    save() {

        const recipe =
            this.getRecipe();


        if (!recipe.title) {

            alert(
                "タイトルを入力してください"
            );

            this.titleInput.focus();

            return;
        }


        let fileName = null;


        /*
         * 新規追加の場合のみ
         * ファイル名を取得する。
         *
         * 空欄の場合はタイトルから
         * 自動生成する。
         */

        if (!this.editingRecipe) {

            fileName =
                this.getFileName();


            /*
             * 使用できない文字が
             * 含まれていた場合
             */

            if (!fileName) {
                return;
            }
        }


        if (this.onSave) {

            const saved =
                this.onSave(
                    recipe,
                    this.editingRecipe,
                    fileName
                );


            /*
             * falseが返された場合は
             * 保存失敗としてフォームを閉じない。
             */

            if (saved === false) {
                return;
            }
        }


        this.close();
    }


    /* ==============================
       保存処理を登録
       ============================== */

    setSaveHandler(handler) {

        this.onSave =
            handler;
    }
}