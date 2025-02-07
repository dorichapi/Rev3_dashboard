// ✅ Google Apps ScriptのURLをここに貼り付け
const apiUrl = "https://script.google.com/macros/s/AKfycby4XwDzmcDdVy0odJXbZpf3FApO_99SWYc0Wtg9fvisnz2tQYbGBGZzO6FR9piLAHgk/exec";

// ✅ データ取得 & グラフ描画
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        const latestData = result.data[result.data.length - 1];

        // ✅ 最新7日間のデータだけ取得
        const last7DaysData = result.data.slice(-7);
        const labels = last7DaysData.map(item => formatDateForChart(item["日付"]));

        // ✅ グラフ表示
        createChart("bedChart", "病床利用率 (%)", labels, last7DaysData.map(item => item["病床利用率 (%)"] * 100), "blue", "％", 110);
        createChart("ambulanceChart", "救急車搬入数", labels, last7DaysData.map(item => item["救急車搬入数"]), "red", "台");
        createChart("inpatientsChart", "入院患者数", labels, last7DaysData.map(item => item["入院患者数"]), "green", "人");
        createChart("dischargesChart", "退院予定数", labels, last7DaysData.map(item => item["退院予定数"]), "orange", "人");
        createChart("generalWardChart", "一般病棟在院数", labels, last7DaysData.map(item => item["一般病棟在院数"]), "purple", "床");
        createChart("icuChart", "集中治療室在院数", labels, last7DaysData.map(item => item["集中治療室在院数"]), "teal", "床");

    } catch (error) {
        console.error("❌ データ取得エラー:", error);
    }
}

// ✅ グラフ描画関数（フォントサイズの調整を追加）
function createChart(canvasId, label, labels, data, color, unit, maxY = null) {
    new Chart(document.getElementById(canvasId), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.3,
                pointRadius: 4,                // ✅ データポイントのサイズを拡大
                pointHoverRadius: 6            // ✅ ホバー時に大きく
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 14             // ✅ 横軸の目盛りフォントサイズ
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    max: maxY,
                    title: {
                        display: true,
                        text: unit,
                        font: {
                            size: 16             // ✅ Y軸ラベルのフォントサイズ
                        }
                    },
                    ticks: {
                        font: {
                            size: 14             // ✅ 縦軸の目盛りフォントサイズ
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 16             // ✅ 凡例（ラベル）のフォントサイズ
                        }
                    }
                }
            }
        }
    });
}

// ✅ グラフ用の日付フォーマット（例: 2/7）
function formatDateForChart(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// ✅ 初期化
fetchData();
