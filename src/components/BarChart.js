import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function BarChart({
    data,
    selectedState,
    selectedDistrict,
    selectedCropName,
    selectedSeason,
    selectedTopLeast,
    selectedType,
}) {
    const d3Container = useRef(null);
    const [productionData, setProductionData] = useState([]);

    useEffect(() => {
        let newProductionData = [];
        if (
            selectedState.value === "All States" &&
            selectedDistrict.value === "All Districts"
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
            selectedState.value !== "All States" &&
            selectedDistrict.value === "All Districts"
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
            selectedState.value !== "All States" &&
            selectedDistrict.value !== "All Districts" &&
            selectedCropName.value === "All Crops" &&
            selectedSeason.value === "All Seasons"
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
        if (productionData && d3Container.current) {
            const width = 928;
            const height = 500;
            const marginTop = 20;
            const marginRight = 0;
            const marginBottom = 30;
            const marginLeft = 40;

            // Determine the key for the x-axis dynamically
            const dataKey = productionData[0]?.hasOwnProperty("state")
                ? "state"
                : productionData[0]?.hasOwnProperty("district")
                ? "district"
                : productionData[0]?.hasOwnProperty("crop_name")
                ? "crop_name"
                : null;

            if (!dataKey) return; // If no suitable key found, exit

            // Clear SVG before appending new elements to avoid duplicates
            d3.select(d3Container.current).selectAll("*").remove();

            const svg = d3.select(d3Container.current);

            const x = d3
                .scaleBand()
                .domain(productionData.map((d) => d[dataKey]))
                .range([marginLeft, width - marginRight])
                .padding(0.1);

            const xAxis = d3.axisBottom(x).tickSizeOuter(0);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(productionData, (d) => d.value)])
                .nice()
                .range([height - marginBottom, marginTop]);

            svg.append("g")
                .attr("class", "bars")
                .attr("fill", "steelblue")
                .selectAll("rect")
                .data(productionData)
                .join("rect")
                .attr("x", (d) => x(d[dataKey]))
                .attr("y", (d) => y(d.value))
                .attr("height", (d) => y(0) - y(d.value))
                .attr("width", x.bandwidth());

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call(xAxis);

            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y))
                .call((g) => g.select(".domain").remove());

            // Fix the zoom function to avoid naming conflicts
            function applyZoom(svg) {
                const extent = [
                    [marginLeft, marginTop],
                    [width - marginRight, height - marginBottom],
                ];

                svg.call(
                    d3
                        .zoom()
                        .scaleExtent([1, 8])
                        .translateExtent(extent)
                        .extent(extent)
                        .on("zoom", zoomed)
                );

                function zoomed(event) {
                    x.range(
                        [marginLeft, width - marginRight].map((d) =>
                            event.transform.applyX(d)
                        )
                    );
                    svg.selectAll(".bars rect")
                        .attr("x", (d) => x(d[dataKey]))
                        .attr("width", x.bandwidth());
                    svg.selectAll(".x-axis").call(xAxis);
                }
            }

            // Apply the zoom behavior to the SVG
            applyZoom(svg);
        }
    }, [productionData]);

    return (
        <svg
            className="d3-component"
            ref={d3Container}
            style={{ width: "100%", height: "auto", maxHeight: "500px" }}
            viewBox={`0 0 ${928} ${500}`}
        />
    );
}

export default BarChart;
