import { auth, provider } from "./firebase.js";
import { signInWithPopup, signOut } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ダッシュボード画面ロード時イベント
document.addEventListener("DOMContentLoaded", () => {
    //RecentlyTrade.Init();
    ThisMonthTotalRevenue.Init();
    Graph.Init();
    LogionOut.Init();
});
	

const LogionOut = (() => {

  let $loginBtn = null;
  let $logoutBtn = null;

  function Init() {

    // ボタン要素取得
    $loginBtn = document.getElementById("loginBtn");
    $logoutBtn = document.getElementById("logoutBtn");

    // イベントを設定
    $loginBtn.addEventListener("click", clickLoginBtn);
    $logoutBtn.addEventListener("click", clickLogoutBtn);

    // ログアウトボタンを非活性
    $logoutBtn.disabled = true;

  }

  async function clickLoginBtn(){

    try{
      // Googleアカウントでログイン
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      alert("ログインに成功しました。");

      // ログインボタンを非活性
      $loginBtn.disabled = true;

      // ログアウトボタンを活性
      $logoutBtn.disabled = false;

      RecentlyTrade.Init();
    }
    catch(error){
      alert("ログインに失敗しました。");
    }
  }

  function  clickLogoutBtn(){
    // ログアウト
    signOut(auth);

    alert("ログアウトしました。");

    // ログインボタンを活性
    $loginBtn.disabled = false;

    // ログアウトボタンを非活性
    $logoutBtn.disabled = true;
  }

  return {
    Init: Init
  };

})();

const RecentlyTrade = (() =>{

  // 初期設定
  async function Init(){

    // 直近の取引データを取得
    const data = await loadData();
    console.log(data);

    // 表示

  }

  return {
    Init: Init
  };

})();

const ThisMonthTotalRevenue = (() => {

  let $totalRevenueEle = null;

  function Init() {
    // 今月の収入を取得

    // 表示

    // 今月の支出を取得

    // 表示

    // 収支計算

    // 表示
  }

  return {
    Init: Init
  };

})();

const Graph = (() => {


  function Init() {
    // グラフを作成

    // 表示

  }

  return {
    Init: Init
  };

})();


// ===== Firestore データ取得 =====
export async function loadData() {
  const querySnapshot = await getDocs(collection(db, "Kakeibo"));
  let list = [];
  querySnapshot.forEach((doc) => {
    list.push({ id: doc.id, ...doc.data() });
  });

  console.log("取得データ", list);
  return list;
}