import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Chart from "chart.js/auto";

function HorizontalBarChart({
    data,
    selectedState,
    selectedDistrict,
    selectedCropName,
    selectedSeason,
    selectedTopLeast,
    selectedType,
}) {
    const chartContainer = useRef(null);
    const chartInstance = useRef(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [productionData, setProductionData] = useState([]);

    useEffect(() => {
        let newProductionData = [];
        if (
            selectedState?.value === "All States" &&
            selectedDistrict?.value === "All Districts"
        ) {
            console.log("First if");
            // Aggregate data by state
            const productionByState = data.reduce((acc, val) => {
                if (!acc[val.state]) {
                    acc[val.state] = { production: 0, area: 0 };
                }
                acc[val.state].production += val.production;
                acc[val.state].area += val.area;
                return acc;
            }, {});

            // Calculate productivity for each state and create the array for D3
            newProductionData = Object.keys(productionByState).map((state) => {
                const { production, area } = productionByState[state];
                return {
                    state: state,
                    production: production,
                    area: area,
                    productivity: area > 0 ? production / area : 0, // Avoid division by zero
                };
            });
        } else if (
            selectedState?.value !== "All States" &&
            selectedDistrict?.value === "All Districts"
        ) {
            console.log("Second if");
            // Aggregate data by district
            const productionByDistrict = data.reduce((acc, val) => {
                acc[val.district] = (acc[val.district] || 0) + val.production;
                return acc;
            }, {});
            const areaByDistrict = data.reduce((acc, val) => {
                acc[val.district] = (acc[val.district] || 0) + val.area;
                return acc;
            }, {});
            const productivityByDistrict =
                productionByDistrict / areaByDistrict;

            // Convert the aggregated object into an array suitable for D3
            newProductionData = Object.keys(productionByDistrict).map(
                (district) => {
                    return {
                        district: district,
                        production: productionByDistrict[district],
                        area: areaByDistrict[district],
                        productivity: productivityByDistrict[district],
                    };
                }
            );
        } else if (
            selectedState?.value !== "All States" &&
            selectedDistrict?.value !== "All Districts" &&
            selectedCropName?.value === "All Crops" &&
            selectedSeason?.value === "All Seasons"
        ) {
            console.log("Third if");
            // Aggregate data by crop name
            const productionByCropName = data.reduce((acc, val) => {
                acc[val.crop_name] = (acc[val.crop_name] || 0) + val.production;
                return acc;
            }, {});
            const areaByCropName = data.reduce((acc, val) => {
                acc[val.crop_name] = (acc[val.crop_name] || 0) + val.area;
                return acc;
            }, {});
            const productivityByCropName =
                productionByCropName / areaByCropName;

            // Convert the aggregated object into an array suitable for D3
            newProductionData = Object.keys(productionByCropName).map(
                (crop_name) => {
                    return {
                        crop_name: crop_name,
                        production: productionByCropName[crop_name],
                        area: areaByCropName[crop_name],
                        productivity: productivityByCropName[crop_name],
                    };
                }
            );
        }

        console.log(selectedType?.value.toLowerCase());

        // Adjust the data based on the selected type ('production', 'area', 'productivity')
        if (selectedType?.value.toLowerCase() === "productivity") {
            newProductionData = newProductionData.map((d) => ({
                ...d,
                value: d.production / d.area, // Calculate productivity
            }));
        } else if (selectedType?.value.toLowerCase() === "area") {
            newProductionData = newProductionData.map((d) => ({
                ...d,
                value: d.area, // Use area
            }));
        } else {
            console.log("this is the below third if");
            // Default to using production
            newProductionData = newProductionData.map((d) => ({
                ...d,
                value: d.production, // Use production
            }));
        }

        // Sort the data based on the selected type's value
        newProductionData.sort((a, b) => b.value - a.value);

        // Slice the data based on 'selectedTopLeast'
        if (selectedTopLeast?.value === "Top 5") {
            newProductionData = newProductionData.slice(0, 5);
        } else if (selectedTopLeast?.value === "Least 5") {
            newProductionData = newProductionData.slice(-5);
        } else if (selectedTopLeast?.value === "Top 10") {
            newProductionData = newProductionData.slice(0, 10);
        } else if (selectedTopLeast?.value === "Least 10") {
            newProductionData = newProductionData.slice(-10);
        }
        // 'All' option does not slice the data

        setProductionData(newProductionData);
    }, [
        selectedState,
        selectedDistrict,
        selectedCropName,
        selectedSeason,
        selectedTopLeast,
        selectedType,
        data,
    ]);

    console.log(productionData);

    useEffect(() => {
        // Check if productionData is not empty
        if (productionData.length > 0) {
            // Dynamically determine the label key from the first object's first key
            // (excluding 'production', 'area', and 'value' keys)
            const labelKey = Object.keys(productionData[0]).find(
                (key) => !["production", "area", "value"].includes(key)
            );

            // Prepare labels and dataset data array
            const labels = productionData.map((item) => item[labelKey]);
            const datasetData = productionData.map((item) => item.value);

            // Update chartData state for Chart.js
            setChartData({
                labels,
                datasets: [
                    {
                        label: "Production Data",
                        data: datasetData,
                        borderColor: "rgb(255, 99, 132)",
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                        borderWidth: 1,
                    },
                ],
            });
        }
    }, [productionData]);

    console.log(JSON.stringify(chartData, null, 2));

    useEffect(() => {
        if (chartContainer.current && chartData.datasets.length > 0) {
            // Destroy the old chart instance if it exists
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Create a new chart instance
            chartInstance.current = new Chart(chartContainer.current, {
                type: "bar", // Specify chart type
                data: chartData, // Use the state you prepared earlier
                options: {
                    indexAxis: "y", // This makes the bar chart horizontal
                    elements: {
                        bar: {
                            borderWidth: 2,
                        },
                    },
                    responsive: true, // Ensure the chart is responsive
                    plugins: {
                        legend: {
                            position: "right", // Position the legend
                        },
                        title: {
                            display: true,
                            text: "Production Data", // Chart title
                        },
                    },
                },
            });
        }

        // Cleanup function to destroy chart instance on component unmount
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]); // Re-run this effect when chartData changes

    return (
        <div>
            <canvas ref={chartContainer} />
        </div>
    );
}

export default HorizontalBarChart;
