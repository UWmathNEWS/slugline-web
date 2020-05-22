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
  APIResponse,
  APIResponseSuccess,
  APIResponseFailure,
  APIError,
} from "../../shared/types";

const mockBody = {
  data: "bingo bango bongo",
};

const mockCsrf = "bingobangobongo";

const mockResponse: APIResponseSuccess<string> = {
  success: true,
  data: "bingo bango bongo",
};

const mockError: APIResponseFailure<APIError> = {
  success: false,
  error: {
    detail: ["bingo bango bongo"],
    status_code: 500,
  },
};

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
        data: mockResponse,
      }
    );
    expect(await resp).toEqual(mockResponse);
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
        data: mockError,
      }
    );
    expect(await resp).toEqual(mockError);
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
        data: mockResponse,
      }
    );
    expect(await resp).toEqual(mockResponse);
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
        data: mockError,
      }
    );
    expect(await resp).toEqual(mockError);
  });
});

describe("postFactory", () => {
  it("handles successful POST requests", async () => {
    const post = postFactory<typeof mockBody>("bingo/");
    const resp = post({ body: mockBody, csrf: mockCsrf });
    expect(mockAxios.lastReqGet().config.data).toEqual(mockBody);
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      mockCsrf
    );
    mockAxios.mockResponseFor(
      {
        method: "POST",
        url: "bingo/",
      },
      {
        data: mockResponse,
      }
    );
    expect(await resp).toEqual(mockResponse);
  });

  it("handles unsuccessful POST requests", async () => {
    const post = postFactory<typeof mockBody>("bingo/");
    const resp = post({ body: mockBody, csrf: mockCsrf });
    expect(mockAxios.lastReqGet().config.data).toEqual(mockBody);
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      mockCsrf
    );
    mockAxios.mockResponseFor(
      {
        method: "POST",
        url: "bingo/",
      },
      {
        data: mockError,
      }
    );
    expect(await resp).toEqual(mockError);
  });
});

describe("patchFactory", () => {
  it("handles successful PATCH requests", async () => {
    const patch = patchFactory<typeof mockBody>("bingo/");
    const resp = patch({ id: "15", body: mockBody, csrf: mockCsrf });
    expect(mockAxios.lastReqGet().config.data).toEqual(mockBody);
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      mockCsrf
    );
    mockAxios.mockResponseFor(
      {
        method: "PATCH",
        url: "bingo/15/",
      },
      {
        data: mockResponse,
      }
    );
    expect(await resp).toEqual(mockResponse);
  });

  it("handles unsuccessful PATCH requests", async () => {
    const patch = patchFactory<typeof mockBody>("bingo/");
    const resp = patch({ id: "15", body: mockBody, csrf: mockCsrf });
    expect(mockAxios.lastReqGet().config.data).toEqual(mockBody);
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      mockCsrf
    );
    mockAxios.mockResponseFor(
      {
        method: "PATCH",
        url: "bingo/15/",
      },
      {
        data: mockError,
      }
    );
    expect(await resp).toEqual(mockError);
  });
});

describe("deleteFactory", () => {
  it("handles successful DELETE requests", async () => {
    const deleteFn = deleteFactory("bingo/");
    const resp = deleteFn({ id: "15", csrf: mockCsrf });
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      mockCsrf
    );
    mockAxios.mockResponseFor(
      {
        method: "DELETE",
        url: "bingo/15/",
      },
      {
        data: mockResponse,
      }
    );
    expect(await resp).toEqual(mockResponse);
  });
  it("handles unsuccessful DELETE requests", async () => {
    const deleteFn = deleteFactory("bingo/");
    const resp = deleteFn({ id: "15", csrf: mockCsrf });
    expect(mockAxios.lastReqGet().config.headers["X-CSRFToken"]).toEqual(
      mockCsrf
    );
    mockAxios.mockResponseFor(
      {
        method: "DELETE",
        url: "bingo/15/",
      },
      {
        data: mockError,
      }
    );
    expect(await resp).toEqual(mockError);
  });
});

describe("endpointFactory", () => {
  it("generates all HTTP methods", async () => {
    const endpoint = endpointFactory("bingo/");
    const listResp = endpoint.list();
    const getResp = endpoint.get({ id: "15" });
    const postResp = endpoint.post({ body: mockBody, csrf: mockCsrf });
    const patchResp = endpoint.patch({
      id: "15",
      body: mockBody,
      csrf: mockCsrf,
    });
    const deleteResp = endpoint.delete({ id: "15", csrf: mockCsrf });
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/",
      },
      {
        data: mockResponse,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "GET",
        url: "bingo/15/",
      },
      {
        data: mockResponse,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "POST",
        url: "bingo/",
      },
      {
        data: mockResponse,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "PATCH",
        url: "bingo/15/",
      },
      {
        data: mockResponse,
      }
    );
    mockAxios.mockResponseFor(
      {
        method: "DELETE",
        url: "bingo/15/",
      },
      {
        data: mockResponse,
      }
    );
    expect(await listResp).toEqual(mockResponse);
    expect(await getResp).toEqual(mockResponse);
    expect(await postResp).toEqual(mockResponse);
    expect(await patchResp).toEqual(mockResponse);
    expect(await deleteResp).toEqual(mockResponse);
  });
});
