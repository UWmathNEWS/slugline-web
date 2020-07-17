import React from "react";
import mockAxios from "jest-mock-axios";
import {
  render,
  fireEvent,
  waitFor,
  act as actDom,
} from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { listFactory } from "../../../api/api";
import {
  useRichTable,
  RichTable,
  RichTableCell,
  RichTableRow,
  RichTableBag,
} from "../RichTable";
import { MOCK_ERROR, withStatus } from "../../test-utils";
import { RequestState } from "../../../api/hooks";
import { APIResponse, Pagination } from "../../types";

interface TestData {
  id: number;
  text: string;
}

const baseData: TestData[] = [
  { id: 0, text: "asdf" },
  { id: 1, text: "asf" },
  { id: -1, text: "" },
  { id: 2390835, text: "a!!!" },
  { id: 2, text: "bsdf" },
  { id: 3, text: "bsf" },
  { id: 4, text: "b" },
  { id: 5, text: "b!!!" },
  { id: 6, text: "csdf" },
  { id: 7, text: "csf" },
];
const resultsPerPage = 4;

const testData = ({ params }: any): TestData[] => {
  let data = baseData;

  if (params.search) {
    data = data.filter((data) => data.text.includes(params.search));
  }

  if (params.sort) {
    const sortName: keyof TestData =
      params.sort[0] === "-" ? params.sort.slice(1) : params.sort;
    const sortDirection = params.sort[0] === "-" ? -1 : 1;
    data = data.sort((a, b) => {
      if (a[sortName] < b[sortName]) return -sortDirection;
      else if (a[sortName] > b[sortName]) return sortDirection;
      else return 0;
    });
  }

  if (params.page) {
    data = data.slice(
      (params.page - 1) * resultsPerPage,
      params.page * resultsPerPage
    );
  }

  return data;
};

const apiWithoutPagination = jest.fn((params: any) =>
  Promise.resolve(
    withStatus(200, {
      success: true,
      data: testData(params),
    })
  )
);

const apiWithPagination = jest.fn<
  Promise<APIResponse<Pagination<TestData>>>,
  any[]
>((params: any) => {
  const dataNotPaginated = testData({
    params: { ...params.params, page: 0 },
  });
  return Promise.resolve(
    withStatus(200, {
      success: true,
      data: {
        count: dataNotPaginated.length,
        page: params.params.page,
        num_pages: Math.ceil(dataNotPaginated.length / resultsPerPage),
        next: null,
        previous: null,
        results: testData(params),
      },
    })
  );
});

const api = listFactory<TestData[]>("test/");

function assertNonNullable<T extends any = any>(
  val: T
): asserts val is NonNullable<T> {
  if (val === null || val === undefined) {
    throw new Error("Expected val to be something");
  }
}

jest.useFakeTimers();

