// DOM要素を取得
const nameInput = document.getElementById("nameInput"); // 名前の入力フィールドを取得
const dateInput = document.getElementById("dateInput"); // 日付の入力フィールドを取得
const addButton = document.getElementById("addButton"); // 「追加」ボタンを取得
const nameList = document.getElementById("nameList"); // 名前リストの表示領域を取得
const startButton = document.getElementById("startButton"); // 「スタート」ボタンを取得
const resetButton = document.getElementById("resetButton"); // リセットボタンを取得
const result = document.getElementById("result"); // 結果表示領域を取得

// 初期状態の名前と日付、選択状態のオブジェクトを管理
const initialNames = [
  { name: "宮岡さん", date: "-", excluded: false },
  { name: "尾澤さん", date: "2024-10-31", excluded: false },
  { name: "高野さん", date: "2024-12-31", excluded: false },
  { name: "荻野", date: "2024-12-31", excluded: false },
];

// 動的に追加された名前を保持する配列
let addedNames = [];

// DOMの読み込みが完了したらイベントリスナーを設定
document.addEventListener("DOMContentLoaded", () => {
  addButton.addEventListener("click", addName); // 「追加」ボタンがクリックされたらaddName関数を実行
  nameInput.addEventListener("keypress", (e) => {
    // 名前入力フィールドでキーが押されたら
    if (e.key === "Enter") addName(); // EnterキーならaddName関数を実行
  });
  startButton.addEventListener("click", startRoulette); // 「スタート」ボタンがクリックされたらstartRoulette関数を実行
  resetButton.addEventListener("click", resetNames); // リセットボタンにリセット関数を紐付け
  updateNameList(); // 名前リストを初期化・更新
});

// 名前をリストに追加する関数
function addName() {
  const name = nameInput.value.trim(); // 入力された名前を取得し、前後の空白を除去
  const date = dateInput.value; // 入力された日付を取得
  if (name && date && !addedNames.some((entry) => entry.name === name)) {
    // 名前と日付が入力されており、同じ名前が未追加の場合
    addedNames.push({ name: name, date: date, excluded: false }); // 新しい名前を配列に追加
    updateNameList(); // 名前リストを更新
    nameInput.value = ""; // 名前入力フィールドをクリア
    dateInput.value = ""; // 日付入力フィールドをクリア
  }
}

// 日付が有効かをチェックする関数
function isValidDate(dateString) {
  const date = new Date(dateString); // 日付文字列をDateオブジェクトに変換
  return !isNaN(date.getTime()); // 有効な日付かどうかを判定
}

// 名前リストを更新して表示する関数
function updateNameList() {
  nameList.innerHTML = ""; // 名前リストの表示領域をクリア

  const today = new Date(); // 現在の日付を取得

  // 初期の名前リストと追加された名前リストを結合し、各エントリーに対して処理
  initialNames.concat(addedNames).forEach((entry) => {
    const li = document.createElement("li"); // リスト項目を作成
    let remainingDays;

    if (isValidDate(entry.date)) {
      // 日付が有効な場合
      const targetDate = new Date(entry.date); // 目標日付を取得
      const diffTime = targetDate - today; // 目標日付と現在日付の差を計算
      remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 残り日数を計算
      if (remainingDays < 0) {
        return; // 残り日数がマイナスなら表示しない
      }
    } else {
      remainingDays = "-"; // 日付が不正なら残り日数を"-"と表示
    }

    const nameSpan = document.createElement("span"); // 名前表示用の要素を作成
    nameSpan.classList.add("name"); // クラス名を追加
    nameSpan.textContent = entry.name; // 名前を設定
    const dateSpan = document.createElement("span"); // 日付表示用の要素を作成
    dateSpan.classList.add("date"); // クラス名を追加
    dateSpan.textContent =
      remainingDays === "-" ? "-" : `残り${remainingDays}日`; // 残り日数を設定
    const checkbox = document.createElement("input"); // チェックボックスを作成
    checkbox.type = "checkbox"; // タイプをチェックボックスに設定
    checkbox.checked = entry.excluded; // 除外フラグをチェックボックスに反映
    checkbox.className = "exclude-checkbox"; // クラス名を設定
    checkbox.onchange = () => {
      entry.excluded = checkbox.checked; // チェック状態が変わったら除外フラグを更新
    };

    li.appendChild(nameSpan); // リスト項目に名前を追加
    li.appendChild(dateSpan); // リスト項目に日付を追加
    li.appendChild(checkbox); // リスト項目にチェックボックスを追加
    nameList.appendChild(li); // 名前リストにリスト項目を追加
  });

  startButton.disabled = initialNames.concat(addedNames).length < 2; // 名前が2つ未満なら「スタート」ボタンを無効化
}

// 追加した名前をリセットする関数
function resetNames() {
  addedNames = []; // 動的に追加された名前をクリア
  updateNameList(); // 名前リストを更新
  result.textContent = ""; // 結果表示もリセット
}

// ルーレットの開始関数
function startRoulette() {
  const eligibleNames = initialNames
    .concat(addedNames)
    .filter((entry) => !entry.excluded); // 除外されていない名前のリストを作成
  if (eligibleNames.length < 2) return; // 名前が2つ未満なら処理を中断

  startButton.disabled = true; // 「スタート」ボタンを無効化
  let duration = Math.floor(Math.random() * 2000) + 1000; // ランダムな持続時間を設定（1000～3000ms）
  let startTime = Date.now(); // ルーレット開始時刻を記録
  let currentIndex = 0; // 現在のインデックスを初期化

  function spin() {
    result.textContent = eligibleNames[currentIndex].name; // 結果表示領域に現在の名前を表示
    currentIndex = (currentIndex + 1) % eligibleNames.length; // インデックスを更新

    if (Date.now() - startTime < duration) {
      // 持続時間内であれば再度spin関数を呼び出す
      setTimeout(spin, 100); // 100ms後にspin関数を再実行
    } else {
      startButton.disabled = false; // 「スタート」ボタンを再度有効化
      result.textContent = `明日の当番: ${result.textContent}`; // 最終結果を表示
    }
  }

  spin(); // ルーレットを開始
}
