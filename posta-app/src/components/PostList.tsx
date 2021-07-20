import PostDisplay from "./PostDisplay";
import { Container, Row, Col, Spinner, Card } from "react-bootstrap";
import { IPostaNFT } from "../posta-lib/services/PostaService";
import { BigNumber } from "ethers";

interface IPostListProps extends IBasePostaProps {
  posts?: Array<BigNumber | IPostaNFT>;
  isLoading: boolean;
}

export default function PostList(props: IPostListProps) {

  const handleReplyClicked = async (tokenId: string) => {
    console.log("REPLY TO ", tokenId);
  }

  return (
    <>
      <Container>
        {props.isLoading ? (
          <LoadingList />
        ) : (
          props.posts && props.posts.map((postOrId, index) => (
            <Row key={index} className="justify-content-center">
              <Col>
                <PostDisplay
                onReplyClicked={(tokenId) => handleReplyClicked(tokenId)}
                  postOrId={postOrId}
                  {...props}
                />
                <hr />
              </Col>
            </Row>
          ))
        )}
      </Container>
    </>
  );
}

function LoadingList() {
  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card>
        <Card.Body className="text-dark d-flex justify-content-center align-items-center">
          <Spinner animation="border" className="mr-2" /> Loading Postas...
        </Card.Body>
      </Card>
    </Container>
  );
}
