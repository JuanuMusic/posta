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
    // Get the logs for this specific post
    const log = await PostaService.getPostLogs(
      [parseInt(tokenId, 10)],
      contractProvider
    );

    // If any logs, set the state
    if (log && log.length > 0) {
      const post = await PostaService.buildPost(log[0], contractProvider);
      console.log("POST", post);
      setPost(post);
      setIsInitialized(true);
    }
    setIsLoading(false);
  }

  // Initialize page when library is available
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
