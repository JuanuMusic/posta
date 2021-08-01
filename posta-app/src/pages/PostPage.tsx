import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostDisplay from "../components/PostDisplay/PostDisplay";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import {
  IPostaNFT,
  PostaService,
  PostLogs,
} from "../posta-lib/services/PostaService";

export default function PostPage(props: any) {
  const [post, setPost] = useState<IPostaNFT>();
  const [postReplies, setPostReplies] = useState<PostLogs[] | null>(null);
  const { tokenId } = useParams<{ tokenId: string }>();
  const contractProvider = useContractProvider();
  const [isLoading, setIsLoading] = useState(false);

  async function init() {
    if (!contractProvider) return;
    setIsLoading(true);

    if (tokenId === "test") {
      setPost({
        author: "test human",
        content:
          "A test post with an image https://ipfs.kleros.io/ipfs/QmY9L11JwZoHazuvBJU9z6YnaNSfXNtNZVJp4gwhfYEQPd/20210506-180407.jpg",
        authorImage:
          "https://ipfs.kleros.io/ipfs/QmY9L11JwZoHazuvBJU9z6YnaNSfXNtNZVJp4gwhfYEQPd/20210506-180407.jpg",
        authorDisplayName: "Juanu",
        authorFullName: "",
        blockTime: new Date(),
        supportCount: BigNumber.from(1),
        supportGiven: BigNumber.from(10),
        tokenId: BigNumber.from(1),
        tokenURI: "test",
      });
    } else {
      // Get the post with the specific token id
      const post = await PostaService.getPosts(
        null,
        [BigNumber.from(tokenId)],
        contractProvider
      );
      if (post && post.length > 0) {
        setPost(post[0]);
      }
    }

    setIsLoading(false);
  }

  // Initialize page when library is available
  useEffect(() => {
    init();
  }, [contractProvider]);

  // Load post replies when tokenId is set
  useEffect(() => {
    if (!tokenId) return;

    loadPostReplies();
  }, [tokenId, contractProvider]);

  const handleBurnUBIsClicked = () => console.log("TODO");

  const loadPostReplies = async () => {
    if (!contractProvider) return;
    if(tokenId === "test") return;

    //  Get replies logs
    const postRepliesLogs = await PostaService.getPostRepliesLogs(
      BigNumber.from(tokenId),
      contractProvider
    );

    if (postRepliesLogs && postRepliesLogs.length > 0)
      setPostReplies(postRepliesLogs);
    else setPostReplies(null);
  };

  return (
    <>
      {isLoading
        ? "Loading..."
        : (post && (
            <>
              <div className="mb-4">
                <PostDisplay postOrId={post} />
              </div>
              {postReplies &&
                postReplies.map((replyLog) => {
                  return (
                    <div className="px-5 py-1">
                      <PostDisplay
                        postOrId={replyLog.tokenId}
                        hideSourcePost={true}
                      />
                    </div>
                  );
                })}
            </>
          )) ||
          "Not found"}
    </>
  );
}
