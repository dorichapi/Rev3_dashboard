// ✅ Google Apps ScriptのURLをここに貼り付け
const apiUrl = "https://script.google.com/macros/s/AKfycby4XwDzmcDdVy0odJXbZpf3FApO_99SWYc0Wtg9fvisnz2tQYbGBGZzO6FR9piLAHgk/exec";

// ✅ データ取得 & グラフ表示
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        const latestData = result.data[result.data.length - 1];

        // ✅ 日付と更新時刻の表示
        document.getElementById("latest-date").innerHTML = `${formatDate(latestData["日付"])} 
            <span class="update-time">更新時刻：${formatTime(result.lastEditTime)}</span>`;

        // ✅ データの表示
        document.querySelector(".dashboard .card:nth-child(1) strong").innerText = `${(latestData["病床利用率 (%)"] * 100).toFixed(1)}%`;
        document.querySelector(".dashboard .card:nth-child(2) strong").innerText = `${latestData["救急車搬入数"]}台`;
        document.querySelector(".dashboard .card:nth-child(3) strong").innerText = `${latestData["入院患者数"]}人`;
        document.querySelector(".dashboard .card:nth-child(4) strong").innerText = `${latestData["退院予定数"]}人`;
        document.querySelector(".dashboard .card:nth-child(5) strong").innerText = `${latestData["一般病棟在院数"]}/218 床`;
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

// ✅ グラフ作成関数
function createChart(canvasId, label, labels, data, color, unit, maxY = null) {
    const recentLabels = labels.slice(-7);  // ✅ 直近1週間分のデータ表示
    const recentData = data.slice(-7);

    const canvas = document.getElementById(canvasId);
    canvas.style.height = "350px";         // ✅ 高さを350pxに固定
    canvas.style.width = "100%";           // ✅ 横幅は親要素にフィット
    canvas.style.backgroundColor = "#ffffff";
    canvas.style.margin = "10px auto";     // ✅ 上下余白と中央揃え
    canvas.style.padding = "10px";         // ✅ 内側余白
    canvas.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)"; // ✅ 軽いシャドウ
    canvas.style.borderRadius = "8px";     // ✅ 角丸デザイン

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
            maintainAspectRatio: false,     // ✅ サイズ調整を柔軟に
            layout: {
                padding: 10                // ✅ 内部余白を最小限に
            },
            plugins: {
                legend: {
                    display: false          // ✅ 凡例を完全に非表示
                },
                title: {
                    display: true,
                    text: label,            // ✅ タイトルを表示してラベルとして使用
                    font: {
                        size: 36,           // ✅ タイトルのフォントサイズを大きく
                        weight: 'bold'     // ✅ 太文字
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
                            size: 36,       // ✅ Y軸のラベルフォントサイズを大きく
                            weight: 'bold'  // ✅ 太文字
                        }
                    },
                    ticks: {
                        font: {
                            size: 36,       // ✅ Y軸の目盛りフォントサイズを大きく
                            weight: 'bold'  // ✅ 太文字
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 36,       // ✅ X軸の目盛りフォントサイズを大きく
                            weight: 'bold'  // ✅ 太文字
                        }
                    }
                }
            }
        }
    });
}

// ✅ 日付フォーマット関数（例: 2025年2月7日(金)）
function formatDate(dateString) {
    const date = new Date(dateString);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = weekdays[date.getDay()];
    return `${year}年${month}月${day}日(${dayOfWeek})`;
}

// ✅ 時刻フォーマット関数（例: 18:20）
function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ✅ グラフ用の日付フォーマット（例: 2/7）
function formatDateForChart(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// ✅ 初期化
fetchData();
