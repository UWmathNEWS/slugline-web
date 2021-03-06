import "./styles/RichTable.scss";

import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from "react";
import {
  Form,
  FormControl,
  FormCheck,
  Table,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import nanoid from "nanoid";

import { APIError, APIResponse, Pagination } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToast } from "../contexts/ToastContext";
import { useDebouncedCallback } from "../hooks";
import { QueryParams, RequestArgs } from "../../api/api";
import { useAPI, RequestInfo, RequestState } from "../../api/hooks";
import Loader from "./Loader";

/**
 * RichTable describes a component that displays tabular data in an interactive manner. It defines two main exports:
 *
 * - useRichTable, a React hook for creating rich tables.
 * - RichTable, a React component to effortlessly insert a rich table.
 *
 * The interface is inspired by react-table.
 */

/**
 * First, we must introduce some basic types.
 */

type ReactElement = React.ReactElement | React.ReactText | React.ReactFragment;

export type Accessor<D extends object> = (row: D) => any;

export interface ColumnProps<D extends object = {}> {
  header: ReactElement;
  sortable?: boolean;
  width?: number;
  render?: (cell: any, row: D) => ReactElement;
}

export type Column<D extends object = {}> = ColumnProps<D> &
  (
    | {
        key: keyof D & string;
        accessor?: undefined;
      }
    | {
        key: string;
        accessor: keyof D | Accessor<D>;
      }
  );

export interface PropsBag {
  key: any;
  [k: string]: any;
}

/**
 * Rich tables are completely self-contained, and so in order for external users to interact with and manipulate the
 * data, we introduce actions. Crucially, actions can be triggered only through user interaction with the table. This
 * means that the table cannot be manipulated through side effects.
 */

interface BaseAction {
  name: string;
  displayName?: string;
  triggers?: "click"[];
}

export type Action<D extends object = {}> = BaseAction &
  (
    | {
        bulk: true;
        call: (bag: RichTableBag<D>, rows: D[]) => Promise<any>;
      }
    | {
        bulk: false;
        call: (bag: RichTableBag<D>, row: D) => Promise<any>;
      }
    | {
        call: (bag: RichTableBag<D>) => Promise<any>;
      }
  );

/**
 * Here are the main types used to interact with RichTable.
 *
 * - RichTableCell and RichTableRow are self-explanatory.
 * - RichTableProps defines the props to pass into useRichTable or RichTable.
 * - RichTableBag contains all the data and methods required to construct a table. It is inspired by the Formik bag.
 */

export interface RichTableCell {
  useCellProps: () => PropsBag;
  render: () => React.ReactElement | React.ReactText | React.ReactFragment;
}

export interface RichTableRow<D extends object> {
  useRowProps: () => PropsBag;
  data: D;
  cells: RichTableCell[];
  isSelected: boolean;
  setSelected: (s: boolean) => void;
}

export interface RichTableHookProps<D extends object = {}> {
  columns: Column<D>[];
  list: (args: RequestArgs) => Promise<APIResponse<D[] | Pagination<D>>>;
  paginated: boolean;
  actions?: Action<D>[];
  selectable?: boolean;
}

export interface RichTableProps<D extends object = {}>
  extends RichTableHookProps<D> {
  className?: string;
  searchable?: boolean;
  ref?: React.Ref<Table & HTMLTableElement>;
  bagRef?: (instance: RichTableBag<D>) => void;
}

export interface RichTableBag<D extends object = {}> {
  error: APIError | undefined;
  header: RichTableRow<{}>;
  rows: RichTableRow<D>[];
  selected: D[];
  page: number;
  numPages: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortColumn: [string, boolean] | null;
  setSortColumn: (col: [string, boolean] | null) => void;
  count: number;
  totalCount: number;
  executeAction: (name: string) => Promise<any>;
  reqInfo: RequestInfo;
}

/**
 * Here, we define useRichTable, the main hook used to construct a rich table. It handles all data-related aspects; the
 * only way to interact with the data externally is through actions.
 */
