import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Chart from "chart.js/auto";

function ScatterPlotWithProductivity({
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

    console.log(data);
    useEffect(() => {
        console.log(selectedState?.value);
    }, [selectedState]);

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
                if (!acc[val.district]) {
                    acc[val.district] = { production: 0, area: 0 };
                }
                acc[val.district].production += val.production;
                acc[val.district].area += val.area;
                return acc;
            }, {});

            newProductionData = Object.keys(productionByDistrict).map(
                (district) => {
                    const { production, area } = productionByDistrict[district];
                    return {
                        district: district,
                        production: production,
                        area: area,
                        productivity: area > 0 ? production / area : 0, // Avoid division by zero
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
        if (productionData.length > 0) {
            console.log(Object.keys(productionData[0])[0]);
        } else {
            console.log("productionData is empty");
        }
    }, [productionData]);

    useEffect(() => {
        // Check if productionData is not empty
        if (productionData.length > 0) {
            // 1. Find the maximum productivity value in the current set
            const maxProductivity = Math.max(
                ...productionData.map((item) => item.productivity)
            );

            // 2. Map productionData to format required by Chart.js bubble chart
            //    Normalize bubble sizes relative to the maximum productivity value
            const transformedData = productionData.map((item) => ({
                x: item.production,
                y: item.area,
                // Adjust the multiplier as needed to scale bubble sizes appropriately
                r:
                    Object.keys(productionData[0])[0] === "state"
                        ? Math.sqrt(item.productivity / maxProductivity) * 100
                        : Math.sqrt(item.productivity / maxProductivity) * 50,
            }));

            // 3. Update chartData state for Chart.js
            setChartData({
                datasets: [
                    {
                        label: "Production vs. Area",
                        data: transformedData,
                        backgroundColor: "rgba(0, 123, 255, 0.5)",
                        borderColor: "rgba(0, 123, 255, 1)",
                    },
                ],
            });
        }
    }, [productionData]);

    useEffect(() => {
        if (chartContainer.current && chartData.datasets.length > 0) {
            // Destroy the old chart instance if it exists
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Create a new chart instance
            chartInstance.current = new Chart(chartContainer.current, {
                type: "bubble",
                data: chartData,
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: "linear",
                            position: "bottom",
                            title: {
                                display: true,
                                text: "Production",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Area",
                            },
                        },
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: "Production vs. Area with Productivity Indicated by Bubble Size",
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `Production: ${
                                        context.raw.x
                                    }, Area: ${
                                        context.raw.y
                                    }, Productivity: ${Math.pow(
                                        context.raw.r * 10,
                                        2
                                    ).toFixed(2)}`;
                                },
                            },
                        },
                    },
                },
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);
    return (
        <div>
            <canvas ref={chartContainer} />
        </div>
    );
}

export default ScatterPlotWithProductivity;
