import  { useState } from "react";
import SupportPostDialog from "./SupportPostDialog";
import PostDisplay from "./PostDisplay";
import { Container, Row, Col } from "react-bootstrap";
import { IPostaNFT } from "posta-lib/build/services/PostaService";

interface IPostListProps extends IBasePostaProps {
  posts: IPostaNFT[]
}

export default function PostList(props: IPostListProps) {
  const [supportPostDialogOpts, setsupportPostDialogOpts] = useState({
    show: false,
    postTokenId: "",
  });
  

  const handleBurnUBIsClicked = async (tokenId: string) => {
    setsupportPostDialogOpts({
      show: true,
      postTokenId: tokenId,
    });
  };

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
        {props.posts.map((postNFT, index) => (
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
