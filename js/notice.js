// js/notice.js
// bk1
// Notice表示を担当

export function showNotice(
    message,
    {
        duration = 3000
    } = {}
) {

    const notice =
        document.createElement("div");

    notice.className =
        "recipe-notice";

    notice.textContent =
        message;

    document.body.appendChild(
        notice
    );

    requestAnimationFrame(() => {

        notice.classList.add(
            "show"
        );
    });

    let timer = null;

    if (duration !== null) {

        timer =
            setTimeout(() => {

                closeNotice();

            }, duration);
    }

    function closeNotice() {

        if (!notice.isConnected) {
            return;
        }

        if (timer !== null) {

            clearTimeout(timer);

            timer = null;
        }

        notice.classList.remove(
            "show"
        );

        setTimeout(() => {

            notice.remove();

        }, 300);
    }

    return {
        close:
            closeNotice
    };
}