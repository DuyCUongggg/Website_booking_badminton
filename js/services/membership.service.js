import { DEMO_MODE } from "../core/config.js";
import { DEMO_MEMBERSHIPS } from "../core/demo-static.js";
import { apiCall } from "../core/http.js";

export const membershipApi = {
  getAll() {
    if (DEMO_MODE) {
      return Promise.resolve({ success: true, data: DEMO_MEMBERSHIPS, message: null });
    }
    return apiCall("/memberships");
  }
};
