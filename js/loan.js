import { db, addDoc, collection, query, getDocs, orderBy, auth, onAuthStateChanged } from "./firebase.js";
import { Timestamp } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 家計簿画面ロード時イベント
window.addEventListener('load', function () {
	MainView.Init();
    RegisterModal.Init();
});

/**
 * ローン登録メイン画面
 */
const MainView = (() => {

    let openModalBtnEle = null;
    
    /**
     * 初期化
     */
    function Init(){
        // ローン登録ボタンにイベントをバインド
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
    let goodsInputEle = null;
    let paymentsEle = null;
    let monthlyFeeEle = null;
    let dateInputEle = null;
    let allLoanTableEle = null;

    /**
     * 初期化
     */
    function Init(){

        // 各要素を取得
        modal = document.getElementById('loanRegisterModal');           // モーダル
        goodsInputEle = document.getElementById('goodsInput');          // 日付
        paymentsEle = document.getElementById('payments');              // 収入
        monthlyFeeEle = document.getElementById('monthlyFee');          // 支出
        dateInputEle = document.getElementById('dateInput');            // カテゴリー
        allLoanTableEle = document.getElementById('alllLoan')           // 一覧
        
        // イベントのバインド
        // 登録ボタン
        const registerBtnEle = modal.querySelector("#registerBtn");
        registerBtnEle.addEventListener("click", registerData);
        // キャンセルボタン
        const cancelBtn = modal.querySelector("#cancelBtn");
        cancelBtn.addEventListener("click", closeModal);
    }

    /**
     * 収支登録用モーダルを開く
     */
    function OpenModal(){

        // コントローラーの中身を空にする
        goodsInputEle.value = null;
        paymentsEle.value = null;
        monthlyFeeEle.value = null;
        dateInputEle.value = null;

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
     * 収支を登録する
     */
    async function registerData(){

        // 入選択値
        const goods = goodsInputEle.value;
        const payments = paymentsEle.value;
        const monthlyFee = monthlyFeeEle.value;
        const date = dateInputEle.value;

        // 登録データ
        const data = {
            goods: goods,
            payments: Number(payments),
            monthlyFee: Number(monthlyFee),
            date: Timestamp.fromDate(new Date(date))
        };

        try{
            // データを登録
            await addDoc(collection(db, "Loan"), data);
            alert("保存しました");

            // テーブル要素作成
            CreateTableEle();

            // モーダルを閉じる
            closeModal();
        }
        catch(e){
            console.error("追加失敗", e);
            alert("保存に失敗しました");
        }
        
    }

    async function CreateTableEle(){

        // 要素内をクリア
		allLoanTableEle.innerHTML = null;

        // データ取得用クエリ
        const getAllLoanQuery = query(
            collection(db, "Loan"),
            orderBy("date", "asc")
        );

        // クエリを実行
        const snapshot = await getDocs(getAllLoanQuery);

		// テーブル要素を作成
		const table = document.createElement("table");
		table.classList.add("table", "table-info", "table-striped", "text-start");

		// thead
		table.innerHTML = `
			<thead class="table-dark">
			<tr>
				<th>商品</th>
				<th>支払回数</th>
				<th>月額</th>
				<th>支払い完了日</th>
			</tr>
			</thead>
			<tbody></tbody>
		`;

		const tbody = table.querySelector("tbody");

		snapshot.forEach((doc) => {

			const record = {
			id: doc.id,
			...doc.data()
			};

			// 行作成
			const tr = document.createElement("tr");

            tr.classList.add("table-primary");
            tr.innerHTML = `
                <td>${record.goods}</td>
                <td>${record.payments.toLocaleString()}回</td>
                <td>¥${record.monthlyFee.toLocaleString()}</td>
                <td>${record.date.toDate().toLocaleDateString("ja-JP")}</td>
            `;
			tbody.appendChild(tr);
		});

		allLoanTableEle.appendChild(table);
    }

    return{
        Init: Init,
        OpenModal: OpenModal,
        CreateTableEle: CreateTableEle
    }

})();

/**
 * ログイン後の処理
 */
onAuthStateChanged(auth, async(user) => {
	
	if(user){
		RegisterModal.CreateTableEle();
	}
})