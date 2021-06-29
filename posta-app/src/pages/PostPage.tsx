import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { PostaService } from "posta-lib/build";
import { IPostaNFT } from "posta-lib/build/services/PostaService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostDisplay from "src/components/PostDisplay";
import useContractProvider from "src/hooks/useContractProvider";
import useHuman from "src/hooks/useHuman";

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
