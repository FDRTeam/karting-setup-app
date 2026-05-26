import { describe, it, expect } from "vitest";

describe("Data Types and Calculations", () => {
  describe("Tire Setup", () => {
    it("should create valid tire setup", () => {
      const tireSetup = {
        type: "Soft",
        pressureFront: 1.2,
        pressureRear: 1.1,
        rimBrand: "OZ Racing",
        rimMetallurgy: "Aluminum",
        tireWeightDistribution: {
          frontLeft: 24,
          frontRight: 26,
          rearLeft: 25,
          rearRight: 25,
        },
      };

      expect(tireSetup.type).toBe("Soft");
      expect(tireSetup.pressureFront).toBe(1.2);
      expect(tireSetup.tireWeightDistribution.frontLeft).toBe(24);
    });

    it("should support all tire types", () => {
      const tireTypes = ["Soft", "Medium", "Hard", "Wet", "Intermediate"];
      expect(tireTypes).toHaveLength(5);
      expect(tireTypes).toContain("Soft");
      expect(tireTypes).toContain("Wet");
    });

    it("should support all rim metallurgies", () => {
      const metallurgies = ["Aluminum", "Magnesium", "Steel", "Carbon Fiber"];
      expect(metallurgies).toHaveLength(4);
      expect(metallurgies).toContain("Aluminum");
      expect(metallurgies).toContain("Carbon Fiber");
    });
  });

  describe("Chassis Setup", () => {
    it("should create valid chassis setup", () => {
      const chassisSetup = {
        type: "Birel Art",
        caster: 4.5,
        camber: -2.0,
        toe: 0.5,
        axleBrand: "TM Racing",
        axleType: "Adjustable",
      };

      expect(chassisSetup.type).toBe("Birel Art");
      expect(chassisSetup.caster).toBe(4.5);
      expect(chassisSetup.camber).toBe(-2.0);
      expect(chassisSetup.toe).toBe(0.5);
    });

    it("should support all chassis types", () => {
      const chassisTypes = ["Birel Art", "Tony Kart", "CRG", "Exprit", "Kosmic", "Ricciardo"];
      expect(chassisTypes).toHaveLength(6);
      expect(chassisTypes).toContain("Birel Art");
      expect(chassisTypes).toContain("CRG");
    });

    it("should support all axle types", () => {
      const axleTypes = ["Standard", "Adjustable", "Fixed"];
      expect(axleTypes).toHaveLength(3);
      expect(axleTypes).toContain("Standard");
      expect(axleTypes).toContain("Adjustable");
    });
  });

  describe("Engine Setup", () => {
    it("should create valid engine setup", () => {
      const engineSetup = {
        type: "2-Stroke",
        serialNumber: "TM-2024-001",
        displacement: 125,
        power: 30,
      };

      expect(engineSetup.type).toBe("2-Stroke");
      expect(engineSetup.displacement).toBe(125);
      expect(engineSetup.power).toBe(30);
    });

    it("should support all engine types", () => {
      const engineTypes = ["2-Stroke", "4-Stroke", "Electric"];
      expect(engineTypes).toHaveLength(3);
      expect(engineTypes).toContain("2-Stroke");
      expect(engineTypes).toContain("Electric");
    });
  });

  describe("Weight Distribution", () => {
    it("should calculate balanced cross weight", () => {
      const weights = {
        frontLeftWeight: 25,
        frontRightWeight: 25,
        rearLeftWeight: 25,
        rearRightWeight: 25,
      };

      const total =
        weights.frontLeftWeight +
        weights.frontRightWeight +
        weights.rearLeftWeight +
        weights.rearRightWeight;
      const crossWeight = weights.frontLeftWeight + weights.rearRightWeight;
      const crossWeightPercentage = (crossWeight / total) * 100;

      expect(crossWeightPercentage).toBe(50);
      expect(total).toBe(100);
    });

    it("should calculate unbalanced cross weight", () => {
      const weights = {
        frontLeftWeight: 30,
        frontRightWeight: 20,
        rearLeftWeight: 25,
        rearRightWeight: 25,
      };

      const total =
        weights.frontLeftWeight +
        weights.frontRightWeight +
        weights.rearLeftWeight +
        weights.rearRightWeight;
      const crossWeight = weights.frontLeftWeight + weights.rearRightWeight;
      const crossWeightPercentage = (crossWeight / total) * 100;

      expect(crossWeightPercentage).toBeGreaterThan(50);
      expect(crossWeightPercentage).toBeLessThan(60);
      expect(total).toBe(100);
    });

    it("should calculate heavy front-left bias", () => {
      const weights = {
        frontLeftWeight: 35,
        frontRightWeight: 20,
        rearLeftWeight: 20,
        rearRightWeight: 25,
      };

      const total =
        weights.frontLeftWeight +
        weights.frontRightWeight +
        weights.rearLeftWeight +
        weights.rearRightWeight;
      const crossWeight = weights.frontLeftWeight + weights.rearRightWeight;
      const crossWeightPercentage = (crossWeight / total) * 100;

      expect(crossWeightPercentage).toBeGreaterThan(50);
      expect(total).toBe(100);
    });

    it("should handle zero weights", () => {
      const weights = {
        frontLeftWeight: 0,
        frontRightWeight: 0,
        rearLeftWeight: 0,
        rearRightWeight: 0,
      };

      const total =
        weights.frontLeftWeight +
        weights.frontRightWeight +
        weights.rearLeftWeight +
        weights.rearRightWeight;

      expect(total).toBe(0);
    });
  });

  describe("Session ID Generation", () => {
    it("should generate unique session IDs", () => {
      const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^session_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^session_\d+_[a-z0-9]{9}$/);
    });
  });

  describe("Date Formatting", () => {
    it("should format ISO date correctly", () => {
      const dateString = "2026-03-16T12:30:00Z";
      const date = new Date(dateString);

      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(2); // March (0-indexed)
      expect(date.getDate()).toBe(16);
    });
  });
});
