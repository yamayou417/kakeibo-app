import { db, addDoc, collection } from "./firebase.js";
import { Timestamp } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 家計簿画面ロード時イベント
window.addEventListener('load', function () {
	MainView.Init();
    RegisterModal.Init();
});

/**
 * 家計簿メイン画面
 */
const MainView = (() => {

    let openModalBtnEle = null;
    
    /**
     * 初期化
     */
    function Init(){
        // 収支登録ボタンにイベントをバインド
        openModalBtnEle = document.getElementById('modalOpenBtn');
        openModalBtnEle.addEventListener('click', RegisterModal.OpenModal);
    }

    return{
        Init: Init
    }

})();

/**
 * 収支登録モーダル
 */
const RegisterModal = (() => {

    let modal = null;
    let dateInputEle = null;
    let incomeBtnEle = null;
    let expenseBtnEle = null;
    let categorySelectEle = null;
    let moneyEle = null;

    // 支出リスト
    const incomeCategoryList = [
        {value:'food', label:'食費'},
        {value:'dailyItem', label:'日用品'},
        {value:'travel', label:'交通費'},
        {value:'fashion', label:'衣服'},
        {value:'hobby', label:'趣味・娯楽'}
    ]

    // 収入リスト
    const expenseCategoryList = [
        {value:'salary', label:'給料'},
        {value:'bonus', label:'ボーナス'},
        {value:'other', label:'その他'}
    ]

    /**
     * 初期化
     */
    function Init(){

        // 各要素を取得
        modal = document.getElementById('registerModal');               // モーダル
        dateInputEle = document.getElementById('dateInput');            // 日付
        incomeBtnEle = document.getElementById('incomeBtn');            // 収入
        expenseBtnEle = document.getElementById('expenseBtn');          // 支出
        categorySelectEle = document.getElementById('categorySelect');  // カテゴリー
        moneyEle = document.getElementById('money');                    // 金額
        
        // イベントのバインド
        // 登録ボタン
        const registerBtnEle = modal.querySelector("#registerBtn");
        registerBtnEle.addEventListener("click", registerData);
        // キャンセルボタン
        const cancelBtn = modal.querySelector("#cancelBtn");
        cancelBtn.addEventListener("click", closeModal);
        // カテゴリーリスト
        incomeBtnEle.addEventListener('change', setCategoryList);
        expenseBtnEle.addEventListener('change', setCategoryList);
    }

    /**
     * 収支登録用モーダルを開く
     */
    function OpenModal(){

        // 今日の日付をセットする
        const today = new Date().toISOString().split('T')[0];
        dateInputEle.value = today;

        // 収入をデフォルト選択
        incomeBtnEle.checked = true;
        setCategoryList();

        // 金額は空にする
        moneyEle.value = null;

        // モーダルを開く
        const registerModal = bootstrap.Modal.getOrCreateInstance(modal);
        registerModal.show();
    }

    /**
     * 収支登録用モーダルを閉じる
     */
    function closeModal() {
        const registerModal = bootstrap.Modal.getOrCreateInstance(modal);
        registerModal.hide();
    }

    /**
     * セレクトボックスの中身をセットする
     */
    function setCategoryList(){
        // セレクトボックスの中身をクリアする
        categorySelectEle.innerHTML = null;

        // 収入がTrueの時
        if(expenseBtnEle.checked == true){
            // セレクトボックスの中身をセットする
            incomeCategoryList.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.value;
                option.textContent = cat.label;
                categorySelectEle.appendChild(option);
            });
        }
        // 支出の時
        else{
            // セレクトボックスの中身をセットする
            expenseCategoryList.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.value;
                option.textContent = cat.label;
                categorySelectEle.appendChild(option);
            });
        }
    }

    /**
     * 収支を登録する
     */
    async function registerData(){

        // 入選択値
        const date = dateInputEle.value;
        const income = incomeBtnEle.checked;
        const expense = expenseBtnEle.checked;
        const category = categorySelectEle.value;
        const money = moneyEle.value;

        // 登録データ
        const data = {
            date: Timestamp.fromDate(new Date(date)),
            income: income,
            expense: expense,
            category: category,
            money: Number(money)
        };

        try{
            const docRef = await addDoc(collection(db, "Kakeibo"), data);
            alert("保存しました");
            closeModal();
        }
        catch(e){
            console.error("追加失敗", e);
            alert("保存に失敗しました");
        }
        
    }

    return{
        Init: Init,
        OpenModal: OpenModal
    }

})();