export const useRichTable = <D extends object = {}>({
  columns,
  list: get,
  paginated,
  actions = [],
  selectable,
}: RichTableHookProps<D>): RichTableBag<D> => {
  const id = useRef(nanoid());
  const [sortColumn, setSortColumn] = useState<[string, boolean] | null>(null);
  const [searchQuery, _setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  // Trigger refreshes by toggling this state.
  // Named cuckoo because it reminds me of cuckoo hashing.
  const [cuckooLoad, setCuckoo] = useState(false);

  const preSearchParams = useRef<{
    page: number;
    sortColumn: [string, boolean] | null;
  }>({
    page: 1,
    sortColumn: null,
  });
  const setSearchQuery = (query: string) => {
    if (!searchQuery) {
      preSearchParams.current = {
        page,
        sortColumn,
      };
    } else if (searchQuery && !query) {
      setPage(preSearchParams.current.page);
      setSortColumn(preSearchParams.current.sortColumn);
    }
    if (query) {
      setPage(1);
    }
    _setSearchQuery(query);
  };

  const getWithParams = useCallback(
    () => {
      let params: QueryParams = {
        time: Date.now(),
      };
      if (paginated) {
        params.page = page;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (sortColumn !== null) {
        params.sort = (sortColumn[1] ? "" : "-") + sortColumn[0];
      }
      return get({ params });
    },
    // We can ignore the warning about cuckooLoad being an unnecessary dependency, since it exists to trigger
    // refreshing without changing other state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [get, paginated, sortColumn, searchQuery, page, cuckooLoad]
  );
  const [rawData, error, reqInfo] = useAPI(getWithParams);
  const data = useMemo<D[]>(
    () =>
      (paginated ? (rawData as Pagination<D>)?.results : (rawData as D[])) ||
      [],
    [paginated, rawData]
  );

  const numPages = paginated ? (rawData as Pagination<D>)?.num_pages || 1 : 1;

  const totalCount = paginated
    ? (rawData as Pagination<D>)?.count || 0
    : data.length;
  const count =
    page < numPages || page === 1
      ? data.length
      : (totalCount - data.length) / (numPages - 1);

  const selectAllRef = useRef<FormCheck & HTMLInputElement>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [filteredSelected, setFilteredSelected] = useState<D[]>([]);

  useEffect(() => {
    setSelected(new Array(data.length).fill(false));
  }, [data]);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        !selected.every((d) => d) && selected.some((d) => d);
    }
  }, [selected]);
  useEffect(() => {
    setFilteredSelected(data.filter((_, i) => selected[i]));
  }, [data, selected]);

  const clickActions = useMemo<Action<D>[]>(
    () =>
      actions.filter(
        (action) => action.triggers && action.triggers.includes("click")
      ),
    [actions]
  );

  const memoizedActions = useMemo<{ [key: string]: Action<D> }>(
    () => ({
      _refresh: {
        name: "_refresh",
        call() {
          setCuckoo((cuckoo) => !cuckoo);
          return Promise.resolve();
        },
      },
      _previous: {
        name: "_previous",
        call() {
          setPage((page) => (page > 1 ? page - 1 : 1));
          return Promise.resolve();
        },
      },
      _next: {
        name: "_next",
        call() {
          setPage((page) => (page < numPages ? page + 1 : numPages));
          return Promise.resolve();
        },
      },
      ...actions.reduce(
        (acc, action) => ({ ...acc, [action.name]: action }),
        {}
      ),
    }),
    [actions, numPages]
  );

  const internalExecuteAction = useRef<
    (name: string, rows: D[]) => Promise<any>
  >(
    /* istanbul ignore next */
    () => Promise.resolve()
  );

  useEffect(() => {
    internalExecuteAction.current = (name: string, rows: D[]) => {
      const action = memoizedActions[name];

      if ("bulk" in action) {
        if (action.bulk) {
          return action.call(bag, rows);
        } else {
          if (rows.length === 1) {
            return action.call(bag, rows[0]);
          } else {
            return Promise.reject(
              "Multiple rows selected for non-bulk action."
            );
          }
        }
      } else {
        return action.call(bag);
      }
    };
  });

  const executeAction = useCallback(
    (name: string) => {
      if (!(name in memoizedActions)) {
        return Promise.reject(
          `Action ${name} does not exist or was improperly registered.`
        );
      }

      if ("bulk" in memoizedActions[name] && filteredSelected.length) {
        return internalExecuteAction.current(name, filteredSelected);
      } else if (!("bulk" in memoizedActions[name])) {
        return internalExecuteAction.current(name, []);
      }

      return Promise.resolve();
    },
    [filteredSelected, memoizedActions]
  );

  // Impossible to test the following, since useEffect will immediately run
  /* istanbul ignore next */
  const onSelectAll = useRef(() => {});

  useEffect(() => {
    if (selectable) {
      onSelectAll.current = () => {
        // Infeasible to test else branch
        /* istanbul ignore else */
        if (selectAllRef.current) {
          setSelected((prevSelected) =>
            new Array(data.length).fill(!prevSelected.some((d) => d))
          );
        }
      };
    }
  }, [selectable, data.length]);

  const header = useMemo<RichTableRow<{}>>(() => {
    let cells: RichTableCell[] = columns.map(
      ({ header, key, sortable, width }) => {
        let props: PropsBag = { key };

        if (sortable) {
          props.onClick = () => {
            if (sortColumn === null || sortColumn[0] !== key) {
              setSortColumn([key, true]);
            } else {
              if (sortColumn[1]) {
                setSortColumn([key, false]);
              } else {
                setSortColumn(null);
              }
            }
          };
        }

        if (width) {
          props.style = {
            width: `${width}%`,
          };
        }

        return {
          useCellProps() {
            return props;
          },
          render() {
            return (
              <span className="RichTable_cellHeader">
                {header}
                {sortable && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon
                      icon={
                        sortColumn && sortColumn[0] === key
                          ? sortColumn[1]
                            ? "caret-up"
                            : "caret-down"
                          : "sort"
                      }
                      className="ml-auto"
                    />
                  </>
                )}
              </span>
            );
          },
        };
      }
    );

    if (selectable) {
      cells.unshift({
        useCellProps() {
          return {
            key: "select-all",
            className: "RichTable_selectCheckbox",
          };
        },
        render() {
          return (
            <FormCheck
              custom
              label={""}
              type="checkbox"
              aria-label="select all"
              id={`RichTable-${id.current}-select-all`}
              checked={selected.length > 0 && selected.every((d) => d)}
              onChange={onSelectAll.current}
              ref={selectAllRef}
            />
          );
        },
      });
    }

    return {
      useRowProps() {
        return { key: "header" };
      },
      data: {},
      cells,
      isSelected: false,
      setSelected() {},
    };
  }, [columns, selected, sortColumn, selectable]);

  const rows = useMemo<RichTableRow<D>[]>(() => {
    // Loading state
    if (reqInfo.state !== RequestState.Complete) {
      return new Array(data.length || 1).fill(null).map(
        (_, i): RichTableRow<D> => {
          let cells = columns.map(
            ({ key }, j): RichTableCell => ({
              useCellProps() {
                return {
                  key,
                  className: "RichTable_loading",
                };
              },
              render() {
                return (
                  <Loader
                    variant="linear"
                    hideFromScreenreaders={i > 0 || j > 0}
                  />
                );
              },
            })
          );

          if (selectable) {
            cells.unshift({
              useCellProps() {
                return {
                  key: 0,
                  className: "RichTable_selectCheckbox RichTable_loading",
                };
              },
              render() {
                return "";
              },
            });
          }

          return {
            useRowProps() {
              return { key: i };
            },
            data: {} as D,
            cells,
            isSelected: false,
            setSelected() {},
          };
        }
      );
    }

    // No data or error state
    if (!data.length || error !== undefined) {
      return [
        {
          useRowProps() {
            return { key: 0 };
          },
          data: {} as D,
          cells: [
            {
              useCellProps() {
                return {
                  key: 0,
                  className: "RichTable_noRowsReturned text-center",
                  colSpan: columns.length + (selectable ? 1 : 0),
                };
              },
              render() {
                // TODO: more descriptive error messages?
                return error !== undefined
                  ? `An error occurred: Error ${reqInfo.statusCode}`
                  : "No rows returned.";
              },
            },
          ],
          isSelected: false,
          setSelected() {},
        },
      ];
    }

    // Regular state
    return data.map((row, i) => {
      let props: PropsBag = { key: i };

      let cells: RichTableCell[] = columns.map(({ key, accessor, render }) => {
        const cell = accessor
          ? typeof accessor === "function"
            ? accessor(row)
            : row[accessor]
          : row[key as keyof D];
        let props: PropsBag = { key };

        return {
          useCellProps() {
            return props;
          },
          render() {
            return render ? render(cell, row) : cell;
          },
        };
      });

      if (clickActions.length) {
        props.onClick = (e: React.MouseEvent) => {
          if (
            !(e.target as Element)
              .closest("td")
              ?.classList.contains("RichTable_selectCheckbox")
          ) {
            clickActions.forEach((action) => {
              internalExecuteAction.current(action.name, [row]);
            });
          }
        };
      }

      const selectRow = () => {
        setSelected((prevSelected) => {
          prevSelected[i] = !prevSelected[i];
          return prevSelected.slice();
        });
      };

      if (selectable) {
        cells.unshift({
          useCellProps() {
            return {
              key: "select-row",
              className: "RichTable_selectCheckbox",
            };
          },
          render() {
            return (
              <FormCheck
                custom
                label={""}
                type="checkbox"
                aria-label="select row"
                id={`RichTable-${id.current}-select-row-${i}`}
                checked={selected[i] || false}
                onChange={selectRow}
              />
            );
          },
        });
      }

      return {
        useRowProps() {
          return props;
        },
        data: row,
        cells,
        isSelected: selected[i],
        setSelected: (s) => {
          setSelected((prevSelected) => {
            prevSelected[i] = s;
            return prevSelected.slice();
          });
        },
      };
    });
  }, [
    columns,
    data,
    selected,
    selectable,
    clickActions,
    internalExecuteAction,
    error,
    reqInfo,
  ]);

  const bag: RichTableBag<D> = {
    error,
    header,
    rows,
    selected: filteredSelected,
    page,
    numPages,
    setPage,
    count,
    totalCount,
    searchQuery,
    setSearchQuery,
    sortColumn,
    setSortColumn,
    executeAction,
    reqInfo,
  };

  return bag;
};

