export interface POHProfileModel {
    eth_address?: string;
    status?: string;
    display_name: string;
    first_name: string;
    last_name: string;
    registered?: boolean;
    photo?: string;
    video?: string;
    bio?: string;
    profile?: string;
    registered_time?: Date;
    creation_time?: Date;
}
declare const PohAPI: {
    profiles: {
        getByAddress(address: string): Promise<POHProfileModel | null>;
    };
};
export { PohAPI };
