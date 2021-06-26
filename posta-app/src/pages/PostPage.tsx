import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import PostaService from "../services/PostaService";

interface IPostPageProps {
    author: string,
    tokenId: number
}

export default function PostPage(props: any) {
    const [post, setPost] = useState();
    const context = useWeb3React<ethers.providers.Web3Provider>();
    const { tokenId } = useParams<{tokenId: string}>();

    useEffect(() => {
        async function init() {
            const events = await PostaService.findPost(BigNumber.from(tokenId), new ethers.providers.Web3Provider(context.library?.provider!));
            
        }

        if(context.library) init();
    },[context.library]);

    return(<>Post: {post}</>);
}