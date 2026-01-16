const increaseVersion= (version, beta = false) => {
    /* Increments a version number string with support for beta version suffixes
    when beta is ture, update version from "1.0.2" to "1.0.3b1" or
        update version from "1.0.3b1" to "1.0.3b2";
    when beta is false, update version from "1.0.2" to "1.0.3" or
        update version from "1.0.3b2" to "1.0.3"

    Args:
        version (string), the original version string (e.g., "1.0.2", "1.0.3b1")
        beta (boolean), whether to handle as beta version, default to false

    Returns:
        string, the incremented version string

    Throws:
        Error, with detailed message if version format is invalid
    */
    try {
        // ========== Step 1: Validate input is a string ==========
        if (typeof version !== "string") {
            throw new Error(
                `Version must be a string (received ${typeof version})`
            );
        }

        // ========== Step 2: Strict regex for valid version format ==========
        // Regular expression to split version into main version and beta suffix
        // ^\d+(\.\d+)* : Matches numeric main version (e.g., 1, 1.0, 1.0.2)
        // (b\d+)?      : Optional beta suffix (e.g., b1, b2)
        // $            : End of string
        const versionRegex = /^(\d+(\.\d+)*)(b\d+)?$/;
        const match = version.match(versionRegex);

        // Throw error if version string doesn't match basic format
        if (!match) {
            throw new Error(
                "Invalid version format, expected numeric version like x.y.z or x.y.zbn and x, y, z, n is a number"
            );
        }

        // Extract parts (mainVersion = numeric part, betaSuffix = optional bN)
        // (e.g., "1.0.3" from "1.0.3b1") and beta suffix (e.g., "b1")
        const mainVersion = match[1];
        const betaSuffix = match[3];

        // Split main version into array of number strings
        //  (no need for extra numeric check now—regex enforces it)
        // (e.g., "1.0.2" → ["1", "0", "2"])
        const mainParts = mainVersion.split(".");

        // ========== Step 3: Version increment logic ==========
        if (beta) {
            if (betaSuffix) {
                // Scenario 1: Beta mode ON and version already has beta suffix (e.g., 1.0.3b1)
                // Extract numeric part from beta suffix, increment by 1 (e.g., b1 → b2)
                const betaNumber = Number(betaSuffix.replace("b", "")) + 1;
                // Keep main version unchanged, only update beta number
                return `${mainVersion}b${betaNumber}`;
            } else {
                // Scenario 2: Beta mode ON but no beta suffix (e.g., 1.0.2)
                // Increment last part of main version, then add beta suffix "b1" (e.g., 1.0.2 → 1.0.3b1)
                const lastMainPart =
                    Number(mainParts[mainParts.length - 1]) + 1;
                mainParts[mainParts.length - 1] = `${lastMainPart}`;
                const updatedMainVersion = mainParts.join(".");
                return `${updatedMainVersion}b1`;
            }
        } else {
            if (betaSuffix) {
                // Scenario 3: Beta mode OFF and version has beta suffix (e.g., 1.0.3b2)
                // Remove beta suffix, return only main version (e.g., 1.0.3b2 → 1.0.3)
                return mainVersion;
            } else {
                // Scenario 4: Beta mode OFF and no beta suffix (e.g., 1.0.2)
                // Only increment last part of main version (e.g., 1.0.2 → 1.0.3)
                const lastMainPart =
                    Number(mainParts[mainParts.length - 1]) + 1;
                mainParts[mainParts.length - 1] = `${lastMainPart}`;
                return mainParts.join(".");
            }
        }
    } catch (error) {
        // Enhance error message with original version string for debugging
        error.message = `Could not parse version number: ${version}: ${error.message}`;
        // Re-throw error to let caller handle it
        throw error;
    }
}

// Export for reuse in webpack.config.js and tests
// module.exports = { increaseVersion };
module.exports = increaseVersion;