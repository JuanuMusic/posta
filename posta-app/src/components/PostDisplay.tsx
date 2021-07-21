// No me la
import Container from "react-bootstrap/Container";

import {
  Button,
  Card,
  Col,
  Row,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import moment from "moment";

import { FaFire, FaReply, FaUsers } from "react-icons/fa";
import { BigNumber, ethers } from "ethers";
import { ReactComponent as POHLogo } from "../assets/poh.svg";
import { ReactComponent as BurningHeart } from "../assets/burning_heart.svg";
import {
  IPostaNFT,
  PostaService,
  PostLogs,
} from "../posta-lib/services/PostaService";
import { useHuman } from "../contextProviders/HumanProvider";
import { useEffect, useState } from "react";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import { POINT_CONVERSION_COMPRESSED } from "constants";
import PostReply from "./PostReply";
import truncateTextMiddle from "../utils/textHelpers";
import SupportPostDialog from "./SupportPostDialog";
import Skeleton from "react-loading-skeleton";

interface IPostDisplayProps extends IBasePostaProps {
  postOrId: BigNumber | IPostaNFT;
  //onReplyClicked?(tokenId: string): any;
  condensed?: boolean;
  hideSourcePost?: boolean;
  borderless?: boolean;
}

interface IGiveSupportButtonProps {
  onClick(e: any): void;
  supportGiven: string;
  className?: string;
  disabled?: boolean;
}

export default function PostDisplay(props: IPostDisplayProps) {
  const [postData, setPostData] = useState<IPostaNFT | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [repliesLogs, setRepliesLogs] = useState<PostLogs[] | null>(null);
  const [showSupportPostDialog, setShowSupportPostDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const human = useHuman();
  const contractProvider = useContractProvider();

  const handleReplyClicked = async () => {
    setShowReply(true);
  };

  const refreshRepliesCount = async () => {
    if (!contractProvider || !postData) return;
    try {
      const postLogs = await PostaService.getPostRepliesLogs(
        postData.tokenId,
        contractProvider
      );
      setRepliesLogs(postLogs);
    } catch (error) {
      console.error("ERROR LOADING POST REPLIES", error);
    }
  };

  // Load post effect
  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      // If it's not string, assume it's a PostaNFT interface
      if ((props.postOrId as IPostaNFT).content) {
        setPostData(props.postOrId as IPostaNFT);
      }
      // If contract provider is set
      else if (contractProvider) {
        // Get logs for the token
        const postLogs = await PostaService.getPostLogs(
          [props.postOrId as BigNumber],
          contractProvider
        );

        if (postLogs && postLogs.length > 0) {
          const data = await PostaService.buildPost(
            postLogs[0],
            contractProvider
          );
          setPostData(data);
        }
      }
      setIsLoading(false);
    }

    loadPost();
  }, [props.postOrId, contractProvider]);

  // Refresh replies count
  useEffect(() => {
    if (postData) {
      refreshRepliesCount();
    }
  }, [postData]);

  return (
    <>
      {postData && postData.tokenId && (
        <SupportPostDialog
          show={showSupportPostDialog}
          postTokenId={postData?.tokenId}
          onClose={() => setShowSupportPostDialog(false)}
        />
      )}
      {postData && (
        <PostReply
          show={showReply}
          postReply={postData}
          onClose={() => setShowReply(false)}
        />
      )}
      <Card
        style={{ width: "100%", maxWidth: "700px" }}
        className={"mx-auto p-0 " + (props.borderless && "border-0")}
      >
        <Card.Body className="p-0">
          <Container className="p-1">
            <Row>
              <Col className="d-flex">
                {/* Profile Picture */}
                <ProfilePicture
                  size={props.condensed ? AvatarSize.Small : AvatarSize.Regular}
                  imageUrl={postData && postData.authorImage}
                />

                <div className="flex-fill">
                  <div className="d-flex justify-content-between mb-0">
                    <div className="d-flex justify-content-start align-items-center">
                      {/* Human Name */}
                      <a
                        href={`${
                          process.env.REACT_APP_HUMAN_PROFILE_BASE_URL
                        }/${postData && postData.author.toLowerCase()}`}
                        className="text-dark"
                      >
                        {isLoading ? (
                          <Skeleton className="w-25" />
                        ) : (
                          <h6 className="m-0">
                            {postData &&
                              (postData.authorDisplayName ||
                                truncateTextMiddle(4, postData.author, 4))}
                          </h6>
                        )}
                      </a>{" "}
                      <small className="text-muted ml-2">
                        {" - "}
                        {postData &&
                          moment(postData.blockTime || new Date(0)).format(
                            "MMMM Do YYYY, h:mm"
                          )}
                      </small>
                    </div>
                    {/* NFT ID */}
                    <h6 className={`text-muted`}>
                      <a
                        className="text-muted"
                        target="_blank"
                        href={(postData && postData.tokenURI) || "#"}
                      >
                        {props.condensed ? (
                          <small>
                            $POSTA:{postData && postData.tokenId.toString()}
                          </small>
                        ) : (
                          <>$POSTA:{postData && postData.tokenId.toString()}</>
                        )}
                      </a>
                    </h6>{" "}
                  </div>
                  <blockquote className="blockquote my-0 ml-0">
                    {/* Post Text */}
                    <p className="post-text text-dark mb-1">
                      {isLoading ? (
                        <Skeleton count={2} />
                      ) : (
                        <>{(postData && postData.content) || "..."}</>
                      )}
                    </p>
                  </blockquote>
                  {postData?.replyOfTokenId &&
                    postData.replyOfTokenId.gt(0) &&
                    !props.hideSourcePost && (
                      <div className="mt-2">
                        {
                          <PostDisplay
                            hideSourcePost={true}
                            condensed
                            postOrId={postData?.replyOfTokenId}
                          />
                        }
                      </div>
                    )}
                </div>
              </Col>
            </Row>
            <Row className={(props.condensed && "d-none") || ""}>
              <Col>
                <hr className="my-2" />
              </Col>
            </Row>
            <Row className={(props.condensed && "d-none") || ""}>
              <Col className="d-flex justify-content-between align-items-start mt-2 mb-1">
                <div className="d-flex alignt-items-start">
                  <GiveSupportButton
                    className="align-self-center"
                    disabled={
                      !human.profile.registered ||
                      !postData ||
                      postData.author.toLowerCase() ===
                        human.profile.eth_address?.toLowerCase()
                    }
                    onClick={() => setShowSupportPostDialog(true)}
                    supportGiven={
                      (postData &&
                        postData.supportGiven &&
                        ethers.utils.formatEther(postData.supportGiven)) ||
                      "0"
                    }
                  />

                  <SupportersCount
                    supporters={
                      (postData &&
                        postData.supportCount &&
                        postData.supportCount.toString()) ||
                      "0"
                    }
                  />
                </div>
                <div>
                  {repliesLogs && repliesLogs.length > 0 && (
                    <a
                      href={`/post/${postData?.tokenId}`}
                      className="mr-2 text-secondary"
                    >
                      <small>
                        Replies {repliesLogs && `(${repliesLogs.length})`}
                      </small>
                    </a>
                  )}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleReplyClicked}
                    disabled={!human.profile.registered}
                  >
                    <div className="d-flex justify-content-around align-items-center">
                      <FaReply className="mr-1" />
                      Reply
                    </div>
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
          {/* <Button variant="primary">Go somewhere</Button> */}
        </Card.Body>
      </Card>
    </>
  );
}

