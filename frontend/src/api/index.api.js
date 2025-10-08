import { Tune } from "@mui/icons-material";
import axios from "axios";

// const baseURL = "http://127.0.0.1:5000/api/";
const baseURL = "https://api.universalhealth.ai/api";

const isDev = true;

export const resultsUiUrl = isDev
  ? "https://reportsuidev.z23.web.core.windows.net"
  : "https://reportsui.z23.web.core.windows.net";

const API = axios.create({
  baseURL: baseURL,
});

export default API;
