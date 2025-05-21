import client from "./index";
export function listPreferences(userId) {
  return client.get(`/user/${userId}/preferences`);
}
export function updatePreferences(prefId, data) {
  return client.put(`/user/preferences/${prefId}`, data);
}