// ✅ Google Apps ScriptのURLをここに貼り付け
const apiUrl = "https://script.google.com/macros/s/AKfycbzPzYI7W7MPyhHBARLWYdmV_6q4a0v9UTufnO9sqSYhTWNDJAv1ushEVgo1KyZ2RO3E/exec";

// ✅ データ取得 & グラフ表示
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        const latestData = result.data[result.data.length - 1];

        // ✅ 日付とスプレッドシートの更新時刻を表示
        const dateElement = document.getElementById("latest-date");

        // ✅ 日付が存在しない場合のフォールバック処理
        const formattedDate = latestData["日付"] ? formatDate(latestData["日付"]) : "日付不明";
        const formattedTime = result.lastEditTime ? formatTime(result.lastEditTime) : "--:--";

        dateElement.innerHTML = `${formattedDate} <span class="update-time">更新時刻：${formattedTime}</span>`;
        dateElement.style.fontSize = "32px"; // ✅ フォントサイズを大きく

        // ✅ データの表示
        document.querySelectorAll(".dashboard .card").forEach(card => {
            card.style.fontSize = "28px";
        });

        document.querySelector(".dashboard .card:nth-child(1) strong").innerText = `${(latestData["病床利用率 (%)"] * 100).toFixed(1)}%`;
        document.querySelector(".dashboard .card:nth-child(2) strong").innerText = `${latestData["救急車搬入数"]}台`;
        document.querySelector(".dashboard .card:nth-child(3) strong").innerText = `${latestData["入院患者数"]}人`;
        document.querySelector(".dashboard .card:nth-child(4) strong").innerText = `${latestData["退院予定数"]}人`;
        document.querySelector(".dashboard .card:nth-child(5) strong").innerText = `${latestData["一般病棟在院数"]}/202 床`;
        document.querySelector(".dashboard .card:nth-child(6) strong").innerText = `${latestData["集中治療室在院数"]}/16 床`;

        // ✅ グラフ描画
        const labels = result.data.map(item => formatDateForChart(item["日付"]));
        createChart("bedChart", "病床利用率 (%)", labels, result.data.map(item => item["病床利用率 (%)"] * 100), "blue", "％", 110);
        createChart("ambulanceChart", "救急車搬入数", labels, result.data.map(item => item["救急車搬入数"]), "red", "台");
        createChart("inpatientsChart", "入院患者数", labels, result.data.map(item => item["入院患者数"]), "green", "人");
        createChart("dischargesChart", "退院予定数", labels, result.data.map(item => item["退院予定数"]), "orange", "人");
        createChart("generalWardChart", "一般病棟在院数", labels, result.data.map(item => item["一般病棟在院数"]), "purple", "床");
        createChart("icuChart", "集中治療室在院数", labels, result.data.map(item => item["集中治療室在院数"]), "teal", "床");

    } catch (error) {
        console.error("❌ データ取得エラー:", error);
    }
}

// ✅ 手術台帳を開くクリックイベント
document.getElementById('surgery-register-card').addEventListener('click', function() {
    window.open('https://docs.google.com/spreadsheets/d/1CHU8Cgxgg5IvL3nB6ackAdqxe7-CNkmWDvtYE-keuXI/edit', '_blank');
});

// ✅ 当直管理表を開くクリックイベント（新規追加）
document.getElementById('duty-management-card').addEventListener('click', function() {
    window.open('https://docs.google.com/spreadsheets/d/NEW_SPREADSHEET_ID/edit', '_blank'); // ← ここに「当直管理表」のスプレッドシートURLを入れる
});

// ✅ グラフ作成関数
function createChart(canvasId, label, labels, data, color, unit, maxY = null) {
    const recentLabels = labels.slice(-7);
    const recentData = data.slice(-7);

    const canvas = document.getElementById(canvasId);
    canvas.style.height = "350px";
    canvas.style.width = "100%";
    canvas.style.backgroundColor = "#ffffff";
    canvas.style.margin = "10px auto";
    canvas.style.padding = "10px";
    canvas.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    canvas.style.borderRadius = "8px";

    new Chart(canvas, {
        type: "line",
        data: {
            labels: recentLabels,
            datasets: [{
                data: recentData,
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 10
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: label,
                    font: {
                        size: 48,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: maxY,
                    title: {
                        display: true,
                        text: unit,
                        font: {
                            size: 36,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 36,
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 36,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

// ✅ 日付フォーマット関数
function formatDate(dateString) {
    if (!dateString) return "日付不明"; // ✅ データがない場合の対処

    const date = new Date(dateString);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = weekdays[date.getDay()];
    return `${year}年${month}月${day}日(${dayOfWeek})`;
}

// ✅ 時刻フォーマット関数
function formatTime(dateString) {
    if (!dateString) return "--:--"; // ✅ データがない場合の対処

    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ✅ グラフ用の日付フォーマット
function formatDateForChart(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// ✅ 初期化
fetchData();
