/**
 * 実行時に各種コントローラーにイベントをバインドする
 */
document.addEventListener("DOMContentLoaded", () => {
    // 入力ボタン
    const $inputBtn = document.getElementById("InputBtn");
    $inputBtn.addEventListener("click", openModal);

    // モーダル要素
    const $registerModalEl = document.getElementById('registerModal');

    // 登録ボタン
    const $registerBtn = $registerModalEl.querySelector("#registerBtn");
    $registerBtn.addEventListener("click", registerIncomeExpense);

    // キャンセルボタン
    const $cancelBtn = $registerModalEl.querySelector("#cancelBtn");
    $cancelBtn.addEventListener("click", closeModal);
});


/**
 * 収支出モーダルを開く
 */
function openModal() {

    // モーダルを開く
    const $registerModalEl = document.getElementById('registerModal');
    const registerModal = bootstrap.Modal.getOrCreateInstance($registerModalEl);
    registerModal.show();

    // 日付は今日の日付をセット
    const dateInputEle = $registerModalEl.querySelector("#dateInput");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    dateInputEle.value = `${year}-${month}-${day}`;
}

function closeModal() {
    // モーダルを閉じる
    const $registerModalEl = document.getElementById('registerModal');
    const registerModal = bootstrap.Modal.getOrCreateInstance($registerModalEl);
    registerModal.hide();
}

function registerIncomeExpense(){
    const $registerModalEl = document.getElementById('registerModal');
    const registerModal = bootstrap.Modal.getOrCreateInstance($registerModalEl);
    const date = $registerModalEl.querySelector("#dateInput").value;
    const category = $registerModalEl.querySelector("#categoryInput").value;
    const income = $registerModalEl.querySelector("#incomeInput").value;
    const expense = $registerModalEl.querySelector("#expenseInput").value;

    const $tbody = document.querySelector("#tableBody");

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${date}</td>
        <td>${category}</td>
        <td>${income}</td>
        <td>${expense}</td>
    `;
    $tbody.appendChild(tr);

    // モーダルを閉じる
    registerModal.hide();

    // フォームをリセット
    $registerModalEl.querySelector("#incomeInput").value = "";
    $registerModalEl.querySelector("#expenseInput").value = "";
}