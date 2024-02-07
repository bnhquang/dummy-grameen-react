import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function CirclePackingChart({ cropData }) {
    const d3Container = useRef(null);

    // Function to aggregate the data
    const aggregateData = (data) => {
        const result = { name: "root", children: [] };

        data.forEach((item) => {
            let state = result.children.find(
                (child) => child.name === item.state
            );
            if (!state) {
                state = { name: item.state, children: [] };
                result.children.push(state);
            }

            let district = state.children.find(
                (child) => child.name === item.district
            );
            if (!district) {
                district = { name: item.district, children: [] };
                state.children.push(district);
            }

            district.children.push({
                name: item.crop_name,
                value: item.area, // Replace with the correct value if needed
            });
        });

        return result;
    };

    useEffect(() => {
        if (cropData && d3Container.current) {
            console.log("Circle if called");
            const structuredData = aggregateData(cropData);
            console.log(structuredData);

            const width = 928;
            const height = width;

            const color = d3
                .scaleLinear()
                .domain([0, 5])
                .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
                .interpolate(d3.interpolateHcl);

            const pack = (data) =>
                d3.pack().size([width, height]).padding(3)(
                    d3
                        .hierarchy(data)
                        .sum((d) => d.value)
                        .sort((a, b) => b.value - a.value)
                );

            const root = pack(structuredData);

            const svg = d3
                .select(d3Container.current)
                .attr(
                    "viewBox",
                    `-${width / 2} -${height / 2} ${width} ${height}`
                )
                .attr("width", width)
                .attr("height", height)
                .style("max-width", "100%")
                .style("height", "auto")
                .style("display", "block")
                .style("margin", "0 -14px")
                .style("background", color(0))
                .style("cursor", "pointer");

            const node = svg
                .append("g")
                .selectAll("circle")
                .data(root.descendants().slice(1))
                .join("circle")
                .attr("fill", (d) => (d.children ? color(d.depth) : "white"))
                .attr("pointer-events", (d) => (!d.children ? "none" : null))
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "#000");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", null);
                })
                .on(
                    "click",
                    (event, d) =>
                        focus !== d && (zoom(event, d), event.stopPropagation())
                );

            const label = svg
                .append("g")
                .style("font", "10px sans-serif")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .selectAll("text")
                .data(root.descendants())
                .join("text")
                .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
                .style("display", (d) =>
                    d.parent === root ? "inline" : "none"
                )
                .text((d) => d.data?.name);

            let focus = root;
            let view;

            function zoomTo(v) {
                const k = width / v[2];
                view = v;
                label.attr(
                    "transform",
                    (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
                );
                node.attr(
                    "transform",
                    (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
                );
                node.attr("r", (d) => d.r * k);
            }

            function zoom(event, d) {
                const focus0 = focus;
                focus = d;
                const transition = svg
                    .transition()
                    .duration(event.altKey ? 7500 : 750)
                    .tween("zoom", (d) => {
                        const i = d3.interpolateZoom(view, [
                            focus.x,
                            focus.y,
                            focus.r * 2,
                        ]);
                        return (t) => zoomTo(i(t));
                    });

                label
                    .filter(function (d) {
                        return (
                            d.parent === focus ||
                            this.style.display === "inline"
                        );
                    })
                    .transition(transition)
                    .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
                    .on("start", function (d) {
                        if (d.parent === focus) this.style.display = "inline";
                    })
                    .on("end", function (d) {
                        if (d.parent !== focus) this.style.display = "none";
                    });
            }

            svg.on("click", (event) => zoom(event, root));
            zoomTo([focus.x, focus.y, focus.r * 2]);
        }
    }, [cropData]);

    return (
        <svg
            className="d3-component"
            ref={d3Container}
            style={{ width: "100%", height: "auto", maxHeight: "500px" }}
        />
    );
}

export default CirclePackingChart;
