import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostDisplay from "../components/PostDisplay";
import useContractProvider from "../hooks/useContractProvider";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";

interface IPostPageProps {
  author: string;
  tokenId: number;
}

export default function PostPage(props: any) {
  const [post, setPost] = useState<IPostaNFT>();
  const { tokenId } = useParams<{ tokenId: string }>();
  const contractProvider = useContractProvider();
  const [isLoading, setIsLoading] = useState(false);

  async function init() {
    if (!contractProvider) return;
    setIsLoading(true);
    // Get the logs for this specific post
    const log = await PostaService.getPostLogs(
      [parseInt(tokenId, 10)],
      contractProvider
    );

    console.log("LOG", log);

    // If any logs, set the state
    if (log && log.length > 0) {
      const post = await PostaService.buildPost(log[0], contractProvider);
      console.log("POST", post);
      setPost(post);
    }
    setIsLoading(false);
  }

  // Initialize page when library is available
  useEffect(() => {
    init();
  }, [contractProvider]);

  const handleBurnUBIsClicked = () => console.log("TODO");

  return (
    <>
      {isLoading
        ? "Loading..."
        : (post && (
            <PostDisplay
              postaNFT={post}
              onBurnUBIsClicked={handleBurnUBIsClicked}
            />
          )) ||
          "Not found"}
    </>
  );
}
