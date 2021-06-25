import ipfsHttpClient from 'ipfs-http-client';
import fs from "fs";

/**
 * Interface to implement storage system of Posts.
 */
interface IStorageService {
    /**
     * Uploads the post json to IPFS and returns a string with the path
     * @param data Generates a post
     * 
     * @returns Path to the uploaded file.
     */
    uploadPost(data: IPostData): Promise<string>;
}

/**
 * An implementation of IStorageService for the IPFS protocol.
 */
const IPFSStorageService : IStorageService = {
    

    /**
     * Uploads the post json to IPFS and returns a string with the path
     * @param data Generates a post
     * 
     * @returns Path to the uploaded file.
     */
    async uploadPost(data: IPostData): Promise<string> {

        const ipfsClient = ipfsHttpClient.create({ url: "/ip4/127.0.0.1/tcp/5001" });

        const postBytes = new TextEncoder().encode(JSON.stringify(data));
        const file = await ipfsClient.add(postBytes);
        return file.path;
    }
}

export default IPFSStorageService;