import "core-js";
import mockAxios from "jest-mock-axios";
import {
  getFactory,
  listFactory,
  postFactory,
  patchFactory,
  deleteFactory,
  endpointFactory,
} from "../api";
import {
  APIResponseSuccess,
  APIResponseFailure,
  APIError,
} from "../../shared/types";
import {
  MOCK_RESPONSE,
  MOCK_ERROR,
  MOCK_BODY,
  MOCK_CSRF,
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
});

describe("postFactory", () => {
  it("handles successful POST requests", async () => {
    const post = postFactory<typeof MOCK_BODY>("bingo/");
    const resp = post({ body: MOCK_BODY, csrf: MOCK_CSRF });
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
    const post = postFactory<typeof MOCK_BODY>("bingo/");
    const resp = post({ body: MOCK_BODY, csrf: MOCK_CSRF });
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
});

describe("endpointFactory", () => {
  it("generates all HTTP methods", async () => {
    const endpoint = endpointFactory("bingo/");
    const listResp = endpoint.list();
    const getResp = endpoint.get({ id: "15" });
    const postResp = endpoint.post({ body: MOCK_BODY, csrf: MOCK_CSRF });
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
    expect(await postResp).toEqual(MOCK_RESPONSE);
    expect(await patchResp).toEqual(MOCK_RESPONSE);
    expect(await deleteResp).toEqual(MOCK_RESPONSE);
  });
});
