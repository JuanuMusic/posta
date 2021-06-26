import React from "react";

// No me la
import Container from "react-bootstrap/Container";

import { Web3Provider } from "@ethersproject/providers";

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
import { useWeb3React } from "@web3-react/core";
import useHuman from "../hooks/useHuman";

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
              {(props.postaNFT.authorImage && (
                <img className="avatar mr-2" src={props.postaNFT.authorImage} />
              )) || (
                <Skeleton
                  className="m-2"
                  circle={true}
                  width={50}
                  height={50}
                />
              )}
              <div className="flex-fill">
                <span className="text-dark">
                  <strong>
                    {props.postaNFT.authorDisplayName ||
                      props.postaNFT.authorDisplayName || <Skeleton />}
                  </strong>
                </span>{" "}
                <br />
                <blockquote className="blockquote mb-0">
                  <p className="post-text text-dark">
                    {" "}
                    {props.postaNFT.content || <Skeleton />}{" "}
                  </p>
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
          <Row>
            <Col className="d-flex align-items-start">
              <GiveSupportButton
                className="align-self-center"
                disabled={props.postaNFT.author === human.address}
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
        <FaUsers />
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
