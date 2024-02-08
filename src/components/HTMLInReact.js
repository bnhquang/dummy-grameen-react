import React from "react";

const HTMLContent = () => {
    // Put html file in public folder
    const htmlFilePath = "/myplot.html";

    return (
        <iframe
            title="My Plot"
            src={htmlFilePath}
            width="100%"
            height="600"
            style={{ border: "none" }}
        ></iframe>
    );
};

export default HTMLContent;
