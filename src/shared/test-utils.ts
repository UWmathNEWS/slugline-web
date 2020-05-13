export const CSRF_COOKIE = "csrftoken";
export const USER_LOCALSTORAGE_KEY = "slugline-user";

export const testUser = {
  username: "test",
  first_name: "test",
  last_name: "tester",
  email: "test@example.com",
  is_staff: false,
  is_editor: false,
  writer_name: "testy mctestface"
};

export const testAdmin = {
  username: "tset",
  first_name: "tset",
  last_name: "retsest",
  email: "admin@example.com",
  is_staff: true,
  is_editor: true,
  writer_name: "ytsest ecaftsetcm"
};

export const makeTestError = (code: number, error: any) => ({
  code,
  response: {
    data: {
      success: false,
      error
    }
  }
});
