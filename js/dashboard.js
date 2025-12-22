import { auth, signInWithPopup, GoogleAuthProvider, signOut, collection, onAuthStateChanged } from "./firebase.js";
import { db, query, getDocs, orderBy, limit, where } from "./firebase.js";
import { Timestamp } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// ダッシュボード画面ロード時イベント
window.addEventListener('load', function () {
	Login.Init();
	Logout.Init();
	RecentlyTrade.Init();
	ThisMonthTotalRevenue.Init();
	ThisYearTotalRevenue.Init();
});

/**
 * ログイン
 * [CreateDate:2025/12/10]
 */
const Login = (() => {

	// ログインボタン要素
	let loginBtnEle = null;

	/**
	 * 初期化
	 * [CreateDate:2025/12/10]
	 */
	function Init(){

		// ログインボタンにイベントをバインド
		loginBtnEle = document.getElementById('loginBtn');
		loginBtnEle.addEventListener("click", googleLogin);
	}

	/**
	 * Googleログイン処理
	 * [CreateDate:2025/12/10]
	 */
	async function googleLogin(){

		// Googleログイン画面を表示
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	}

	return{
		Init: Init,
		googleLogin: googleLogin
	};

})();

/**
 * ログアウト
 * [CreateDate:2025/12/11]
 */
const Logout = (() => {

	// ログアウトボタン要素
	let logoutBtnEle = null;

	/**
	 * 初期化
	 * [CreateDate:2025/12/11]
	 */
	function Init(){

		// ログアウトボタンにイベントをバインド
		logoutBtnEle = document.getElementById('logoutBtn');
		logoutBtnEle.addEventListener("click", googleLogout);
	}

	/**
	 * Googleログアウト処理
	 * [CreateDate:2025/12/11]
	 */
	function googleLogout(){

		// ログアウト
    	signOut(auth);
	}

	return{
		Init: Init
	};

})();

/**
 * ログイン後の処理
 */
onAuthStateChanged(auth, async(user) => {
	
	if(user){
		RecentlyTrade.GetRecentlyTrade();
		ThisMonthTotalRevenue.GetTotalRevenue();
		ThisYearTotalRevenue.GetTotalRevenue();
	}
	else{
		RecentlyTrade.CreateEmpltyEle();
		ThisMonthTotalRevenue.CreateEmpltyEle();
		ThisYearTotalRevenue.CreateEmpltyEle();
	}
})

/**
 * 直近の取引
 */
