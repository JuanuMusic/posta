import { BigNumber } from "@ethersproject/contracts/node_modules/@ethersproject/bignumber";
import { PohService, PostaService } from "./posta-lib";
import { IContractProvider } from "./posta-lib/services/ContractProvider";

export async function getMetadata(tokenId: BigNumber, contractProvider: IContractProvider) {
    // Get the logs for the token
    const logs = await PostaService.getPostLogs(null, [tokenId], contractProvider);
    if (!logs || logs.length === 0) return null;
    const log = logs[0];
    const post = await PostaService.buildPost(log, contractProvider);
    const human = await PohService.getHuman(log.author, contractProvider);

    const attributes: any[] = [{
        trait_type: "Supporters",
        value: post.supportCount.toNumber()
    },
    {
        trait_type: "Content",
        value: post.content
    },{
        trait_type: "Author",
        value: log.author,
    },{
        display_type: "date",
        trait_type: "Post date",
        value: log.blockTime.getTime()/1000,
    }];

    if (log.replyOfTokenId && log.replyOfTokenId.gt(0)) {
        attributes.push({
            trait_type: "In reply of",
            value: `$POSTA:${post.replyOfTokenId}`
        })
    }


    const retVal = {
        blockTime: log.blockTime,
        description: "A unique Posta by a real human being ",
        name: `$POSTA:${tokenId} by ${human && (human.display_name || human.eth_address)}`,
        external_url: `${process.env.POSTA_WEB_URL}/posta/${tokenId}`,
        attributes: attributes
    }   

    return retVal;
}