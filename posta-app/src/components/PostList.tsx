import PostDisplay from "./PostDisplay";
import { Container, Row, Col, Spinner, Card } from "react-bootstrap";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";
import { BigNumber } from "ethers";
import { useEffect } from "react";

interface IPostListProps extends IBasePostaProps {
  posts?: Array<BigNumber | IPostaNFT>;
  isLoading: boolean;
}

export default function PostList(props: IPostListProps) {

  return (
    <>
      <Container>
        {props.isLoading ? (
          <LoadingList />
        ) : (
          props.posts && props.posts.map((postOrId, index) => (
            <Row key={index} className="justify-content-center my-3">
              <Col>
                <PostDisplay
                  postOrId={postOrId}
                  {...props}
                />
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
