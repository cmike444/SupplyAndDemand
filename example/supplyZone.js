
async function fetchAndRenderChart() {
    try {
        fetch('../data/supplyZone.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Prepare data for Chart.js
                const chartData = data.map(candle => ({
                    x: new Date(candle.timestamp * 1000),
                    o: candle.Open,
                    h: candle.High,
                    l: candle.Low,
                    c: candle.Close,
                }));

                console.log(chartData);

                // Render the chart
                const ctx = document.getElementById('supplyZoneChart').getContext('2d');
                ctx.canvas.width = 900;
                ctx.canvas.height = 300;

                new Chart(ctx, {
                    type: 'candlestick',
                    data: {
                        datasets: [{
                            label: 'Supply Zone Data',
                            data: chartData,
                            borderColor: 'rgba(255, 99, 132, 0.8)',
                        }]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: 'Supply Zone Candlestick Chart'
                            }
                        },
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'days'
                                }
                            }
                        }
                    }
                });
            })
    } catch (error) {
        console.error('Error loading supply zone data:', error);
    }
}

fetchAndRenderChart();
