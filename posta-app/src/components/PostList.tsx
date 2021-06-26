import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import React, { useEffect, useState } from "react";
import PostaService from "../services/PostaService";
import SupportPostDialog from "./SupportPostDialog";
import PostDisplay from "./PostDisplay";
import contractProvider from "../services/ContractProvider";
import { Container, Row, Col } from "react-bootstrap";
import { ethers } from "ethers";

interface IPostListProps extends IBasePostaProps {}

export default function PostList(props: IPostListProps) {
  const [supportPostDialogOpts, setsupportPostDialogOpts] = useState({
    show: false,
    postTokenId: "",
  });
  const [posts, setPost] = useState([] as IPostaNFT[]);
  const context = useWeb3React<Web3Provider>();
  console.log("CONTEXT", context);

  useEffect(() => {
    async function getLatestPosts() {
      try {
        const postList = await PostaService.getLatestPosts(10, ethers.getDefaultProvider("kovan"));
        setPost(postList);
      } catch (error) {
        console.error(error.message);
        console.error(error.stack);
      }
    }

    getLatestPosts();
  }, []);

  const handleBurnUBIsClicked = async (tokenId: string) => {
    setsupportPostDialogOpts({
      show: true,
      postTokenId: tokenId,
    });
  };

  console.log("PROPS", props);

  return (
    <>
      <SupportPostDialog
        show={supportPostDialogOpts.show}
        postTokenId={supportPostDialogOpts.postTokenId}
        onClose={() =>
          setsupportPostDialogOpts({
            show: false,
            postTokenId: "",
          })
        }
        human={props.human}
      />{" "}
      <Container>
        {posts.map((postNFT, index) => (
          <Row key={index} className="justify-content-center">
            <Col>
              <PostDisplay
                onBurnUBIsClicked={() => handleBurnUBIsClicked(postNFT.tokenId)}
                postaNFT={postNFT}
                {...props}
              />
              <hr />
            </Col>
          </Row>
        ))}
      </Container>
    </>
  );
}
