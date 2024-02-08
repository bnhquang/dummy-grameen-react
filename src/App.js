import React, { useState, useEffect } from "react";
import BarChart from "./components/BarChart";
import FilterDropdowns from "./components/FilterDropdowns";
import CirclePackingChart from "./components/CirclePackingChart";
import HTMLInReact from "./components/HTMLInReact";
import HorizontalBarChart from "./components/HorizontalBarChart";
import TopProductionStatesHorizontalBarChart from "./components/TopProductionStatesHorizontalBarChart";
import ScatterPlotWithProductivity from "./components/ScatterPlotWithProductivity";
import PolarAreaChart from "./components/PolarAreaChart";

function App() {
    const [cropData, setCropData] = useState(null);
    const [selectedState, setSelectedState] = useState({
        value: "All States",
        label: "All States",
    });
    const [selectedDistrict, setSelectedDistrict] = useState({
        value: "All Districts",
        label: "All Districts",
    });
    const [selectedCropName, setSelectedCropName] = useState({
        value: "All Crops",
        label: "All Crops",
    });
    const [selectedSeason, setSelectedSeason] = useState({
        value: "All Seasons",
        label: "All Seasons",
    });
    const [selectedTopLeast, setSelectedTopLeast] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [stateOptions, setStateOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [cropNameOptions, setCropNameOptions] = useState([]);
    const [seasonOptions, setSeasonOptions] = useState([]);
    const [data, setData] = useState([]);
    const [chartTitle, setChartTitle] = useState("Crop Production Data");
    const [analyticsData, setAnalyticsData] = useState([]);
    const [noAnalytics, setNoAnalytics] = useState(false);

    useEffect(() => {
        if (data) {
            // Create unique options for dropdowns
            const createOptions = (data, key) => {
                const uniqueValues = Array.from(
                    new Set(data.map((item) => item[key]))
                ).sort();
                return uniqueValues.map((value) => ({ value, label: value }));
            };

            // Set options for the Select components
            setStateOptions(createOptions(data, "state"));
            setDistrictOptions(createOptions(data, "district"));
            setCropNameOptions(createOptions(data, "crop_name"));
            setSeasonOptions(createOptions(data, "season"));
        }
    }, [data]);

    // Effect to update dependent dropdown options and chart title based on selections
    useEffect(() => {
        // Update the district options based on the selected state
        if (selectedState && selectedState.value !== "All States") {
            const filteredDistricts = data
                .filter((item) => item.state === selectedState.value)
                .map((item) => item.district);
            const uniqueDistricts = Array.from(new Set(filteredDistricts));
            setDistrictOptions([
                { value: "All Districts", label: "All Districts" },
                ...uniqueDistricts.map((district) => ({
                    value: district,
                    label: district,
                })),
            ]);
        } else {
            // Reset district options if 'All States' is selected
            setDistrictOptions([
                { value: "All Districts", label: "All Districts" },
            ]);
        }

        // Always update the crop name options, independent of state or district selection
        const filteredCrops =
            selectedDistrict && selectedDistrict.value !== "All Districts"
                ? data
                      .filter(
                          (item) => item.district === selectedDistrict.value
                      )
                      .map((item) => item.crop_name)
                : data.map((item) => item.crop_name);
        const uniqueCrops = Array.from(new Set(filteredCrops));
        setCropNameOptions([
            { value: "All Crops", label: "All Crops" },
            ...uniqueCrops.map((crop) => ({ value: crop, label: crop })),
        ]);

        // Always update the season options, independent of crop name selection
        const filteredSeasons =
            selectedCropName && selectedCropName.value !== "All Crops"
                ? data
                      .filter(
                          (item) => item.crop_name === selectedCropName.value
                      )
                      .map((item) => item.season)
                : data.map((item) => item.season);
        const uniqueSeasons = Array.from(new Set(filteredSeasons));
        setSeasonOptions([
            { value: "All Seasons", label: "All Seasons" },
            ...uniqueSeasons.map((season) => ({
                value: season,
                label: season,
            })),
        ]);

        // Conditional logic for no analytics available
        const analyticsAvailable = data && data.length > 0;
        setNoAnalytics(!analyticsAvailable);

        // Update chart title based on selections
        let title = "Crop Production Data";
        if (selectedState && selectedState.value !== "All States") {
            title = `Production Data for ${selectedState.label}`;
        }
        if (selectedDistrict && selectedDistrict.value !== "All Districts") {
            title = `Production Data for ${selectedDistrict.label}, ${selectedState.label}`;
        }
        if (selectedCropName && selectedCropName.value !== "All Crops") {
            title = `Production Data for ${selectedCropName.label}`;
        }
        if (selectedSeason && selectedSeason.value !== "All Seasons") {
            title = `Production Data for ${selectedSeason.label} Season`;
        }
        setChartTitle(title);

        // Set analytics data based on selections
        let filteredData = data;
        if (selectedState && selectedState.value !== "All States") {
            filteredData = filteredData.filter(
                (item) => item.state === selectedState.value
            );
        }
        if (selectedDistrict && selectedDistrict.value !== "All Districts") {
            filteredData = filteredData.filter(
                (item) => item.district === selectedDistrict.value
            );
        }
        if (selectedCropName && selectedCropName.value !== "All Crops") {
            filteredData = filteredData.filter(
                (item) => item.crop_name === selectedCropName.value
            );
        }
        if (selectedSeason && selectedSeason.value !== "All Seasons") {
            filteredData = filteredData.filter(
                (item) => item.season === selectedSeason.value
            );
        }
        setAnalyticsData(filteredData);
    }, [
        selectedState,
        selectedDistrict,
        selectedCropName,
        selectedSeason,
        data,
    ]);

    const fetchData = (query) => {
        fetch(query)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setData(data);
                console.log(data);
            })
            .catch((error) => console.error("Error fetching data: ", error));
    };

    useEffect(() => {
        let query = "http://127.0.0.1:5000/api/crops?";
        if (selectedState.value !== "All States") {
            query += `state_name=${encodeURIComponent(selectedState.value)}&`;
        }
        if (selectedDistrict.value !== "All Districts") {
            query += `district_name=${encodeURIComponent(
                selectedDistrict.value
            )}&`;
        }
        if (selectedCropName.value !== "All Crops") {
            query += `crop=${encodeURIComponent(selectedCropName.value)}&`;
        }
        if (selectedSeason.value !== "All Seasons") {
            query += `season=${encodeURIComponent(selectedSeason.value)}&`;
        }

        fetchData(query);
        // console.log(query);
    }, [selectedState, selectedDistrict, selectedCropName, selectedSeason]);

    return (
        <div className="App">
            <h1>{chartTitle}</h1>
            <FilterDropdowns
                data={cropData}
                selectedState={selectedState}
                setSelectedState={(selectedOption) => {
                    setSelectedState(
                        selectedOption || {
                            value: "All States",
                            label: "All States",
                        }
                    );
                }}
                stateOptions={stateOptions}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={(selectedOption) => {
                    setSelectedDistrict(
                        selectedOption || {
                            value: "All Districts",
                            label: "All Districts",
                        }
                    );
                }}
                districtOptions={districtOptions}
                selectedCropName={selectedCropName}
                setSelectedCropName={(selectedOption) => {
                    setSelectedCropName(
                        selectedOption || {
                            value: "All Crops",
                            label: "All Crops",
                        }
                    );
                }}
                cropNameOptions={cropNameOptions}
                selectedSeason={selectedSeason}
                setSelectedSeason={(selectedOption) => {
                    setSelectedSeason(
                        selectedOption || {
                            value: "All Seasons",
                            label: "All Seasons",
                        }
                    );
                }}
                seasonOptions={seasonOptions}
                selectedTopLeast={selectedTopLeast}
                setSelectedTopLeast={setSelectedTopLeast}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
            />
            {/* {noAnalytics ? (
                <p>No analytics available</p>
            ) : analyticsData ? (
                <BarChart
                    data={analyticsData}
                    selectedState={selectedState}
                    selectedDistrict={selectedDistrict}
                    selectedSeason={selectedSeason}
                    selectedCropName={selectedCropName}
                    selectedTopLeast={selectedTopLeast}
                    selectedType={selectedType}
                />
            ) : (
                <p>Loading data...</p>
            )} */}

            {/* {noAnalytics ? (
                <p>No analytics available</p>
            ) : analyticsData ? (
                <CirclePackingChart cropData={analyticsData} />
            ) : (
                <p>Loading data...</p>
            )} */}

            {/* <HTMLInReact /> */}

            {/* <HorizontalBarChart
                data={analyticsData}
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
                selectedSeason={selectedSeason}
                selectedCropName={selectedCropName}
                selectedTopLeast={selectedTopLeast}
                selectedType={selectedType}
            /> */}

            {/* <ScatterPlotWithProductivity
                data={analyticsData}
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
                selectedSeason={selectedSeason}
                selectedCropName={selectedCropName}
                selectedTopLeast={selectedTopLeast}
                selectedType={selectedType}
            /> */}

            {/* <TopProductionStatesHorizontalBarChart data={analyticsData} /> */}

            <PolarAreaChart
                data={analyticsData}
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
                selectedSeason={selectedSeason}
                selectedCropName={selectedCropName}
                selectedTopLeast={selectedTopLeast}
                selectedType={selectedType}
            />
        </div>
    );
}

export default App;
