import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import { withRouter } from "react-router-dom";
import PostList from "../components/PostList";
import ProfilePicture, { AvatarSize } from "../components/ProfilePicture";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import { ContractProvider, PohService } from "../posta-lib";
import { POHProfileModel } from "../posta-lib/services/PohAPI";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";

function HumanPage(props: any) {
  const [currentHuman, setCurrentHuman] = useState<POHProfileModel | null>(
    null
  );
  const [humanPosts, setHumanPosts] = useState<IPostaNFT[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const contractProvider = useContractProvider();
  const humanAddress = props.match.params.humanAddress;

  /**
   * Loads the human's data
   */
  useEffect(() => {
    async function loadHumanData() {
      setIsLoading(true);
      const human = await PohService.getHuman(humanAddress);
      setCurrentHuman(human);
      setIsLoading(false);
    }
    loadHumanData();
  }, [humanAddress]);

  /**
   * Load posts by human
   */
  useEffect(() => {
    async function loadHumanPosts() {
      if (!contractProvider) return;
      setIsLoadingPosts(true);
      const posts = await PostaService.getPostsBy(
        humanAddress,
        contractProvider
      );
      setHumanPosts(posts);
      setIsLoadingPosts(false);
    }
    loadHumanPosts();
  }, [contractProvider]);

  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <Card.Body className="d-flex ">
              <ProfilePicture
                size={AvatarSize.Large}
                imageUrl={currentHuman && currentHuman.photo}
              />
              <div>
                <h4 className="text-dark mb-0">
                  {isLoading || !currentHuman ? (
                    <Skeleton />
                  ) : (
                    currentHuman.display_name
                  )}
                </h4>
                <small>
                  <a
                    href={`${process.env.REACT_APP_HUMAN_PROFILE_BASE_URL}/${humanAddress}`}
                    className="text-dark"
                    target="_blank"
                  >
                    View on Proof of Humanity
                  </a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <PostList isLoading={isLoadingPosts || !humanPosts} posts={humanPosts || []} />
        </Col>
      </Row>
    </Container>
  );
}

export default withRouter(HumanPage);
