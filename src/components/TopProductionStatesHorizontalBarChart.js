import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

function TopProductionStatesHorizontalBarChart({ data }) {
    const chartContainer = useRef(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        // Sort data by production in descending order and take the top 5
        const sortedData = [...data]
            .sort((a, b) => b.production - a.production)
            .slice(0, 5);

        // Prepare chart data
        const chartData = {
            labels: sortedData.map((item) => item.state), // State names as labels
            datasets: [
                {
                    label: "Top 5 States by Production",
                    data: sortedData.map((item) => item.production), // Production values
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        };

        setChartData(chartData);
    }, [data]);

    useEffect(() => {
        if (chartContainer.current && chartData.datasets.length > 0) {
            const chart = new Chart(chartContainer.current, {
                type: "bar",
                data: chartData,
                options: {
                    indexAxis: "y",
                    elements: {
                        bar: {
                            borderWidth: 2,
                        },
                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "right",
                        },
                        title: {
                            display: true,
                            text: "Top 5 States by Production",
                        },
                    },
                },
            });

            return () => chart.destroy();
        }
    }, [chartData]);

    return (
        <div>
            <canvas ref={chartContainer} />
        </div>
    );
}

export default TopProductionStatesHorizontalBarChart;