const RecentlyTrade = (() => {

	let recentlyTradeEle = null;

	const CATEGORY_LABELS = {
		food: "食費",
		dailyItem: "日用品",
		travel: "交通費",
		fashion: "衣服",
		hobby: "趣味・娯楽",
		salary: "給料",
		bonus: "ボーナス",
		other: "その他"
	};

	/**
	 * 初期化
	 */
	function Init(){
		recentlyTradeEle = document.getElementById('recently-trade');
	}

	/**
	 * 直近の取引の取得
	 */
	async function GetRecentlyTrade(){
		
		// 一週間前の日にちを取得
		const now = new Date();
		const weekAgo = new Date();
		weekAgo.setDate(now.getDate() - 7);
		const weekAgoTimestamp = Timestamp.fromDate(weekAgo);

		// 取得用クエリ
		const getRecentlyTradeQuery = query(
			collection(db, "Kakeibo"),			// 家計簿データ
			where("date", ">=", weekAgoTimestamp),	// 直近一週間前
			orderBy("date", "desc"),			// 新しい順
			limit(5)							// 5件
		);

		// クエリを実行
		const snapshot = await getDocs(getRecentlyTradeQuery);

		// 空だった場合
		if(snapshot.empty){
			CreateEmpltyEle();
			return;
		}

		createTable(snapshot);
	}

	/**
	 * 空データの要素を作成
	 */
	function CreateEmpltyEle(){
		recentlyTradeEle.innerHTML = null;
		const div = document.createElement("div");
		recentlyTradeEle.appendChild(div);
		div.classList.add("alert", "alert-primary", "d-flex", "align-items-center");
		div.textContent = '直近の取引履歴なし';
	}

	/**
	 * テーブル要素を作成
	 * @param {取得したデータ} snapshot 
	 */
	function createTable(snapshot){

		// 要素内をクリア
		recentlyTradeEle.innerHTML = null;

		// テーブル要素を作成
		const table = document.createElement("table");
		table.classList.add("table", "table-info", "table-striped", "text-start");

		// thead
		table.innerHTML = `
			<thead class="table-dark">
			<tr>
				<th>日付</th>
				<th>区分</th>
				<th>カテゴリー</th>
				<th>金額</th>
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

			// カテゴリー
			const category = CATEGORY_LABELS[record.category] ?? record.category;

			// 行作成
			const tr = document.createElement("tr");

			if (record.income === true) {
				tr.classList.add("table-success");
				tr.innerHTML = `
					<td>${record.date.toDate().toLocaleDateString("ja-JP")}</td>
					<td>収入</td>
					<td>${category}</td>
					<td>¥${record.money.toLocaleString()}</td>
				`;
			} 
			else {
				tr.classList.add("table-danger");
				tr.innerHTML = `
					<td>${record.date.toDate().toLocaleDateString("ja-JP")}</td>
					<td>支出</td>
					<td>${category}</td>
					<td>¥${record.money.toLocaleString()}</td>
				`;
			}

			tbody.appendChild(tr);
		});

		recentlyTradeEle.appendChild(table);
	}

	return{
		Init: Init,
		GetRecentlyTrade: GetRecentlyTrade,
		CreateEmpltyEle: CreateEmpltyEle
	};

})();

/**
 * 今月の総収支
 */
const ThisMonthTotalRevenue = (() => {

	let totalRevenueEle = null;

	/**
	 * 初期化
	 */
	function Init(){
		totalRevenueEle = document.getElementById('this-month-total-revenue');
	}

	/**
	 * 今月の総収支を取得
	 */
	async function GetTotalRevenue(){

		// 今月・来月の月を取得
		const now = new Date();
		const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

		// 取得用クエリ
		const getTotalRevenueQuery = query(
			collection(db, "Kakeibo"),
			where("date", ">=", Timestamp.fromDate(thisMonthStart)),
			where("date", "<", Timestamp.fromDate(nextMonthStart)),
			orderBy("date", "desc")
		);

		// クエリを実行
		const snapshot = await getDocs(getTotalRevenueQuery);

		// 空だった場合
		if(snapshot.empty){
			CreateEmpltyEle();
			return;
		}

		createEle(snapshot);
	}

	/**
	 * 空データの要素を作成
	 */
	function CreateEmpltyEle(){
		totalRevenueEle.innerHTML = null;
		const div = document.createElement("div");
		totalRevenueEle.appendChild(div);
		div.classList.add("display-6", "fw-bold", "text-primary");
		div.textContent = '¥0';
	}

	/**
	 * 合計金額を表示
	 * @param {取得したデータ} snapshot 
	 */
	function createEle(snapshot){

		let total = 0;

		snapshot.forEach((doc) => {

			const record = {
			id: doc.id,
			...doc.data()
			};

			if (record.income === true) {
				total += record.money;
			} 
			else {
				total -= record.money;
			}
		});

		// 要素を作成
		totalRevenueEle.innerHTML = null;
		const div = document.createElement("div");
		totalRevenueEle.appendChild(div);

		// 合計が赤字の場合
		if(total < 0){
			div.classList.add("display-6", "fw-bold", "text-danger");
			div.textContent = `¥${total.toLocaleString("ja-JP")}`;
		}
		// 合計が黒字の場合
		else{
			div.classList.add("display-6", "fw-bold", "text-primary");
			div.textContent = `¥${total.toLocaleString("ja-JP")}`;
		}
	}

	return{
		Init: Init,
		GetTotalRevenue: GetTotalRevenue,
		CreateEmpltyEle: CreateEmpltyEle
	};

})();

/**
 * 今年の総収支
 */
const ThisYearTotalRevenue = (() => {

	let totalRevenueEle = null;

	/**
	 * 初期化
	 */
	function Init(){
		totalRevenueEle = document.getElementById('this-year-total-revenue');
	}

	/**
	 * 今年の総収支を取得
	 */
	async function GetTotalRevenue(){

		// 今年・来年の月を取得
		const now = new Date();
		const thisYearStart = new Date(now.getFullYear(), 0, 1);
		const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);

		// 取得用クエリ
		const getTotalRevenueQuery = query(
			collection(db, "Kakeibo"),
			where("date", ">=", Timestamp.fromDate(thisYearStart)),
			where("date", "<", Timestamp.fromDate(nextYearStart)),
			orderBy("date", "desc")
		);

		// クエリを実行
		const snapshot = await getDocs(getTotalRevenueQuery);

		// 空だった場合
		if(snapshot.empty){
			CreateEmpltyEle();
			return;
		}

		createEle(snapshot);
	}

	/**
	 * 空データの要素を作成
	 */
	function CreateEmpltyEle(){
		totalRevenueEle.innerHTML = null;
		const div = document.createElement("div");
		totalRevenueEle.appendChild(div);
		div.classList.add("display-6", "fw-bold", "text-primary");
		div.textContent = '¥0';
	}

	/**
	 * 合計金額を表示
	 * @param {取得したデータ} snapshot 
	 */
	function createEle(snapshot){

		let total = 0;

		snapshot.forEach((doc) => {

			const record = {
			id: doc.id,
			...doc.data()
			};

			if (record.income === true) {
				total += record.money;
			} 
			else {
				total -= record.money;
			}
		});

		// 要素を作成
		totalRevenueEle.innerHTML = null;
		const div = document.createElement("div");
		totalRevenueEle.appendChild(div);

		// 合計が赤字の場合
		if(total < 0){
			div.classList.add("display-6", "fw-bold", "text-danger");
			div.textContent = `¥${total.toLocaleString("ja-JP")}`;
		}
		// 合計が黒字の場合
		else{
			div.classList.add("display-6", "fw-bold", "text-primary");
			div.textContent = `¥${total.toLocaleString("ja-JP")}`;
		}
	}

	return{
		Init: Init,
		GetTotalRevenue: GetTotalRevenue,
		CreateEmpltyEle: CreateEmpltyEle
	};
})();