import { config } from "../../config";
import axios from "axios";

const ENDPOINT = "/users/authenticate";

export const verifyUser = async (req) => {
    const apiURL = `${config.APIBaseURL}${ENDPOINT}`;
    try {
        const response = await axios.post(apiURL, req);
        if (response.status !== 200) {
            throw new Error(response.statusText);
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const msg = error.response.data?.detail || error.response.data?.message || error.message || "Login failed";
            throw new Error(msg);
        }
        throw new Error("Login failed");
    }
};