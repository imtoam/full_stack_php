import axios from "axios";

export default axios.create({
  baseURL: "http://todo.api/api",
  headers: {
    "Content-type": "application/json"
  }
});