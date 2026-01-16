/*
    npm test -- --env joplin-plugin-config=updateBetaVersion
*/

// Import the function to test (adjust the import path as needed)
const increaseVersion = require("./increaseVersion"); // Replace with your actual file path

// Test suite for increaseVersion function
describe("increaseVersion", () => {
    // ==================== Normal Scenarios (Beta = true) ====================
    test("should increment main version and add b1 suffix when beta=true and no beta suffix", () => {
        expect(increaseVersion("1.0.2", true)).toBe("1.0.3b1");
        expect(increaseVersion("2.9", true)).toBe("2.10b1");
        expect(increaseVersion("5", true)).toBe("6b1"); // Single-digit version
    });

    test("should increment beta number when beta=true and has beta suffix", () => {
        expect(increaseVersion("1.0.3b1", true)).toBe("1.0.3b2");
        expect(increaseVersion("2.10b99", true)).toBe("2.10b100"); // Large beta number
        expect(increaseVersion("6b5", true)).toBe("6b6"); // Single-digit main version + beta
    });

    // ==================== Normal Scenarios (Beta = false) ====================
    test("should increment last main version when beta=false and no beta suffix", () => {
        expect(increaseVersion("1.0.2", false)).toBe("1.0.3");
        expect(increaseVersion("2.9", false)).toBe("2.10");
        expect(increaseVersion("5", false)).toBe("6"); // Single-digit version
    });

    test("should remove beta suffix when beta=false and has beta suffix", () => {
        expect(increaseVersion("1.0.3b2", false)).toBe("1.0.3");
        expect(increaseVersion("2.10b99", false)).toBe("2.10");
        expect(increaseVersion("6b5", false)).toBe("6");
    });

    // ==================== Default Scenario (Beta not provided) ====================
    test("should use beta=false by default", () => {
        expect(increaseVersion("1.0.2")).toBe("1.0.3");
        expect(increaseVersion("1.0.3b2")).toBe("1.0.3");
    });

    const expectedVersion = "expected numeric version like x.y.z or x.y.zbn and x, y, z, n is a number";

    // ==================== Error Scenarios ====================
    test("should throw error for invalid version format", () => {
        // Non-numeric version string (triggers "Invalid version format")
        expect(() => increaseVersion("abc")).toThrow(
            `Could not parse version number: abc: Invalid version format, ${expectedVersion}`
        );
        // Empty string (triggers same error)
        expect(() => increaseVersion("")).toThrow(
            `Could not parse version number: : Invalid version format, ${expectedVersion}`
        );
        // Version with non-numeric parts (triggers same error)
        expect(() => increaseVersion("1.0.x")).toThrow(
            `Could not parse version number: 1.0.x: Invalid version format, ${expectedVersion}`
        );
        expect(() => increaseVersion("v1.2.3", false)).toThrow(
            `Could not parse version number: v1.2.3: Invalid version format, ${expectedVersion}`
        );
    });

    test("should throw error for non-string version input", () => {
        // Undefined input (triggers "Version must be a string")
        expect(() => increaseVersion(undefined)).toThrow(
            "Could not parse version number: undefined: Version must be a string (received undefined)"
        );
        // Null input (triggers same error)
        expect(() => increaseVersion(null)).toThrow(
            "Could not parse version number: null: Version must be a string (received object)"
        );
        // Numeric input (triggers same error)
        expect(() => increaseVersion(100)).toThrow(
            "Could not parse version number: 100: Version must be a string (received number)"
        );
    });
});
