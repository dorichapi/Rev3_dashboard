// ✅ Google Apps ScriptのURLをここに貼り付け
const apiUrl = "https://script.google.com/macros/s/AKfycbzFNOekouxWlJ3g_q6Fg3ZXTX8udctKQSBKAwkupswvDaT5GJAF2dc2t1mDMdT2jA9q/exec";

// ✅ データ取得 & グラフ表示
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        console.log(result);  // ✅ デバッグ用: APIレスポンスを確認

        const latestData = result.data && result.data.length > 0 ? result.data[result.data.length - 1] : {};

        // ✅ 日付と更新時刻の表示
        const dateElement = document.getElementById("latest-date");

        const formattedDate = latestData["日付"] ? formatDate(latestData["日付"]) : "日付不明";
        const formattedTime = result.lastEditTime ? formatTime(result.lastEditTime) : "--:--";

        dateElement.innerHTML = `${formattedDate} <span class="update-time">更新時刻：${formattedTime}</span>`;
        dateElement.style.fontSize = "32px";

        // ✅ データの表示（デフォルト値を設定）
        document.querySelector(".dashboard .card:nth-child(1) strong").innerText = `${isValid(latestData["病床利用率 (%)"]) ? (latestData["病床利用率 (%)"] * 100).toFixed(1) : 0}%`;
        document.querySelector(".dashboard .card:nth-child(2) strong").innerText = `${isValid(latestData["救急車搬入数"]) ? latestData["救急車搬入数"] : 0}台`;
        document.querySelector(".dashboard .card:nth-child(3) strong").innerText = `${isValid(latestData["入院患者数"]) ? latestData["入院患者数"] : 0}人`;
        document.querySelector(".dashboard .card:nth-child(4) strong").innerText = `${isValid(latestData["退院予定数"]) ? latestData["退院予定数"] : 0}人`;
        document.querySelector(".dashboard .card:nth-child(5) strong").innerText = `${isValid(latestData["一般病棟在院数"]) ? latestData["一般病棟在院数"] : 0}/218 床`;
        document.querySelector(".dashboard .card:nth-child(6) strong").innerText = `${isValid(latestData["集中治療室在院数"]) ? latestData["集中治療室在院数"] : 0}/16 床`;

        // ✅ グラフ描画
        const labels = result.data ? result.data.map(item => formatDateForChart(item["日付"]) || "") : [];
        createChart("bedChart", "病床利用率 (%)", labels, result.data ? result.data.map(item => item["病床利用率 (%)"] * 100 || 0) : [], "blue", "％", 110);
        createChart("ambulanceChart", "救急車搬入数", labels, result.data ? result.data.map(item => item["救急車搬入数"] || 0) : [], "red", "台");
        createChart("inpatientsChart", "入院患者数", labels, result.data ? result.data.map(item => item["入院患者数"] || 0) : [], "green", "人");
        createChart("dischargesChart", "退院予定数", labels, result.data ? result.data.map(item => item["退院予定数"] || 0) : [], "orange", "人");
        createChart("generalWardChart", "一般病棟在院数", labels, result.data ? result.data.map(item => item["一般病棟在院数"] || 0) : [], "purple", "床");
        createChart("icuChart", "集中治療室在院数", labels, result.data ? result.data.map(item => item["集中治療室在院数"] || 0) : [], "teal", "床");

    } catch (error) {
        console.error("❌ データ取得エラー:", error);
    }
}

// ✅ データの有効性を確認する関数
function isValid(value) {
    return value !== undefined && value !== null && !isNaN(value);
}

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
    if (!dateString) return "日付不明";

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
    if (!dateString) return "--:--";

    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ✅ グラフ用の日付フォーマット
function formatDateForChart(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// ✅ 初期化
fetchData();
