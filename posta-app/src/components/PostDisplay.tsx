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
import { ethers } from "ethers";
import { ReactComponent as POHLogo } from "../assets/poh.svg";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";
import { useHuman } from "../contextProviders/HumanProvider";
import { useEffect, useState } from "react";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import { POINT_CONVERSION_COMPRESSED } from "constants";
import PostReply from "./PostReply";

interface IPostDisplayProps extends IBasePostaProps {
  postOrId: string | IPostaNFT;
  onBurnUBIsClicked?(tokenId: string): any;
  onReplyClicked?(tokenId: string): any;
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
  const human = useHuman();
  const contractProvider = useContractProvider();

  const handleBurnUBIsClicked = async () => {
    postData &&
      props.onBurnUBIsClicked &&
      props.onBurnUBIsClicked(postData?.tokenId);
  };

  const handleReplyClicked = async () => {
    setShowReply(true);
  };

  // Load post effect
  useEffect(() => {
    async function loadPost() {
      // If it's not string, assume it's a PostaNFT interface
      if (
        typeof props.postOrId !== "string" &&
        !(props.postOrId instanceof String)
      ) {
        setPostData(props.postOrId);
      }
      // If contract provider is set
      else if (contractProvider) {
        // Get logs for the token
        const postLogs = await PostaService.getPostLogs(
          [props.postOrId as string],
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
    }

    loadPost();
  }, [props.postOrId, contractProvider]);
  console.log("POST DATA", postData);
  return (
    <>
      {postData && <PostReply show={showReply} postReply={postData} />}
      <Card style={{ width: "100%", maxWidth: "700px" }} className="mx-auto">
        <Card.Body className="px-1 py-2">
          <Container>
            <Row>
              <Col className="d-flex">
                {/* Profile Picture */}
                <ProfilePicture imageUrl={postData && postData.authorImage} />

                <div className="flex-fill">
                  <div className="d-flex justify-content-between">
                    {/* Human Name */}
                    <a
                      href={`${process.env.REACT_APP_HUMAN_PROFILE_BASE_URL}/${
                        postData && postData.author.toLowerCase()
                      }`}
                      className="text-dark"
                    >
                      <strong>
                        {postData &&
                          (postData.authorDisplayName || postData.author)}
                      </strong>
                    </a>{" "}
                    {/* NFT ID */}
                    <span className="text-muted">
                      <a
                        className="text-muted"
                        target="_blank"
                        href={(postData && postData.tokenURI) || "#"}
                      >
                        $POSTA:{postData && postData.tokenId}
                      </a>
                    </span>
                  </div>
                  <blockquote className="blockquote mt-2 ml-2 mb-0">
                    {/* Post Text */}
                    <p className="post-text text-dark">
                      {" "}
                      {(postData && postData.content) || "..."}{" "}
                    </p>
                    {/* Post Date */}
                    <footer className="blockquote-footer">
                      <span className="fw-light">
                        {postData &&
                          moment(postData.creationDate || new Date(0)).format(
                            "MMMM Do YYYY, h:mm"
                          )}
                      </span>
                    </footer>
                  </blockquote>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <hr className="my-2" />
              </Col>
            </Row>
            <Row>
              <Col className="d-flex justify-content-between align-items-start mt-2 mb-1">
                <div className="d-flex alignt-items-start">
                  <GiveSupportButton
                    className="align-self-center"
                    disabled={
                      !human.profile.registered ||
                      !postData ||
                      postData.author === human.profile.eth_address
                    }
                    onClick={handleBurnUBIsClicked}
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
                  <div>metadata</div>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleReplyClicked}
                >
                  <div className="d-flex justify-content-around align-items-center">
                    <FaReply />
                    Reply
                  </div>
                </Button>
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
        <span>{props.supporters} supporters</span>
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
          size="sm"
        >
          <div className="d-flex justify-content-center align-items-center">
            <FaFire />
            <span>{props.supportGiven}</span>
          </div>
        </Button>
      </div>
    </OverlayTrigger>
  );
}

function ProfilePicture(props: any) {
  return (
    (props.imageUrl && (
      <img className="avatar mr-2" src={props.imageUrl} />
    )) || (
      <POHLogo className="flex-shrink-0 avatar mr-2 text-secondary p-1 bg-secondary" />
    )
  );
}
