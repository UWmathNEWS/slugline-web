import React from "react";
import mockAxios from "jest-mock-axios";
import { render, fireEvent, waitForDomChange } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";
import { listFactory } from "../../../api/api";
import { useRichTable, RichTable } from "../RichTable";
import { withStatus } from "../../test-utils";
import { RequestState } from "../../../api/hooks";

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

describe("useRichTable", () => {
  const apiWithoutPagination = jest.fn((params: any) =>
    Promise.resolve(
      withStatus(200, {
        success: true,
        data: testData(params),
      })
    )
  );
  const apiWithPagination = jest.fn((params: any) => {
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
        fireEvent.click(getByText("TEXT"));
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
        fireEvent.click(getByText("ID"));
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
        fireEvent.click(getByText("ID"));
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
        fireEvent.click(getByText("ID"));
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

  /*
  TODO:
  - Uses accessor function
  - Test on API error
  - Test actions (incl. default actions)
  - Test selecting
  - Returns loader when loading data
  - Uses render function
   */
});
