import PostDisplay from "./PostDisplay/PostDisplay";
import { Container, Row, Col, Spinner, Card } from "react-bootstrap";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";
import { BigNumber } from "ethers";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

interface IPostListProps extends IBasePostaProps {
  posts?: Array<BigNumber | IPostaNFT>;
  isLoading: boolean;
  onNextPage(): void;
  hasMore: boolean;
}

export default function PostList(props: IPostListProps) {
  return (
    <>
      <Container>
        {props.isLoading ? (
          <LoadingList />
        ) : (
          <InfiniteScroll
            dataLength={(props.posts && props.posts.length) || 0}
            next={props.onNextPage}
            hasMore={props.hasMore}
            loader={<LoadingList />}
          >
            {props.posts &&
              props.posts.map((postOrId, index) => (
                <Row key={index} className="justify-content-center my-3">
                  <Col>
                    <PostDisplay postOrId={postOrId} {...props} />
                  </Col>
                </Row>
              ))}
          </InfiniteScroll>
        )}
      </Container>
    </>
  );
}

function LoadingList() {
  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card>
        <Card.Body className="text-dark d-flex justify-content-center align-items-center">
          <Spinner animation="border" className="mr-2" /> Loading Postas...
        </Card.Body>
      </Card>
    </Container>
  );
}
