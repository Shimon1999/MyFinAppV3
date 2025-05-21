import client from "./index";
export function getCurrentUser() {
  return client.get("/user/me");
}