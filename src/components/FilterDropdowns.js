import React from "react";
import Select from "react-select";

function FilterDropdowns({
    data,
    selectedState,
    setSelectedState,
    selectedDistrict,
    setSelectedDistrict,
    selectedCropName,
    setSelectedCropName,
    selectedSeason,
    setSelectedSeason,
    selectedTopLeast,
    setSelectedTopLeast,
    selectedType,
    setSelectedType,
    stateOptions,
    districtOptions,
    cropNameOptions,
    seasonOptions,
}) {
    const topLeastOptions = [
        { value: "Top 5", label: "Top 5" },
        { value: "Least 5", label: "Least 5" },
        { value: "Top 10", label: "Top 10" },
        { value: "Least 10", label: "Least 10" },
    ];

    const typeOptions = [
        { value: "Production", label: "Production" },
        { value: "Area", label: "Area" },
        { value: "Productivity", label: "Productivity" },
    ];
    // useEffect(() => {
    //     if (data) {
    //         // Create unique options for dropdowns
    //         const createOptions = (data, key) => {
    //             const uniqueValues = Array.from(
    //                 new Set(data.map((item) => item[key]))
    //             ).sort();
    //             return uniqueValues.map((value) => ({ value, label: value }));
    //         };

    //         // Set options for the Select components
    //         setStateOptions(createOptions(data, "state"));
    //         setDistrictOptions(createOptions(data, "district"));
    //         setCropNameOptions(createOptions(data, "crop_name"));
    //         setSeasonOptions(createOptions(data, "season"));
    //     }
    // }, [data]);

    // Handlers for when new items are selected
    const handleStateChange = (selectedOption) => {
        setSelectedState(selectedOption);
    };

    const handleDistrictChange = (selectedOption) => {
        setSelectedDistrict(selectedOption);
    };

    const handleCropNameChange = (selectedOption) => {
        setSelectedCropName(selectedOption);
    };

    const handleSeasonChange = (selectedOption) => {
        setSelectedSeason(selectedOption);
    };

    const handleTopLeastChange = (selectedOption) => {
        setSelectedTopLeast(selectedOption);
    };

    const handleTypeChange = (selectedOption) => {
        setSelectedType(selectedOption);
    };

    return (
        <div>
            <Select
                options={stateOptions}
                value={selectedState}
                onChange={handleStateChange}
                placeholder="Select State"
                isClearable
            />
            <Select
                options={districtOptions}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                placeholder="Select District"
                isClearable
            />
            <Select
                options={cropNameOptions}
                value={selectedCropName}
                onChange={handleCropNameChange}
                placeholder="Select Crop Name"
                isClearable
            />
            <Select
                options={seasonOptions}
                value={selectedSeason}
                onChange={handleSeasonChange}
                placeholder="Select Season"
                isClearable
            />
            <Select
                options={topLeastOptions}
                value={selectedTopLeast}
                onChange={handleTopLeastChange}
                placeholder="Select Top/Least"
                isClearable
            />
            <Select
                options={typeOptions}
                value={selectedType}
                onChange={handleTypeChange}
                placeholder="Select Type"
                isClearable
            />
        </div>
    );
}

export default FilterDropdowns;
