import axios, { AxiosInstance } from "axios";



export interface POHProfileModel {
    eth_address?: string,
    status?: string,
    display_name: string,
    first_name: string,
    last_name: string,
    registered?: boolean,
    photo?: string,
    video?: string,
    bio?: string,
    profile?: string,
    registered_time?: Date,
    creation_time?: Date
}

class PohAPI {

    private _baseUrl: string;
    private _pohApiInstance: AxiosInstance;
    constructor(baseUrl: string) {
        this._baseUrl = baseUrl;
        this._pohApiInstance = axios.create({
            baseURL: this._baseUrl,
            timeout: 1000,
            //headers: {'X-Custom-Header': 'foobar'}
        });
    }

    async getProfileByAddress(address: string): Promise<POHProfileModel | null> {
        try {

            const response = await this._pohApiInstance.get(`/profiles/${address}`);
            return response.data;
        } catch (ex) {

            if (axios.isAxiosError(ex)) {
                if (ex.response?.status === 404) {
                    console.warn("human not found or not registered");
                }
            }
            else {
                console.error("Unhandled error", ex.message);
                console.error(ex.stack);
            }
            return null;
        }
    }
}

export { PohAPI };