/**
 * The RichTable component, on the other hand, is a ready-to-use table with pagination, sorting, and search natively
 * supported.
 */
const RichTablePagination = ({ bag }: { bag: RichTableBag<any> }) => {
  const { page, numPages, setPage, reqInfo, executeAction } = bag;
  const [newPage, setNewPage] = useState(page.toString());
  // We want to reset the page input only on a blur that is the result of an intended user action, such as clicking or
  // tabbing to lose focus. Since blur events fire when you switch windows or tabs, we implement a fake blur listener
  // that listens to clicks globally and resets the input if it's fired, and implement no true blur listener.
  const fakeBlurListener = useRef<((e: MouseEvent) => void) | null>(null);
  // we need a ref to store the page to get around the fake blur listener capturing outdated values of page
  const pageRef = useRef(page);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNewPage(page.toString());
    pageRef.current = page;
  }, [page]);

  return (
    <Col
      lg={2}
      className="RichTable_pagination ml-lg-auto justify-content-center justify-content-lg-end"
    >
      <Button
        variant="link"
        title="Go to previous page"
        disabled={page <= 1 || reqInfo.state !== RequestState.Complete}
        onClick={async () => {
          await executeAction("_previous");
        }}
      >
        <FontAwesomeIcon
          icon="chevron-left"
          className="RichTable_paginationIcon"
        />
      </Button>
      <span className="RichTable_paginationText">
        <Form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            // if for whatever reason the input has an invalid value, reset it to the current page
            const requestedPage =
              Math.max(1, Math.min(parseInt(newPage), numPages)) || page;
            setNewPage(requestedPage.toString());
            setPage(requestedPage);

            if (fakeBlurListener.current) {
              window.removeEventListener("click", fakeBlurListener.current);
              fakeBlurListener.current = null;
            }

            inputRef.current?.blur();
          }}
        >
          <Form.Control
            className="d-inline-block d-lg-inline px-0 text-center"
            title="Set page"
            value={newPage}
            ref={inputRef}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => {
              setNewPage(target.value);
            }}
            onKeyDown={({ key }: React.KeyboardEvent) => {
              if (key === "Escape" || key === "Tab") {
                setNewPage(page.toString());

                // We ignore the else case here as it's impossible to test an "internal state does not change" scenario.
                /* istanbul ignore else */
                if (fakeBlurListener.current) {
                  window.removeEventListener("click", fakeBlurListener.current);
                  fakeBlurListener.current = null;
                }

                if (key === "Escape") {
                  inputRef.current?.blur();
                }
              }
            }}
            onFocus={() => {
              inputRef.current?.select();

              // reset if blur was the result of a click outside the control
              if (!fakeBlurListener.current) {
                fakeBlurListener.current = ({ target }: MouseEvent) => {
                  if (fakeBlurListener.current && target !== inputRef.current) {
                    setNewPage(pageRef.current.toString());
                    window.removeEventListener(
                      "click",
                      fakeBlurListener.current
                    );
                    fakeBlurListener.current = null;
                  }
                };

                window.addEventListener("click", fakeBlurListener.current);
              }
            }}
            style={{
              height: "calc(2.0625rem - 1px)", // taken from bootstrap's height of a small input (1.5*.875rem + .75rem)
              width: `${numPages.toString().length + 1}ch`,
            }}
          />{" "}
          / {numPages}
        </Form>
      </span>
      <Button
        variant="link"
        title="Go to next page"
        disabled={page >= numPages || reqInfo.state !== RequestState.Complete}
        onClick={async () => {
          await executeAction("_next");
        }}
      >
        <FontAwesomeIcon
          icon="chevron-right"
          className="RichTable_paginationIcon"
        />
      </Button>
    </Col>
  );
};

