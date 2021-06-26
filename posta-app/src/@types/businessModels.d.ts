interface IPostaNFT {
    authorImage: string | undefined;
    authorDisplayName: string;
    authorFullName: string;
    author: string;
    content: string;
    tokenId: string;
    tokenURI: string;
    creationDate: Date;
    supportGiven: BigNumber;
    supportCount: BigNumber;
}

interface IPostData {
    author: string;
    text: string;
}
