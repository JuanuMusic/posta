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

import { FaFire, FaUsers } from "react-icons/fa";
import { ethers } from "ethers";
import Skeleton from "react-loading-skeleton";
import { ReactComponent as POHLogo } from "../assets/poh.svg";
import { IPostaNFT } from "../posta-lib/services/PostaService";
import { useHuman } from "../contextProviders/HumanProvider";

interface IPostDisplayProps extends IBasePostaProps {
  postaNFT: IPostaNFT;
  onBurnUBIsClicked(tokenId: string): any;
}

interface IGiveSupportButtonProps {
  onClick(e: any): void;
  supportGiven: string;
  className?: string;
  disabled?: boolean;
}

export default function PostDisplay(props: IPostDisplayProps) {
  const human = useHuman();

  const handleBurnUBIsClicked = async () => {
    props.onBurnUBIsClicked && props.onBurnUBIsClicked(props.postaNFT.tokenId);
  };


  return (
    <Card style={{ width: "100%", maxWidth: "700px" }} className="mx-auto">
      <Card.Body className="px-1 py-2">
        <Container>
          <Row>
            <Col className="d-flex">
              {/* Profile Picture */}
              <ProfilePicture imageUrl={props.postaNFT.authorImage} />

              <div className="flex-fill">
                <div className="d-flex justify-content-between">
                  {/* Human Name */}
                  <a href={`https://app-kovan.poh.dev/profile/${props.postaNFT.author.toLowerCase()}`} className="text-dark">
                    <strong>
                      {props.postaNFT.authorDisplayName ||
                        props.postaNFT.authorDisplayName || <Skeleton />}
                    </strong>
                  </a>{" "}
                  {/* NFT ID */}
                  <span className="text-muted">
                    <a className="text-muted" target="_blank" href={props.postaNFT.tokenURI}>PSTA:{props.postaNFT.tokenId}</a>
                  </span>
                </div>
                <blockquote className="blockquote mt-2 ml-2 mb-0">
                  {/* Post Text */}
                  <p className="post-text text-dark">
                    {" "}
                    {props.postaNFT.content || <Skeleton />}{" "}
                  </p>
                  {/* Post Date */}
                  <footer className="blockquote-footer">
                    <span className="fw-light">
                      {(props.postaNFT.creationDate &&
                        moment(props.postaNFT.creationDate).format(
                          "MMMM Do YYYY, h:mm"
                        )) || <Skeleton />}
                    </span>
                  </footer>
                </blockquote>
              </div>
            </Col>
          </Row>
          <Row><Col><hr className="my-2" /></Col></Row>
          <Row>
            <Col className="d-flex align-items-start mt-2 mb-1">
              <GiveSupportButton
                className="align-self-center"
                disabled={!human.profile.registered || props.postaNFT.author === human.profile.eth_address}
                onClick={handleBurnUBIsClicked}
                supportGiven={
                  props.postaNFT.supportGiven &&
                  ethers.utils.formatEther(props.postaNFT.supportGiven)
                }
              />

              <SupportersCount
                supporters={
                  (props.postaNFT.supportCount &&
                    props.postaNFT.supportCount.toString()) ||
                  "0"
                }
              />
              <div>metadata</div>
            </Col>
          </Row>
        </Container>
        {/* <Button variant="primary">Go somewhere</Button> */}
      </Card.Body>
    </Card>
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
          <div className="d-flex justify-content-cente align-items-center">
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
    )) || <POHLogo className="flex-shrink-0 avatar mr-2 text-secondary p-1 bg-secondary" />
  );
}
