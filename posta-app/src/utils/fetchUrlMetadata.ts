import axios from "axios";

function getTitle(tags: HTMLCollectionOf<HTMLMetaElement>) {
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];

        const name = tag.getAttribute("name");
        const property = tag.getAttribute("property")
        if (name === "title" || property && ["og:title", "twitter:title"].includes(property)) {
            return tag.getAttribute("content");
        }
    }
}

export async function fetchUrlMetadata(url: string): Promise<URLMetadata | null> {

    try {
        const response = await axios.get(`/preview?url=${url}`);
        return response.data.metadata;
    }
    catch (error) {
        console.error(error.message);
        console.error(error.stack);
        return null
    };
}

export interface URLMetadata {
    title: string,
    description: string,
    image: string
}
