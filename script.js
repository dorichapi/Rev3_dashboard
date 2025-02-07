// ✅ Google Apps ScriptのURLをここに貼り付け
const apiUrl = "https://script.google.com/macros/s/AKfycby4XwDzmcDdVy0odJXbZpf3FApO_99SWYc0Wtg9fvisnz2tQYbGBGZzO6FR9piLAHgk/exec";

// ✅ データ取得とグラフ描画
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        console.log("✅ データ取得成功:", result);  // デバッグ用

        const latestData = result.data[result.data.length - 1] || {};
        const last7DaysData = result.data.slice(-7);

        // ✅ 日付と更新時刻の表示
        document.getElementById("latest-date").innerText = `日付: ${formatDate(latestData["日付"]) || "--"}`;
        document.getElementById("update-time").innerText = `更新時刻: ${formatTime(result.lastEditTime) || "--"}`;

        // ✅ 各項目のデータ表示（null対策）
        document.getElementById("bed-usage").querySelector(".value").innerText = 
            latestData["病床利用率 (%)"] !== undefined ? `${(latestData["病床利用率 (%)"] * 100).toFixed(1)}%` : "--%";

        document.getElementById("ambulance").querySelector(".value").innerText = 
            latestData["救急車搬入数"] || "--台";

        document.getElementById("inpatients").querySelector(".value").innerText = 
            latestData["入院患者数"] || "--人";

        document.getElementById("discharges").querySelector(".value").innerText = 
            latestData["退院予定数"] || "--人";

        document.getElementById("general-ward").querySelector(".value").innerText = 
            `${latestData["一般病棟在院数"] || "--"}/218 床`;

        document.getElementById("icu").querySelector(".value").innerText = 
            `${latestData["集中治療室在院数"] || "--"}/16 床`;

        // ✅ グラフ描画
        const labels = last7DaysData.map(item => formatDateForChart(item["日付"]));

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

// ✅ グラフ描画関数（フォントとレイアウト修正）
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
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 14                      // ✅ 横軸のフォントサイズ
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
                            size: 16                      // ✅ Y軸タイトルのフォントサイズ
                        }
                    },
                    ticks: {
                        font: {
                            size: 14                      // ✅ 縦軸の目盛りフォントサイズ
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 16                      // ✅ 凡例（ラベル）のフォントサイズ
                        }
                    }
                }
            }
        }
    });
}

// ✅ 日付フォーマット（例: 2/7）
function formatDateForChart(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

fetchData();
