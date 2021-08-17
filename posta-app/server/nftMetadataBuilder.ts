import { POHProfileModel } from "./posta-lib/services/PohAPI";
import { IPostaNFT } from "./posta-lib/services/PostaService";

export async function buildMetadata(post: IPostaNFT, human: POHProfileModel | null) {

    const attributes: any[] = [{
        trait_type: "Supporters",
        value: post.supportCount.toNumber()
    },
    {
        trait_type: "Content",
        value: post.content
    },{
        trait_type: "Author",
        value: post.author,
    },{
        display_type: "date",
        trait_type: "Post date",
        value: post.blockTime.getTime()/1000,
    }];

    if (post.replyOfTokenId && post.replyOfTokenId.gt(0)) {
        attributes.push({
            trait_type: "In reply of",
            value: `$POSTA:${post.replyOfTokenId}`
        })
    }


    const retVal = {
        blockTime: post.blockTime,
        description: "A unique Posta by a real human being ",
        name: `$POSTA:${post.tokenId} by ${(human && (human.display_name || human.eth_address)) || "[Human not found on PoH]" }`,
        external_url: `${process.env.POSTA_WEB_URL}/posta/${post.tokenId}`,
        image: `${process.env.POSTA_WEB_URL}/post/${post.tokenId}/image`,
        attributes: attributes
    }   

    return retVal;
}