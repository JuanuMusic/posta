import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostDisplay from "../components/PostDisplay";
import useContractProvider from "../hooks/useContractProvider";
import useHuman from "../hooks/useHuman";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";

interface IPostPageProps {
  author: string;
  tokenId: number;
}

export default function PostPage(props: any) {
  const [post, setPost] = useState<IPostaNFT>();
  const context = useWeb3React<ethers.providers.Web3Provider>();
  const { tokenId } = useParams<{ tokenId: string }>();
  const contractProvider = useContractProvider();
  const human = useHuman();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  async function init() {
    if (!contractProvider || isInitialized) return;
    setIsLoading(true);
    const post = await PostaService.buildPost(tokenId, contractProvider);
    console.log("POST", post);
    setPost(post);
    setIsLoading(false);
    setIsInitialized(true);
  }


  useEffect(() => {
    if (context.library) init();
  }, [context]);

  const handleBurnUBIsClicked = () => console.log("TODO");

  return (
    <>
      {isLoading ? (
        "Loading..."
      ) : (
        <PostDisplay
          postaNFT={post!}
          human={human}
          onBurnUBIsClicked={handleBurnUBIsClicked}
        />
      )}
    </>
  );
}
