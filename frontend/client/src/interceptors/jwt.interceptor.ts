import axios from "axios";
import { BASE_URL_API } from "../configs/server.config";

const jwtInterceptor = axios.create({
    baseURL: BASE_URL_API,
    withCredentials: true,
});

jwtInterceptor.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response.status === 401) {
            await axios
                .get("http://localhost:4000/api/v1/auth/refresh_token", {
                    withCredentials: true,
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
            return axios(error.config);
        } else {
            return Promise.reject(error);
        }
    }
);

export default jwtInterceptor;
