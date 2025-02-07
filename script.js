// ✅ グラフ作成関数
function createChart(canvasId, label, data, color, unit) {
    new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels: ["2/1", "2/2", "2/3", "2/4", "2/5", "2/6", "2/7"],
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.3,  // 線を少し滑らかに
                pointRadius: 4, // ポイントサイズ
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: unit
                    }
                }
            }
        }
    });
}

// ✅ ダミーデータでグラフを描画
createChart("bedChart", "病床利用率 (%)", [80, 85, 90, 95, 93, 92, 94], "blue", "％");
createChart("ambulanceChart", "救急車搬入数", [5, 8, 12, 3, 4, 6, 2], "red", "台");
createChart("inpatientsChart", "入院患者数", [10, 15, 25, 20, 18, 22, 9], "green", "人");
createChart("dischargesChart", "退院予定数", [12, 5, 20, 4, 15, 17, 19], "orange", "人");
createChart("generalWardChart", "一般病棟在院数", [200, 202, 205, 210, 208, 207, 208], "purple", "床");
createChart("icuChart", "集中治療室在院数", [15, 14, 16, 17, 18, 19, 9], "teal", "床");
