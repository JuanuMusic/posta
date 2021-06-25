import axios from "axios";

const pohApiInstance = axios.create({
    baseURL: 'https://api-kovan.poh.dev/',
    timeout: 1000,
    //headers: {'X-Custom-Header': 'foobar'}
});

const PohAPI = {
    profiles: {
        async getByAddress(address: string): Promise<POHProfileModel | null> {
            try {

                const response = await pohApiInstance.get(`/profiles/${address}`);
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
}

export default PohAPI;