describe("useRichTable", () => {
  afterEach(() => {
    apiWithoutPagination.mockClear();
    apiWithPagination.mockClear();
    mockAxios.reset();
  });

  it("returns RichTableBag with correct values", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRichTable<TestData>({
        columns: [{ key: "id", header: "ID" }],
        list: apiWithoutPagination,
        paginated: false,
      })
    );

    const bag = result.current;

    expect("error" in bag && bag.error === undefined).toBeTruthy();
    expect(bag.page).toBe(1);
    expect(bag.numPages).toBe(1);
    expect(bag.searchQuery).toBe("");
    expect(bag.count).toBe(0);
    expect(bag.totalCount).toBe(0);
    expect(bag.reqInfo.state).toBe(RequestState.Running);
    expect(bag.reqInfo.statusCode).toBeUndefined();

    expect(apiWithoutPagination).toHaveBeenCalled();

    await waitForNextUpdate();

    const newBag = result.current;

    expect("error" in newBag && newBag.error === undefined).toBeTruthy();
    expect(newBag.count).toBe(baseData.length);
    expect(newBag.totalCount).toBe(newBag.count);
    expect(newBag.reqInfo.state).toBe(RequestState.Complete);
    expect(newBag.reqInfo.statusCode).toBe(200);
  });

  it("returns RichTableBag with correct values when paginated", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRichTable<TestData>({
        columns: [{ key: "id", header: "ID" }],
        list: apiWithPagination,
        paginated: true,
      })
    );

    const bag = result.current;

    expect(bag.page).toBe(1);
    expect(bag.numPages).toBe(1);
    expect(bag.count).toBe(0);
    expect(bag.totalCount).toBe(0);

    expect(apiWithPagination).toHaveBeenCalled();
    expect(apiWithPagination.mock.calls[0][0].params.page).toBe(1);

    await waitForNextUpdate();

    const newBag = result.current;

    expect("error" in newBag && newBag.error === undefined).toBeTruthy();
    expect(newBag.page).toBe(1);
    expect(newBag.numPages).toBe(Math.ceil(baseData.length / resultsPerPage));
    expect(newBag.count).toBe(resultsPerPage);
    expect(newBag.totalCount).toBe(baseData.length);
  });

  it("returns all rows provided in the response", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRichTable<TestData>({
        columns: [{ key: "id", header: "ID" }],
        list: apiWithoutPagination,
        paginated: false,
      })
    );
    await waitForNextUpdate();

    expect(result.current.rows.map((row) => row.data)).toEqual(baseData);
  });

  it("paginates correctly", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRichTable<TestData>({
        columns: [{ key: "id", header: "ID" }],
        list: apiWithPagination,
        paginated: true,
      })
    );
    await waitForNextUpdate();

    const lastPage = result.current.numPages;
    const expectData = testData({ params: { page: lastPage } });
    act(() => {
      result.current.setPage(lastPage);
    });

    await waitForNextUpdate();

    expect(result.current.page).toBe(lastPage);
    expect(result.current.rows.map((row) => row.data)).toEqual(expectData);
    expect(result.current.count).toBe(resultsPerPage);
  });

  describe("sorting", () => {
    it("sends correct parameters to backend", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID", sortable: true }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      const expectAscData = testData({ params: { sort: "id" } });
      const expectDscData = testData({ params: { sort: "-id" } });

      act(() => {
        result.current.setSortColumn(["id", true]);
      });
      await waitForNextUpdate();

      expect(apiWithoutPagination.mock.calls[1][0].params.sort).toBe("id");
      expect(result.current.sortColumn).toEqual(["id", true]);
      expect(result.current.rows.map((row) => row.data)).toEqual(expectAscData);

      act(() => {
        result.current.setSortColumn(["id", false]);
      });
      await waitForNextUpdate();

      expect(apiWithoutPagination.mock.calls[2][0].params.sort).toBe("-id");
      expect(result.current.sortColumn).toEqual(["id", false]);
      expect(result.current.rows.map((row) => row.data)).toEqual(expectDscData);
    });

    it("is not changed on pagination", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithPagination,
          paginated: true,
        })
      );

      act(() => {
        result.current.setSortColumn(["id", true]);
      });
      await waitForNextUpdate();

      act(() => {
        result.current.setPage(2);
      });
      await waitForNextUpdate();

      expect(result.current.sortColumn).toEqual(["id", true]);
    });

    it("does not display sorting icons for non-sortable fields", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();
      const { queryAllByRole } = render(
        <div>
          {result.current.header.cells.map((cell) => (
            <span {...cell.useCellProps()}>{cell.render()}</span>
          ))}
        </div>
      );

      expect(queryAllByRole("img", { hidden: true }).length).toBe(0);
    });

    it("is updated by clicking headers", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [
            { key: "id", header: "ID", sortable: true },
            { key: "text", header: "TEXT", sortable: true },
          ],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();
      const { getByText, getAllByRole, rerender } = render(
        <div>
          {result.current.header.cells.map((cell) => (
            <span {...cell.useCellProps()}>{cell.render()}</span>
          ))}
        </div>
      );

      expect(
        getAllByRole("img", { hidden: true }).filter(
          (icon) => !icon.classList.contains("fa-sort")
        ).length
      ).toBe(0);

      await act(async () => {
        userEvent.click(getByText("TEXT"));
      });
      rerender(
        <div>
          {result.current.header.cells.map((cell) => (
            <span {...cell.useCellProps()}>{cell.render()}</span>
          ))}
        </div>
      );

      expect(result.current.sortColumn).toEqual(["text", true]);
      expect(
        getAllByRole("img", { hidden: true })[1].classList.contains(
          "fa-caret-up"
        )
      ).toBeTruthy();

      await act(async () => {
        userEvent.click(getByText("ID"));
      });
      rerender(
        <div>
          {result.current.header.cells.map((cell) => (
            <span {...cell.useCellProps()}>{cell.render()}</span>
          ))}
        </div>
      );

      expect(result.current.sortColumn).toEqual(["id", true]);
      expect(
        getAllByRole("img", { hidden: true })[0].classList.contains(
          "fa-caret-up"
        )
      ).toBeTruthy();
      expect(
        getAllByRole("img", { hidden: true })[1].classList.contains("fa-sort")
      ).toBeTruthy();

      await act(async () => {
        userEvent.click(getByText("ID"));
      });
      rerender(
        <div>
          {result.current.header.cells.map((cell) => (
            <span {...cell.useCellProps()}>{cell.render()}</span>
          ))}
        </div>
      );

      expect(result.current.sortColumn).toEqual(["id", false]);
      expect(
        getAllByRole("img", { hidden: true })[0].classList.contains(
          "fa-caret-down"
        )
      ).toBeTruthy();

      await act(async () => {
        userEvent.click(getByText("ID"));
      });
      rerender(
        <div>
          {result.current.header.cells.map((cell) => (
            <span {...cell.useCellProps()}>{cell.render()}</span>
          ))}
        </div>
      );

      expect(result.current.sortColumn).toBeNull();
      expect(
        getAllByRole("img", { hidden: true })[0].classList.contains("fa-sort")
      ).toBeTruthy();
    });
  });

  describe("searching", () => {
    it("presents searches to the backend and refreshes the table", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID", sortable: true }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      const expectData = testData({ params: { search: "a" } });

      act(() => {
        result.current.setSearchQuery("a");
      });

      await waitForNextUpdate();

      expect(apiWithoutPagination.mock.calls[1][0].params.search).toBe("a");
      expect(result.current.searchQuery).toBe("a");
      expect(result.current.rows.map((row) => row.data)).toEqual(expectData);

      act(() => {
        result.current.setSearchQuery("");
      });

      await waitForNextUpdate();

      expect(result.current.rows.length).toBe(baseData.length);
    });

    it("resets page to 1 and doesn't reset sort when search is made", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID", sortable: true }],
          list: apiWithPagination,
          paginated: true,
        })
      );
      const curSort = ["id", true];

      act(() => {
        result.current.setPage(2);
        result.current.setSortColumn(curSort as [string, boolean]);
      });

      await waitForNextUpdate();

      act(() => {
        result.current.setSearchQuery("d");
      });

      await waitForNextUpdate();

      expect(result.current.page).toBe(1);
      expect(result.current.sortColumn).toEqual(curSort);

      act(() => {
        result.current.setPage(2);
      });

      await waitForNextUpdate();

      act(() => {
        result.current.setSearchQuery("a");
      });

      await waitForNextUpdate();

      expect(result.current.page).toBe(1);
      expect(result.current.sortColumn).toEqual(curSort);
    });

    it("resets page and sort when search is cleared", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID", sortable: true }],
          list: apiWithPagination,
          paginated: true,
        })
      );
      const curPage = 2;
      const curSort = ["id", true];

      act(() => {
        result.current.setPage(curPage);
        result.current.setSortColumn(curSort as [string, boolean]);
      });

      await waitForNextUpdate();

      act(() => {
        result.current.setSearchQuery("a");
      });

      await waitForNextUpdate();

      act(() => {
        result.current.setSortColumn(["id", false]);
      });

      await waitForNextUpdate();

      act(() => {
        result.current.setSearchQuery("");
      });

      await waitForNextUpdate();

      expect(result.current.page).toBe(curPage);
      expect(result.current.sortColumn).toEqual(curSort);
    });
  });

  describe("actions", () => {
    it("executes independent actions regardless of selection", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
          actions: [
            {
              name: "test",
              call() {
                return Promise.resolve("test");
              },
            },
          ],
        })
      );
      await waitForNextUpdate();

      expect(await result.current.executeAction("test")).toBe("test");

      act(() => {
        result.current.rows[0].setSelected(true);
      });

      expect(await result.current.executeAction("test")).toBe("test");

      act(() => {
        result.current.rows[1].setSelected(true);
        result.current.rows[2].setSelected(true);
      });

      expect(await result.current.executeAction("test")).toBe("test");
    });

    it("executes non-bulk actions if and only if exactly one element is selected", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
          actions: [
            {
              name: "test",
              bulk: false,
              call(_, row) {
                return Promise.resolve(row);
              },
            },
          ],
        })
      );
      await waitForNextUpdate();

      expect(await result.current.executeAction("test")).toBeUndefined();

      act(() => {
        result.current.rows[0].setSelected(true);
      });

      expect(await result.current.executeAction("test")).toEqual(
        result.current.rows[0].data
      );

      act(() => {
        result.current.rows[1].setSelected(true);
        result.current.rows[2].setSelected(true);
      });

      await expect(result.current.executeAction("test")).rejects.toBeDefined();
    });

    it("executes bulk actions if and only if a selection is made", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
          actions: [
            {
              name: "test",
              bulk: true,
              call(_, rows) {
                return Promise.resolve(rows);
              },
            },
          ],
        })
      );
      await waitForNextUpdate();

      expect(await result.current.executeAction("test")).toBeUndefined();

      act(() => {
        result.current.rows[0].setSelected(true);
        result.current.rows[1].setSelected(true);
      });

      expect(await result.current.executeAction("test")).toEqual([
        result.current.rows[0].data,
        result.current.rows[1].data,
      ]);
    });

    it("returns a rejected promise if action does not exist", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();

      await expect(
        result.current.executeAction("non-existent")
      ).rejects.toBeDefined();
    });

    describe("triggers", () => {
      describe("click", () => {
        it("triggers only click actions whenever a row is clicked", async () => {
          const mockAction = jest.fn((_, row) => Promise.resolve());
          const mockAction2 = jest.fn();
          const { result, waitForNextUpdate } = renderHook(() =>
            useRichTable<TestData>({
              columns: [{ key: "id", header: "ID" }],
              list: apiWithoutPagination,
              paginated: false,
              actions: [
                {
                  name: "test",
                  triggers: ["click"],
                  bulk: false,
                  call: mockAction,
                },
                {
                  name: "test2",
                  bulk: false,
                  call: mockAction2,
                },
              ],
            })
          );
          await waitForNextUpdate();

          const { getAllByTestId } = render(
            <table>
              <tbody>
                {result.current.rows.map((row) => (
                  <tr data-testid="row" {...row.useRowProps()}>
                    {row.cells.map((cell) => (
                      <td data-testid="cell" {...cell.useCellProps()}>
                        {cell.render()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );

          await act(async () => {
            userEvent.click(getAllByTestId("row")[0]);
          });

          expect(mockAction).toHaveBeenCalled();
          expect(mockAction.mock.calls[0][1]).toEqual(
            result.current.rows[0].data
          );
          expect(mockAction2).not.toHaveBeenCalled();
        });

        it("does not run when the select checkbox is the target", async () => {
          const mockAction = jest.fn((_, row) => Promise.resolve());
          const { result, waitForNextUpdate } = renderHook(() =>
            useRichTable<TestData>({
              columns: [{ key: "id", header: "ID" }],
              list: apiWithoutPagination,
              paginated: false,
              selectable: true,
              actions: [
                {
                  name: "test",
                  triggers: ["click"],
                  bulk: false,
                  call: mockAction,
                },
              ],
            })
          );
          await waitForNextUpdate();

          const { getAllByRole } = render(
            <table>
              <tbody>
                {result.current.rows.map((row) => (
                  <tr data-testid="row" {...row.useRowProps()}>
                    {row.cells.map((cell) => (
                      <td data-testid="cell" {...cell.useCellProps()}>
                        {cell.render()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );

          await act(async () => {
            userEvent.click(getAllByRole("checkbox")[0]);
          });

          expect(mockAction).not.toHaveBeenCalled();
        });
      });
    });

    describe("default actions", () => {
      describe("_refresh", () => {
        it("refreshes the table", async () => {
          const { result, waitForNextUpdate } = renderHook(() =>
            useRichTable<TestData>({
              columns: [{ key: "id", header: "ID" }],
              list: api,
              paginated: false,
            })
          );

          act(() => {
            mockAxios.mockResponse({
              data: { success: true, data: baseData.slice(0, 5) },
            });
          });
          await waitForNextUpdate();

          const data = result.current.rows.map((row) => row.data);

          await act(async () => {
            await result.current.executeAction("_refresh");
          });

          act(() => {
            mockAxios.mockResponse({
              data: { success: true, data: baseData.slice(5) },
            });
          });
          await waitForNextUpdate();

          expect(data).not.toEqual(result.current.rows.map((row) => row.data));
        });
      });

      describe("_previous and _next", () => {
        it("paginates the table", async () => {
          const { result, waitForNextUpdate } = renderHook(() =>
            useRichTable<TestData>({
              columns: [{ key: "id", header: "ID" }],
              list: apiWithPagination,
              paginated: true,
            })
          );
          await waitForNextUpdate();
          expect(result.current.page).toBe(1);

          await act(async () => {
            await result.current.executeAction("_next");
          });

          expect(result.current.page).toBe(2);

          await act(async () => {
            await result.current.executeAction("_previous");
          });

          expect(result.current.page).toBe(1);
        });

        it("_next does not go past the end of the table", async () => {
          const { result, waitForNextUpdate } = renderHook(() =>
            useRichTable<TestData>({
              columns: [{ key: "id", header: "ID" }],
              list: apiWithPagination,
              paginated: true,
            })
          );
          await waitForNextUpdate();
          const numPages = result.current.numPages;

          act(() => {
            result.current.setPage(numPages);
          });

          await act(async () => {
            await result.current.executeAction("_next");
          });

          expect(result.current.page).toBe(numPages);
        });

        it("_previous does not go past the beginning of the table", async () => {
          const { result, waitForNextUpdate } = renderHook(() =>
            useRichTable<TestData>({
              columns: [{ key: "id", header: "ID" }],
              list: apiWithPagination,
              paginated: true,
            })
          );
          await waitForNextUpdate();

          await act(async () => {
            await result.current.executeAction("_previous");
          });

          expect(result.current.page).toBe(1);
        });
      });
    });
  });

  describe("header", () => {
    const TestComponent = ({ cells }: { cells: RichTableCell[] }) => (
      <table>
        <thead>
          <tr>
            {cells.map((cell) => (
              <th data-testid="cell" {...cell.useCellProps()}>
                {cell.render()}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    );

    it("renders the column header", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();

      const { getByText } = render(
        <TestComponent cells={result.current.header.cells} />
      );

      expect(getByText("ID")).toBeInTheDocument();
    });

    it("only renders provided columns", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();

      const { queryAllByTestId } = render(
        <TestComponent cells={result.current.header.cells} />
      );

      expect(queryAllByTestId("cell").length).toBe(1);
    });

    it("renders a checkbox when the table is selectable", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
          selectable: true,
        })
      );
      await waitForNextUpdate();

      const { queryByRole } = render(
        <TestComponent cells={result.current.header.cells} />
      );

      expect(queryByRole("checkbox")).not.toBeNull();
    });

    it("sets the width of each column if provided", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID", width: 25 }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();

      const { getByTestId } = render(
        <TestComponent cells={result.current.header.cells} />
      );

      expect(getByTestId("cell")?.style.width).toBe("25%");
    });

    it("returns a valid object for useRowProps()", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();

      // check it's an object
      expect(result.current.header.useRowProps()).toBeDefined();
      // and check that it can render without crashing
      render(<div {...result.current.header.useRowProps()} />);
    });

    it("cannot be selected", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();

      expect(result.current.header.isSelected).toBe(false);
      const selected = result.current.selected;

      act(() => {
        result.current.header.setSelected(true);
      });

      expect(result.current.selected).toEqual(selected);
    });

    it("select all selects all on current page", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
          selectable: true,
        })
      );
      await waitForNextUpdate();

      const { getByRole } = render(
        <TestComponent cells={result.current.header.cells} />
      );

      act(() => {
        userEvent.click(getByRole("checkbox"));
      });

      expect(result.current.selected).toEqual(baseData);
    });

    it("select all is indeterminate when only some rows are selected", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
          selectable: true,
        })
      );
      await waitForNextUpdate();

      const { getByRole } = render(
        <TestComponent cells={result.current.header.cells} />
      );

      act(() => {
        result.current.rows[0].setSelected(true);
      });

      expect((getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(
        true
      );
    });
  });

  describe("data", () => {
    const TestComponent = <T extends object>({
      rows,
    }: {
      rows: RichTableRow<T>[];
    }) => (
      <table>
        <tbody>
          {rows.map((row) => (
            <tr data-testid="row" {...row.useRowProps()}>
              {row.cells.map((cell) => (
                <td data-testid="cell" {...cell.useCellProps()}>
                  {cell.render()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );

    it("uses accessors if defined", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [
            { key: "a", header: "TEXT", accessor: "text" },
            {
              key: "b",
              header: "RANDOM",
              accessor(row) {
                return 4 + row.id;
              },
            },
          ],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();

      const { getAllByTestId } = render(
        <TestComponent rows={result.current.rows} />
      );

      expect(getAllByTestId("cell")[0]).toHaveTextContent(baseData[0].text);
      expect(getAllByTestId("cell")[1]).toHaveTextContent(
        (baseData[0].id + 4).toString()
      );
    });

    it("uses render function if defined", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [
            {
              key: "id",
              header: "ID",
              render(cell, row) {
                return (
                  <em data-testid="render">
                    {cell}.{row.text}
                  </em>
                );
              },
            },
          ],
          list: apiWithoutPagination,
          paginated: false,
        })
      );
      await waitForNextUpdate();

      const { getAllByTestId } = render(
        <TestComponent rows={result.current.rows} />
      );

      // [0] has an empty string, so we use [1] instead
      expect(getAllByTestId("render")[1]).toHaveTextContent(
        `${baseData[1].id}.${baseData[1].text}`
      );
    });

    it("selecting rows changes their selection state", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRichTable<TestData>({
          columns: [{ key: "id", header: "ID" }],
          list: apiWithoutPagination,
          paginated: false,
          selectable: true,
        })
      );
      await waitForNextUpdate();

      const { getAllByRole, rerender } = render(
        <TestComponent rows={result.current.rows} />
      );
      const selected = result.current.selected;

      await act(async () => {
        userEvent.click(getAllByRole("checkbox")[0]);
      });
      rerender(<TestComponent rows={result.current.rows} />);

      expect(selected.length).not.toEqual(result.current.selected.length);
      expect(result.current.selected[0]).toEqual(result.current.rows[0].data);
      expect(
        (getAllByRole("checkbox")[0] as HTMLInputElement).checked
      ).toBeTruthy();
    });

    describe("displays a single row with message if no data is returned", () => {
      it(".", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );

        act(() => {
          mockAxios.mockResponse({ data: null });
        });
        await waitForNextUpdate();

        const { getAllByTestId } = render(
          <TestComponent rows={result.current.rows} />
        );

        expect(getAllByTestId("row").length).toBe(1);
        expect(getAllByTestId("cell").length).toBe(1);
        expect(getAllByTestId("row")[0]).not.toHaveTextContent(/Error/);
        expect(getAllByTestId("cell")[0].getAttribute("colspan")).toBe("1");
      });

      it("adds an extra column if selectable is on", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
            selectable: true,
          })
        );

        act(() => {
          mockAxios.mockResponse({ data: null });
        });
        await waitForNextUpdate();

        const { getAllByTestId } = render(
          <TestComponent rows={result.current.rows} />
        );

        expect(getAllByTestId("cell")[0].getAttribute("colspan")).toBe("2");
      });

      it("cannot be selected", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );
        act(() => {
          mockAxios.mockResponse({ status: 500, data: MOCK_ERROR });
        });
        await waitForNextUpdate();

        const selected = result.current.selected;

        act(() => {
          result.current.rows[0].setSelected(true);
        });

        expect(result.current.selected).toEqual(selected);
      });
    });

    describe("while loading", () => {
      it("displays loaders for each row", () => {
        const { result } = renderHook(() =>
          useRichTable<TestData>({
            columns: [
              { key: "id", header: "ID" },
              { key: "text", header: "TEXT" },
            ],
            list: api,
            paginated: false,
          })
        );

        const { getAllByRole } = render(
          <TestComponent rows={result.current.rows} />
        );

        expect(getAllByRole("status").length % 2).toBe(0);
      });

      it("displays only one row on initial mount", () => {
        const { result } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );

        const { getAllByTestId } = render(
          <TestComponent rows={result.current.rows} />
        );

        expect(getAllByTestId("row").length).toBe(1);
      });

      it("shows the same number of rows as the previous data had", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );

        const { getAllByTestId, rerender } = render(
          <TestComponent rows={result.current.rows} />
        );

        act(() => {
          mockAxios.mockResponse({
            data: {
              success: true,
              data: testData(mockAxios.lastReqGet().config),
            },
          });
        });
        await waitForNextUpdate();

        rerender(<TestComponent rows={result.current.rows} />);

        const len = getAllByTestId("row").length;

        await act(async () => {
          await result.current.executeAction("_refresh");
        });

        // Sanity check to make sure we're in a loading state
        expect(result.current.reqInfo.state).not.toBe(RequestState.Complete);

        rerender(<TestComponent rows={result.current.rows} />);

        expect(getAllByTestId("row").length).toBe(len);
      });

      it("renders a placeholder for selects with selectable on", () => {
        const { result } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
            selectable: true,
          })
        );

        const { getAllByTestId, getAllByRole } = render(
          <TestComponent rows={result.current.rows} />
        );

        expect(getAllByTestId("cell").length).toBe(2);
        // should not render loader for select column
        expect(getAllByRole("status").length).toBe(1);
      });

      it("does not render the select column with selectable off", () => {
        const { result } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );

        const { getAllByTestId } = render(
          <TestComponent rows={result.current.rows} />
        );

        // Should only display one
        expect(getAllByTestId("cell").length).toBe(1);
      });

      it("rows cannot be selected", () => {
        const { result } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );
        const selected = result.current.selected;

        act(() => {
          result.current.rows[0].setSelected(true);
        });

        expect(result.current.selected).toEqual(selected);
      });
    });

    describe("on error state", () => {
      it("passes on error as part of the bag", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );

        act(() => {
          mockAxios.mockResponse({ status: 500, data: MOCK_ERROR });
        });
        await waitForNextUpdate();

        expect(result.current.error).not.toBeUndefined();
      });

      it("displays a single row with error message", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );

        act(() => {
          mockAxios.mockResponse({ status: 500, data: MOCK_ERROR });
        });
        await waitForNextUpdate();

        const { getAllByTestId } = render(
          <TestComponent rows={result.current.rows} />
        );

        expect(getAllByTestId("row").length).toBe(1);
        expect(getAllByTestId("cell").length).toBe(1);
        expect(getAllByTestId("row")[0]).toHaveTextContent(/500/);
        expect(getAllByTestId("cell")[0].getAttribute("colspan")).toBe("1");
      });

      it("adds an extra column if selectable is on", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
            selectable: true,
          })
        );

        act(() => {
          mockAxios.mockResponse({ status: 500, data: MOCK_ERROR });
        });
        await waitForNextUpdate();

        const { getAllByTestId } = render(
          <TestComponent rows={result.current.rows} />
        );

        expect(getAllByTestId("cell")[0].getAttribute("colspan")).toBe("2");
      });

      it("cannot be selected", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRichTable<TestData>({
            columns: [{ key: "id", header: "ID" }],
            list: api,
            paginated: false,
          })
        );
        act(() => {
          mockAxios.mockResponse({ status: 500, data: MOCK_ERROR });
        });
        await waitForNextUpdate();

        const selected = result.current.selected;

        act(() => {
          result.current.rows[0].setSelected(true);
        });

        expect(result.current.selected).toEqual(selected);
      });
    });
  });
});

