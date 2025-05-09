import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TopControl from "../TopControl";

describe("TopControl", () => {
  const defaultProps = {
    total: 10,
    showMode: "list",
    filenameKeywords: "",
    onChangeShowMode: vi.fn(),
    onChangeKeywords: vi.fn(),
    onChangeOnlyChange: vi.fn(),
    onlyChange: false,
  };

  it("renders with default props", () => {
    render(<TopControl {...defaultProps} />);

    // 验证基础UI元素是否存在
    expect(screen.getByText("10 total files")).toBeDefined();
    expect(screen.getByText("Code tree")).toBeDefined();
    expect(screen.getByText("File list")).toBeDefined();
    expect(screen.getByText("Only Changed:")).toBeDefined();
    expect(
      screen.getByPlaceholderText("Enter the file path to search"),
    ).toBeDefined();
  });
});
