import "core-js";
import mockAxios from "jest-mock-axios";
import {
  getFactory,
  listFactory,
  createFactory,
  patchFactory,
  deleteFactory,
  endpointFactory,
  unwrap,
} from "../api";
import {
  MOCK_RESPONSE,
  MOCK_ERROR,
  MOCK_BODY,
  MOCK_CSRF,
  MOCK_PARAMS,
} from "../../shared/test-utils";

describe("listFactory", () => {
  it("handles successful list requests", async () => {
    const list = listFactory("bingo/");
    const resp = list();
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    expect(await resp).toEqual(MOCK_RESPONSE);
  });

  it("handles unsuccessful list requests", async () => {
    const list = listFactory("bingo/");
    const resp = list();
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: MOCK_ERROR,
      }
    );
    expect(await resp).toEqual(MOCK_ERROR);
  });
  it("sends URL params", async () => {
    const getFn = listFactory("bingo/");
    getFn({
      params: MOCK_PARAMS,
    });

    expect(mockAxios.lastReqGet().config.params).toEqual(MOCK_PARAMS);
  });
});

describe("getFactory", () => {
  it("handles successful GET requests", async () => {
    const get = getFactory("bingo/");
    const resp = get({ id: "15" });
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    expect(await resp).toEqual(MOCK_RESPONSE);
  });

  it("handles unsuccessful GET requests", async () => {
    const get = getFactory("bingo/");
    const resp = get({ id: "15" });
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/15/",
      },
      {
        data: MOCK_ERROR,
      }
    );
    expect(await resp).toEqual(MOCK_ERROR);
  });
  it("sends URL params", async () => {
    const get = getFactory("bingo/");
    get({
      id: "15",
      params: MOCK_PARAMS,
    });

    expect(mockAxios.lastReqGet().config.params).toEqual(MOCK_PARAMS);
  });
});

describe("createFactory", () => {
  it("handles successful POST requests", async () => {
    const create = createFactory<typeof MOCK_BODY>("bingo/");
    const resp = create({ body: MOCK_BODY, csrf: MOCK_CSRF });
    expect(mockAxios.lastReqGet().config.data).toEqual(MOCK_BODY);
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      MOCK_CSRF
    );
    mockAxios.mockResponseFor(
      {
        method: "POST",
        url: "bingo/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    expect(await resp).toEqual(MOCK_RESPONSE);
  });

  it("handles unsuccessful POST requests", async () => {
    const create = createFactory<typeof MOCK_BODY>("bingo/");
    const resp = create({ body: MOCK_BODY, csrf: MOCK_CSRF });
    expect(mockAxios.lastReqGet().config.data).toEqual(MOCK_BODY);
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      MOCK_CSRF
    );
    mockAxios.mockResponseFor(
      {
        method: "POST",
        url: "bingo/",
      },
      {
        data: MOCK_ERROR,
      }
    );
    expect(await resp).toEqual(MOCK_ERROR);
  });
  it("sends URL params", async () => {
    const createFn = createFactory("bingo/");
    createFn({
      body: MOCK_BODY,
      csrf: MOCK_CSRF,
      params: MOCK_PARAMS,
    });

    expect(mockAxios.lastReqGet().config.params).toEqual(MOCK_PARAMS);
  });
});

describe("patchFactory", () => {
  it("handles successful PATCH requests", async () => {
    const patch = patchFactory<typeof MOCK_BODY>("bingo/");
    const resp = patch({ id: "15", body: MOCK_BODY, csrf: MOCK_CSRF });
    expect(mockAxios.lastReqGet().config.data).toEqual(MOCK_BODY);
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      MOCK_CSRF
    );
    mockAxios.mockResponseFor(
      {
        method: "PATCH",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    expect(await resp).toEqual(MOCK_RESPONSE);
  });

  it("handles unsuccessful PATCH requests", async () => {
    const patch = patchFactory<typeof MOCK_BODY>("bingo/");
    const resp = patch({ id: "15", body: MOCK_BODY, csrf: MOCK_CSRF });
    expect(mockAxios.lastReqGet().config.data).toEqual(MOCK_BODY);
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      MOCK_CSRF
    );
    mockAxios.mockResponseFor(
      {
        method: "PATCH",
        url: "bingo/15/",
      },
      {
        data: MOCK_ERROR,
      }
    );
    expect(await resp).toEqual(MOCK_ERROR);
  });
  it("sends URL params", async () => {
    const patchFn = patchFactory("bingo/");
    patchFn({
      id: "15",
      body: MOCK_BODY,
      csrf: MOCK_CSRF,
      params: MOCK_PARAMS,
    });

    expect(mockAxios.lastReqGet().config.params).toEqual(MOCK_PARAMS);
  });
});

describe("deleteFactory", () => {
  it("handles successful DELETE requests", async () => {
    const deleteFn = deleteFactory("bingo/");
    const resp = deleteFn({ id: "15", csrf: MOCK_CSRF });
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      MOCK_CSRF
    );
    mockAxios.mockResponseFor(
      {
        method: "DELETE",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    expect(await resp).toEqual(MOCK_RESPONSE);
  });
  it("handles unsuccessful DELETE requests", async () => {
    const deleteFn = deleteFactory("bingo/");
    const resp = deleteFn({ id: "15", csrf: MOCK_CSRF });
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      MOCK_CSRF
    );
    mockAxios.mockResponseFor(
      {
        method: "DELETE",
        url: "bingo/15/",
      },
      {
        data: MOCK_ERROR,
      }
    );
    expect(await resp).toEqual(MOCK_ERROR);
  });
  it("sends URL params", async () => {
    const deleteFn = deleteFactory("bingo/");
    deleteFn({
      id: "15",
      csrf: MOCK_CSRF,
      params: MOCK_PARAMS,
    });

    expect(mockAxios.lastReqGet().config.params).toEqual(MOCK_PARAMS);
  });
});

describe("endpointFactory", () => {
  it("generates all HTTP methods", async () => {
    const endpoint = endpointFactory("bingo/");
    const listResp = endpoint.list();
    const getResp = endpoint.get({ id: "15" });
    const createResp = endpoint.create({ body: MOCK_BODY, csrf: MOCK_CSRF });
    const patchResp = endpoint.patch({
      id: "15",
      body: MOCK_BODY,
      csrf: MOCK_CSRF,
    });
    const deleteResp = endpoint.delete({ id: "15", csrf: MOCK_CSRF });
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "POST",
        url: "bingo/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "PATCH",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "DELETE",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );
    expect(await listResp).toEqual(MOCK_RESPONSE);
    expect(await getResp).toEqual(MOCK_RESPONSE);
    expect(await createResp).toEqual(MOCK_RESPONSE);
    expect(await patchResp).toEqual(MOCK_RESPONSE);
    expect(await deleteResp).toEqual(MOCK_RESPONSE);
  });
});

describe("unwrap", () => {
  it("returns the data", async () => {
    const list = listFactory("bingo/");
    const resp = list();
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: MOCK_RESPONSE,
      }
    );

    expect(await unwrap(resp)).toEqual(MOCK_RESPONSE.data);
  });

  it("throws the error", async () => {
    const list = listFactory("bingo/");
    const resp = list();
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: MOCK_ERROR,
      }
    );

    try {
      const result = await unwrap(resp);
      expect("unwrap does not throw error").toBe(false);
    } catch (err) {
      expect(err).toEqual(MOCK_ERROR.error);
    }
  });
});