describe("RichTable", () => {
  afterEach(() => {
    apiWithPagination.mockClear();
    mockAxios.reset();
  });

  it("renders all elements", async () => {
    const { container } = render(
      <RichTable
        columns={[
          { key: "id", header: "ID" },
          { key: "text", header: "TEXT" },
        ]}
        list={apiWithPagination}
        paginated={true}
      />
    );
    await waitFor(() => {});

    const th = Array.from(container.querySelectorAll("th"));
    expect(th[0]).toHaveTextContent("ID");
    expect(th[1]).toHaveTextContent("TEXT");

    for (const [i, row] of Object.entries(
      container.querySelectorAll("tbody tr")
    )) {
      const expectedRow = baseData[parseInt(i)];
      const cells = row.querySelectorAll("td");
      expect(cells[0]).toHaveTextContent(expectedRow.id.toString());
      expect(cells[1]).toHaveTextContent(expectedRow.text);
    }
  });

  describe("pagination", () => {
    it("buttons paginate and update page", async () => {
      let bag: RichTableBag;
      const { getAllByTitle } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          bagRef={(ref) => {
            bag = ref;
          }}
        />
      );
      await waitFor(() => {});

      assertNonNullable(bag!);

      await actDom(async () => {
        userEvent.click(getAllByTitle(/next page/i)[0]);
      });

      expect((getAllByTitle(/set page/i)[0] as HTMLInputElement).value).toBe(
        bag.page.toString()
      );

      await actDom(async () => {
        userEvent.click(getAllByTitle(/previous page/i)[0]);
      });

      expect((getAllByTitle(/set page/i)[0] as HTMLInputElement).value).toBe(
        bag.page.toString()
      );
    });

    it("buttons are disabled when at page bounds", async () => {
      let bag: RichTableBag;
      const { getAllByTitle } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          bagRef={(ref) => {
            bag = ref;
          }}
        />
      );
      await waitFor(() => {});

      assertNonNullable(bag!);

      expect(
        (getAllByTitle(/previous page/i)[0] as HTMLInputElement).disabled
      ).toBeTruthy();

      await actDom(async () => {
        bag.setPage(bag.numPages);
      });

      expect(
        (getAllByTitle(/next page/i)[0] as HTMLInputElement).disabled
      ).toBeTruthy();
    });

    it("buttons are disabled when loading", () => {
      const { getAllByTitle } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={api}
          paginated={true}
        />
      );

      expect(
        (getAllByTitle(/previous page/i)[0] as HTMLInputElement).disabled
      ).toBeTruthy();
      expect(
        (getAllByTitle(/next page/i)[0] as HTMLInputElement).disabled
      ).toBeTruthy();
    });

    describe("pagination input", () => {
      it("navigates to supplied page", async () => {
        let bag: RichTableBag;
        const { getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
            bagRef={(ref) => {
              bag = ref;
            }}
          />
        );
        await waitFor(() => {});

        assertNonNullable(bag!);

        const input = getAllByTitle(/set page/i)[0];

        await actDom(async () => {
          await userEvent.type(input, "2");
        });

        await actDom(async () => {
          fireEvent.submit(input);
        });

        await waitFor(() => {
          expect(bag.page).toBe(2);
        });
      });

      it("clamps values on submit", async () => {
        let bag: RichTableBag;
        const { getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
            bagRef={(ref) => {
              bag = ref;
            }}
          />
        );
        await waitFor(() => {});

        assertNonNullable(bag!);

        const input = getAllByTitle(/set page/i)[0];

        await actDom(async () => {
          await userEvent.type(input, "8");
        });

        await actDom(async () => {
          fireEvent.submit(input);
        });

        await waitFor(() => {
          expect(bag.page).toBe(bag.numPages);
        });

        await actDom(async () => {
          userEvent.clear(input);
        });

        await actDom(async () => {
          await userEvent.type(input, "-1");
        });

        await actDom(async () => {
          fireEvent.submit(input);
        });

        await waitFor(() => {
          expect(bag.page).toBe(1);
        });
      });

      it("ignores invalid input", async () => {
        let bag: RichTableBag;
        const { getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
            bagRef={(ref) => {
              bag = ref;
            }}
          />
        );
        await waitFor(() => {});

        assertNonNullable(bag!);

        const input = getAllByTitle(/set page/i)[0] as HTMLInputElement;

        // setup to make sure we don't just reset the default to 1 or whatever
        await actDom(async () => {
          await userEvent.type(input, "2");
        });

        await actDom(async () => {
          fireEvent.submit(input);
        });

        // actual test
        await actDom(async () => {
          await fireEvent.change(input, { target: { value: "bbbbbb" } });
        });

        await actDom(async () => {
          fireEvent.submit(input);
        });

        await waitFor(() => {
          expect(bag.page).toBe(2);
          expect(input.value).toBe("2");
        });
      });

      it("blur event doesn't replace values", async () => {
        const { getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
          />
        );
        await waitFor(() => {});

        const input = getAllByTitle(/set page/i)[0] as HTMLInputElement;

        await actDom(async () => {
          // FIXME: userEvent.type appears to trigger some sort of edge case here where React complains about
          //        a state update on an unmounted component
          await fireEvent.change(input, { target: { value: "2" } });
        });

        await actDom(async () => {
          fireEvent.blur(input);
        });

        await waitFor(() => {
          expect(input.value).toBe("2");
        });
      });

      it("clicking outside resets", async () => {
        let bag: RichTableBag;
        const { container, getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
            bagRef={(ref) => {
              bag = ref;
            }}
          />
        );
        await waitFor(() => {});

        assertNonNullable(bag!);

        const page = bag.page;
        const input = getAllByTitle(/set page/i)[0] as HTMLInputElement;

        await actDom(async () => {
          await userEvent.type(input, "2");
        });

        await actDom(async () => {
          fireEvent.click(container);
        });

        await waitFor(() => {
          expect(input.value).toBe(page.toString());
        });
      });

      it("pressing escape cancels input", async () => {
        let bag: RichTableBag;
        const { getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
            bagRef={(ref) => {
              bag = ref;
            }}
          />
        );
        await waitFor(() => {});

        assertNonNullable(bag!);

        const page = bag.page;
        const input = getAllByTitle(/set page/i)[0] as HTMLInputElement;

        await actDom(async () => {
          await userEvent.type(input, "2{esc}");
        });

        await waitFor(() => {
          expect(input.value).toBe(page.toString());
        });
      });

      it("pressing tab cancels input", async () => {
        let bag: RichTableBag;
        const { getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
            bagRef={(ref) => {
              bag = ref;
            }}
          />
        );
        await waitFor(() => {});

        assertNonNullable(bag!);

        const page = bag.page;
        const input = getAllByTitle(/set page/i)[0] as HTMLInputElement;

        await actDom(async () => {
          await userEvent.type(input, "2");
        });

        await actDom(async () => {
          fireEvent.keyDown(input, { key: "Tab" });
        });

        await waitFor(() => {
          expect(input.value).toBe(page.toString());
        });
      });

      it("cleans up event listeners on non-visibilitychange blur or submit", async () => {
        const { getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
          />
        );
        await waitFor(() => {});

        const spy = jest.spyOn(window, "removeEventListener");
        const input = getAllByTitle(/set page/i)[0];

        await actDom(async () => {
          await userEvent.type(input, "2");
        });

        await actDom(async () => {
          fireEvent.submit(input);
        });

        expect(
          spy.mock.calls.filter((call) => call[0] === "click").length
        ).toBe(1);

        await actDom(async () => {
          await userEvent.type(input, "2{esc}");
        });

        await waitFor(() => {
          expect(
            spy.mock.calls.filter((call) => call[0] === "click").length
          ).toBe(2);
        });

        spy.mockRestore();
      });

      it("doesn't attach multiple event listeners", async () => {
        const { getAllByTitle } = render(
          <RichTable
            columns={[{ key: "id", header: "ID" }]}
            list={apiWithPagination}
            paginated={true}
          />
        );
        await waitFor(() => {});

        const spy = jest.spyOn(window, "addEventListener");
        const input = getAllByTitle(/set page/i)[0];

        await actDom(async () => {
          fireEvent.focus(input);
        });

        await actDom(async () => {
          fireEvent.focus(input);
        });

        expect(
          spy.mock.calls.filter((call) => call[0] === "click").length
        ).toBe(1);

        spy.mockRestore();
      });
    });
  });

  describe("searching", () => {
    it("shows a search box if searchable is on", async () => {
      const { queryByTitle } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          searchable={true}
        />
      );
      await waitFor(() => {});

      expect(queryByTitle("Search")).toBeInTheDocument();
    });

    it("passes on search queries to useRichTable", async () => {
      let bag: RichTableBag;
      const { getByTitle } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          searchable={true}
          bagRef={(ref) => {
            bag = ref;
          }}
        />
      );
      await waitFor(() => {});

      assertNonNullable(bag!);

      const search = getByTitle("Search");

      await actDom(async () => {
        await userEvent.type(search, "a");
      });

      actDom(() => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(bag.searchQuery).toBe("a");
      });

      await actDom(async () => {
        userEvent.clear(search);
      });

      await waitFor(() => {
        expect(bag.searchQuery).toBe("");
      });
    });
  });

  describe("actions", () => {
    it("shows actions if defined", async () => {
      const { getByText } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          actions={[
            {
              name: "Test Action 123",
              call() {
                return Promise.resolve();
              },
            },
            {
              name: "asdf",
              displayName: "Test Action 321",
              call() {
                return Promise.resolve();
              },
            },
          ]}
        />
      );
      await waitFor(() => {});

      expect(getByText("Test Action 123")).toBeInTheDocument();
      expect(getByText("Test Action 321")).toBeInTheDocument();
    });

    it("executes actions when clicked", async () => {
      // spy is only to prevent error from being printed
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      const goodAction = jest.fn(() => Promise.resolve());
      const badAction = jest.fn(() => Promise.reject());
      const { getByText } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          actions={[
            {
              name: "Test Action 123",
              call: goodAction,
            },
            {
              name: "asdf",
              displayName: "Test Action 321",
              call: badAction,
            },
          ]}
        />
      );
      await waitFor(() => {});

      userEvent.click(getByText("Test Action 123"));

      await waitFor(() => {
        expect(goodAction).toHaveBeenCalled();
      });

      userEvent.click(getByText("Test Action 321"));

      await waitFor(() => {
        expect(badAction).toHaveBeenCalled();
      });

      spy.mockRestore();
    });

    it("disables non-independent actions when no rows are selected", async () => {
      const { getByText } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          actions={[
            {
              name: "test actionable",
              call() {
                return Promise.resolve();
              },
            },
            {
              name: "Test Action 123",
              bulk: false,
              call() {
                return Promise.resolve();
              },
            },
            {
              name: "asdf",
              displayName: "Test Action 321",
              bulk: true,
              call() {
                return Promise.resolve();
              },
            },
          ]}
        />
      );
      await waitFor(() => {});

      expect(
        (getByText("test actionable") as HTMLButtonElement).disabled
      ).toBeFalsy();
      expect(
        (getByText("Test Action 123") as HTMLButtonElement).disabled
      ).toBeTruthy();
      expect(
        (getByText("Test Action 321") as HTMLButtonElement).disabled
      ).toBeTruthy();
    });

    it("enables non-bulk actions if one row is selected", async () => {
      let bag: RichTableBag;
      const { getByText } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          actions={[
            {
              name: "test actionable",
              call() {
                return Promise.resolve();
              },
            },
            {
              name: "Test Action 123",
              bulk: false,
              call() {
                return Promise.resolve();
              },
            },
            {
              name: "asdf",
              displayName: "Test Action 321",
              bulk: true,
              call() {
                return Promise.resolve();
              },
            },
          ]}
          bagRef={(ref) => {
            bag = ref;
          }}
        />
      );
      await waitFor(() => {});

      assertNonNullable(bag!);

      actDom(() => {
        bag.rows[0].setSelected(true);
      });

      await waitFor(() => {
        expect(
          (getByText("test actionable") as HTMLButtonElement).disabled
        ).toBeFalsy();
        expect(
          (getByText("Test Action 123") as HTMLButtonElement).disabled
        ).toBeFalsy();
        expect(
          (getByText("Test Action 321") as HTMLButtonElement).disabled
        ).toBeFalsy();
      });
    });

    it("disables non-bulk actions if multiple rows are selected", async () => {
      let bag: RichTableBag;
      const { getByText } = render(
        <RichTable
          columns={[{ key: "id", header: "ID" }]}
          list={apiWithPagination}
          paginated={true}
          actions={[
            {
              name: "test actionable",
              call() {
                return Promise.resolve();
              },
            },
            {
              name: "Test Action 123",
              bulk: false,
              call() {
                return Promise.resolve();
              },
            },
            {
              name: "asdf",
              displayName: "Test Action 321",
              bulk: true,
              call() {
                return Promise.resolve();
              },
            },
          ]}
          bagRef={(ref) => {
            bag = ref;
          }}
        />
      );
      await waitFor(() => {});

      assertNonNullable(bag!);

      actDom(() => {
        bag.rows[0].setSelected(true);
        bag.rows[1].setSelected(true);
      });

      await waitFor(() => {
        expect(
          (getByText("test actionable") as HTMLButtonElement).disabled
        ).toBeFalsy();
        expect(
          (getByText("Test Action 123") as HTMLButtonElement).disabled
        ).toBeTruthy();
        expect(
          (getByText("Test Action 321") as HTMLButtonElement).disabled
        ).toBeFalsy();
      });
    });
  });
});
