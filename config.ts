export interface Config {
    APIBaseURL: string;
    GoogleClientId: string;
}

export const config: Config = {
    APIBaseURL: "https://abhi9.in/api",
    // APIBaseURL: "http://127.0.0.1:3100",
    GoogleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
}
