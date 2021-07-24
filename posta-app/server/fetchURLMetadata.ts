import axios from "axios";
import { parse, HTMLElement } from "node-html-parser"


export interface URLMetadata {
    title: string,
    description: string,
    image: string
}

function getValueFromTags(tags: HTMLElement[], type: "title" | "description" | "image") {
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];

        const name = tag.getAttribute("name");
        const property = tag.getAttribute("property")
        if (name === type || property && [`og:${type}`, `twitter:${type}`].includes(property)) {
            return tag.getAttribute("content");
        }
    }

    return null;
}

export async function fetchURLMetadata(url: string): Promise<URLMetadata> {
    const response = await axios.get(url);
    const root = parse(response.data);
    const metas = root.querySelectorAll("meta");

    const title = getValueFromTags(metas, "title");
    const description = getValueFromTags(metas, "description");
    const image =getValueFromTags(metas, "image");
    return {
        title: title || "", description: description || "", image: image || ""
    }
}

export interface URLMetadata {
    title: string,
    description: string,
    image: string
}
