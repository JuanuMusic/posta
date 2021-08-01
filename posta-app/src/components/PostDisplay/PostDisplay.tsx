// No me la
import Container from "react-bootstrap/Container";

import {
  Card,
  Col,
  Row,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import moment from "moment";

import { FaReply, FaUsers } from "react-icons/fa";
import { BigNumber, ethers } from "ethers";
import { ReactComponent as BurningHeart } from "../../assets/burning_heart.svg";
import {
  IPostaNFT,
  PostaService,
  PostLogs,
} from "../../posta-lib/services/PostaService";
import { useHuman } from "../../contextProviders/HumanProvider";
import { useEffect, useState } from "react";
import { useContractProvider } from "../../contextProviders/ContractsProvider";
import PostReply from "../PostReply";
import { truncateTextMiddle } from "../../utils/textHelpers";
import SupportPostDialog from "../SupportPostDialog";
import Skeleton from "react-loading-skeleton";
import { Link, useHistory } from "react-router-dom";
import ProfilePicture, { AvatarSize } from "../ProfilePicture";
import { IconButton } from "../IconButton";
import PostaContentDisplay from "./components/PostaContentDisplay";

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
  const [isReplyDialogVisible, setIsReplyDialogVisible] = useState(false);
  const [repliesLogs, setRepliesLogs] = useState<PostLogs[] | null>(null);
  const [showSupportPostDialog, setShowSupportPostDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const human = useHuman();
  const contractProvider = useContractProvider();
  const history = useHistory();

  const handleReplyClicked = async () => {
    setIsReplyDialogVisible(true);
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
          null,
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

  function handleOnPostDisplayClick() {
    history.push(`/posta/${postData?.replyOfTokenId}`);
  }

  const showReply =
    postData &&
    postData.replyOfTokenId &&
    postData.replyOfTokenId.gt(0) &&
    !props.hideSourcePost;

  function getDisplayDate(date: moment.MomentInput) {
    const blockTime = moment(date);
    const now = moment();

    const secondsAgo = now.diff(blockTime, "seconds");
    const minutesAgo = now.diff(blockTime, "minutes");
    if (minutesAgo < 1) {
      return `${secondsAgo}s ago`;
    }

    const hoursAgo = now.diff(blockTime, "hours");
    if (hoursAgo < 1) {
      return `${minutesAgo}min ago`;
    }

    // If it was today returns just the time
    if (
      blockTime.year() === now.year() &&
      now.dayOfYear() - blockTime.dayOfYear() < 1
    ) {
      return blockTime.format("hh:mm a");
    }

    const input = props.condensed ? "DD/MM/YY HH:mm" : "MMM DD yy - hh:mm a";
    return blockTime.format(input);
  }

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
          show={isReplyDialogVisible}
          postReply={postData}
          onClose={() => setIsReplyDialogVisible(false)}
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
                      <Link
                        to={`/human/${postData?.author.toLowerCase()}`}
                        className="text-dark align-middle"
                      >
                        <h6 className="m-0">
                          {postData &&
                            (postData.authorDisplayName ||
                              truncateTextMiddle(4, postData.author, 4))}
                        </h6>
                      </Link>
                      <small className="post-date ml-1 text-muted align-middle">
                        {" - "}
                        {postData ? (
                          getDisplayDate(postData.blockTime || new Date(0))
                        ) : (
                          <Skeleton />
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
                            $POSTA:
                            {(postData && postData.tokenId.toString()) ||
                              props.postOrId.toString()}
                          </small>
                        ) : (
                          <>$POSTA:{postData && postData.tokenId.toString()}</>
                        )}
                      </a>
                    </h6>{" "}
                  </div>
                  <PostaContentDisplay
                    isLoading={isLoading}
                    content={(postData && postData.content) || ""}
                    condensed={props.condensed}
                    className={props.condensed ? "pr-0" : "pr-2"}
                  />
                  {showReply && (
                    <div
                      onClick={handleOnPostDisplayClick}
                      className="cursor-pointer mt-n2"
                    >
                      <PostDisplay
                        hideSourcePost={true}
                        condensed
                        postOrId={postData?.replyOfTokenId!}
                      />
                    </div>
                  )}
                </div>
              </Col>
            </Row>
            <Row className={((props.condensed && "d-none") || "") + " mt-2"}>
              <Col className="d-flex justify-content-between align-items-start">
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
                  <Link
                    to={`/posta/${postData?.tokenId}/supporters`}
                    className="align-middle"
                  >
                    <SupportersCount
                      supporters={
                        (postData &&
                          postData.supportCount &&
                          postData.supportCount.toString()) ||
                        "0"
                      }
                    />
                  </Link>
                </div>
                <div>
                  {repliesLogs && repliesLogs.length > 0 && (
                    <Link
                      to={`/posta/${postData?.tokenId}`}
                      className="mr-2 text-secondary align-middle"
                    >
                      <small>
                        Replies {repliesLogs && `(${repliesLogs.length})`}
                      </small>
                    </Link>
                  )}
                  <IconButton
                    variant="outline-primary"
                    size="sm"
                    onClick={handleReplyClicked}
                    disabled={!human.profile.registered}
                    icon={<FaReply className="mr-1" />}
                    text="Reply"
                  />
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
          how many humans supported this post
        </Tooltip>
      }
    >
      <div className="d-inline-flex text-dark align-self-center justify-content-center px-2 mx-2 align-middle">
        <FaUsers className="align-self-center mr-2" />
        <small style={{ fontSize: "0.7rem" }}>
          {props.supporters} supporters
        </small>
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
      <IconButton
        variant="outline-danger"
        onClick={props.onClick}
        disabled={props.disabled}
        size="sm"
        icon={<BurningHeart className="mr-1" />}
        text={props.supportGiven}
      />
    </OverlayTrigger>
  );
}