const RichTableHeader = ({
  config,
  bag,
}: {
  config: RichTableProps<any>;
  bag: RichTableBag<any>;
}) => {
  const { selected, setSearchQuery, executeAction } = bag;
  const [setSearchDebounced, setSearch] = useDebouncedCallback(
    setSearchQuery,
    500
  );
  const { addToasts } = useToast();

  return (
    <Row className="RichTable_header">
      {config.searchable && (
        <Col lg={3} className="RichTable_search">
          <FormControl
            type="text"
            placeholder="Search..."
            title="Search"
            size="sm"
            className="RichTable_searchBox"
            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.currentTarget.value;
              if (value) {
                await setSearchDebounced(value);
              } else {
                setSearch("");
              }
            }}
          />
        </Col>
      )}
      {config.actions && (
        <Col lg={7} className="RichTable_actions">
          {config.actions.map((action) => (
            <Button
              key={action.name}
              variant="link"
              disabled={
                "bulk" in action &&
                (selected.length === 0 || (!action.bulk && selected.length > 1))
              }
              onClick={() => {
                executeAction(action.name).catch((e: any) => {
                  addToasts([
                    {
                      id: `action-failed-${Date.now()}`,
                      body: "Action failed to execute.",
                    },
                  ]);
                  console.error(e);
                });
              }}
            >
              {action.displayName ?? action.name}
            </Button>
          ))}
        </Col>
      )}
      {config.paginated && <RichTablePagination bag={bag} />}
    </Row>
  );
};

