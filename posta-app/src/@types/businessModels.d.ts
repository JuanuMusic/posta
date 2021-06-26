interface IPostaNFT {
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
