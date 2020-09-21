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
  combine,
} from "../api";
import {
  MOCK_RESPONSE,
  MOCK_ERROR,
  MOCK_BODY,
  MOCK_CSRF,
  MOCK_PARAMS,
  withStatus,
} from "../../shared/test-utils";

describe("axiosRequest", () => {
  it("returns a default error if server returns a string", async () => {
    const list = listFactory("bingo/");
    const resp = list();
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: "Error!!!!",
        status: 500,
      }
    );
    expect(await resp).toEqual(
      withStatus(500, {
        success: false,
        error: {
          detail: ["REQUEST.DID_NOT_SUCCEED"],
        },
      })
    );
  });
});

describe("listFactory", () => {
  afterEach(() => {
    mockAxios.reset();
  });

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
        status: 200,
      }
    );
    expect(await resp).toEqual(withStatus(200, MOCK_RESPONSE));
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
        status: 500,
      }
    );
    expect(await resp).toEqual(withStatus(500, MOCK_ERROR));
  });

  it("sends URL params", () => {
    const getFn = listFactory("bingo/");
    getFn({
      params: MOCK_PARAMS,
    });

    expect(mockAxios.lastReqGet().config.params).toEqual(MOCK_PARAMS);
  });
});

describe("getFactory", () => {
  afterEach(() => {
    mockAxios.reset();
  });

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
        status: 200,
      }
    );
    expect(await resp).toEqual(withStatus(200, MOCK_RESPONSE));
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
        status: 500,
      }
    );
    expect(await resp).toEqual(withStatus(500, MOCK_ERROR));
  });

  it("sends URL params", () => {
    const get = getFactory("bingo/");
    get({
      id: "15",
      params: MOCK_PARAMS,
    });

    expect(mockAxios.lastReqGet().config.params).toEqual(MOCK_PARAMS);
  });
});

describe("createFactory", () => {
  afterEach(() => {
    mockAxios.reset();
  });

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
        status: 200,
      }
    );
    expect(await resp).toEqual(withStatus(200, MOCK_RESPONSE));
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
        status: 500,
      }
    );
    expect(await resp).toEqual(withStatus(500, MOCK_ERROR));
  });

  it("sends URL params", () => {
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
  afterEach(() => {
    mockAxios.reset();
  });

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
        status: 200,
      }
    );
    expect(await resp).toEqual(withStatus(200, MOCK_RESPONSE));
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
        status: 500,
      }
    );
    expect(await resp).toEqual(withStatus(500, MOCK_ERROR));
  });

  it("sends URL params", () => {
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
  afterEach(() => {
    mockAxios.reset();
  });

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
        status: 200,
      }
    );
    expect(await resp).toEqual(withStatus(200, MOCK_RESPONSE));
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
        status: 500,
      }
    );
    expect(await resp).toEqual(withStatus(500, MOCK_ERROR));
  });

  it("sends URL params", () => {
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
  afterEach(() => {
    mockAxios.reset();
  });

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
        status: 200,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
        status: 200,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "POST",
        url: "bingo/",
      },
      {
        data: MOCK_RESPONSE,
        status: 200,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "PATCH",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
        status: 200,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "DELETE",
        url: "bingo/15/",
      },
      {
        data: MOCK_RESPONSE,
        status: 200,
      }
    );
    expect(await listResp).toEqual(withStatus(200, MOCK_RESPONSE));
    expect(await getResp).toEqual(withStatus(200, MOCK_RESPONSE));
    expect(await createResp).toEqual(withStatus(200, MOCK_RESPONSE));
    expect(await patchResp).toEqual(withStatus(200, MOCK_RESPONSE));
    expect(await deleteResp).toEqual(withStatus(200, MOCK_RESPONSE));
  });
});

describe("unwrap", () => {
  afterEach(() => {
    mockAxios.reset();
  });

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

describe("combine", () => {
  const test1 = listFactory("bingo/");
  const test2 = listFactory("bango/");
  const test3 = listFactory("bongo/");
  const mockResp1 = { ...MOCK_RESPONSE, data: "bingo" };
  const mockResp2 = { ...MOCK_RESPONSE, data: "bango" };
  const mockResp3 = { ...MOCK_RESPONSE, data: "bongo" };

  afterEach(() => {
    mockAxios.reset();
  });

  it("returns an array of data if all given methods succeeded", async () => {
    const resp = combine(test1(), test2(), test3());

    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: mockResp1,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bango/",
      },
      {
        data: mockResp2,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bongo/",
      },
      {
        data: mockResp3,
      }
    );

    expect(await resp).toEqual(
      withStatus(200, {
        success: true,
        data: [mockResp1, mockResp2, mockResp3].map((r) => r.data),
      })
    );
  });

  it("produces the error returned by the first failing method", async () => {
    const resp = combine(test1(), test2(), test3());

    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: mockResp1,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bango/",
      },
      {
        status: 500,
        data: MOCK_ERROR,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bongo/",
      },
      {
        data: mockResp3,
      }
    );

    expect(await resp).toEqual(withStatus(500, MOCK_ERROR));
  });
});