const RichTableFooter = ({
  config,
  bag,
}: {
  config: RichTableProps<any>;
  bag: RichTableBag<any>;
}) => {
  const { page, numPages, count, totalCount } = bag;

  return (
    <Row className="RichTable_footer">
      <Col lg={3} className="d-none d-lg-flex RichTable_summary">
        {totalCount && (page - 1) * count + 1}&ndash;
        {page < numPages ? page * count : totalCount} of {totalCount}
      </Col>
      {config.paginated && <RichTablePagination bag={bag} />}
    </Row>
  );
};

export const RichTable = <D extends object = {}>(config: RichTableProps<D>) => {
  const bag = useRichTable(config);
  const { header, rows } = bag;

  if (config.bagRef) {
    config.bagRef(bag);
  }

  return (
    <div className={`RichTable ${config.className || ""}`}>
      <RichTableHeader config={config} bag={bag} />
      <Table
        striped
        hover
        responsive
        className="RichTable_table"
        ref={config.ref}
      >
        <thead>
          <tr>
            {header.cells.map((cell) => (
              <th {...cell.useCellProps()}>{cell.render()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr {...row.useRowProps()}>
              {row.cells.map((cell) => (
                <td {...cell.useCellProps()}>{cell.render()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <RichTableFooter config={config} bag={bag} />
    </div>
  );
};