function SupportersCount(props: any) {
  return (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id="supporters_hint">
          Number of humans that gave support to this post.
        </Tooltip>
      }
    >
      <div className="d-inline-flex text-dark align-self-center justify-content-center px-2 mx-2">
        <FaUsers className="align-self-center mr-2" />
        <small>{props.supporters} supporters</small>
      </div>
    </OverlayTrigger>
  );
}

/**
 * The button used to give support to a post.
 * @param props A
 * @returns
 */
function GiveSupportButton(props: IGiveSupportButtonProps) {
  return (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id="immortalize_tooltip">
          Support this post! 50% burn - 50% for the author
        </Tooltip>
      }
    >
      <div className={props.className}>
        <Button
          variant="outline-danger"
          onClick={props.onClick}
          disabled={props.disabled}
          className="p-0 m-0"
          size="sm"
        >
          <div className="d-flex justify-content-center align-items-center">
            <BurningHeart className={`btn-icon my-0 mx-0 p-0 bg-transparent`} />
            <span className={"mr-1"}>{props.supportGiven}</span>
          </div>
        </Button>
      </div>
    </OverlayTrigger>
  );
}

enum AvatarSize {
  Small = "avatar-sm",
  Regular = "avatar",
}

function ProfilePicture(props: { size: AvatarSize; imageUrl?: string | null }) {
  const avatarClass = props.size || "avatar";
  return (
    (props.imageUrl && (
      <img className={`${avatarClass} mr-2`} src={props.imageUrl} />
    )) || (
      <POHLogo
        className={`flex-shrink-0 ${avatarClass} mr-2 text-secondary p-1 bg-secondary`}
      />
    )
  );
}
