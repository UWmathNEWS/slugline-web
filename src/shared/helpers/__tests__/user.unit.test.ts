import { atLeast } from "../user";
import { testUser, testAdmin } from "../../test-utils";
import { User } from "../../types";

const testStaff: User = {
  username: "test",
  first_name: "test",
  last_name: "tester",
  email: "test@example.com",
  is_staff: true,
  role: "Contributor",
  is_editor: false,
  writer_name: "testy mctestface",
};

describe("helpers.user", () => {
  describe("atLeast", () => {
    it("returns false for a null user", () => {
      expect(atLeast(null, "Contributor")).toBe(false);
    });

    it("returns true for all staff, regardless of held role", () => {
      expect(atLeast(testStaff, "Editor")).toBe(true);
    });

    it("returns true if user is at least a certain role", () => {
      expect(atLeast(testUser, "Contributor")).toBe(true);
      expect(atLeast(testUser, "Editor")).toBe(false);
      expect(atLeast(testAdmin, "Contributor")).toBe(true);
      expect(atLeast(testAdmin, "Editor")).toBe(true);
    });
  });
});
