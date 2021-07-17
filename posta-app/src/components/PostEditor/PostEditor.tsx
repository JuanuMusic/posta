import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { FormControl, Button, Card } from "react-bootstrap";
import { IPostData, PostaService } from "../../posta-lib/services/PostaService";
import { useHuman } from "../../contextProviders/HumanProvider";
import PublishingIndicator from "./components/PublishingIndicator";
import PostError from "./components/PostError";
import { useContractProvider } from "../../contextProviders/ContractsProvider";
//import PostDisplay from "../PostDisplay";

interface IPostEditorProps extends IBasePostaProps {
  disabled?: boolean;
  isReplyOf?: string;
  onNewPostSent(stackId: number): void;
}

export default function PostEditor(props: IPostEditorProps) {
  const [publishError, setPublishError] = useState();
  const [postText, setPostText] = useState("");
  const [isSendButtonEnabled, setIsSendButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const contractProvider = useContractProvider();
  const human = useHuman();
  const [maxChars, setMaxChars] = useState(140);

  useEffect(() => {
    async function loadMaxChars() {
      if (contractProvider) {
        setMaxChars(await PostaService.getMaxChars(contractProvider));
      }
    }

    loadMaxChars();
  }, [contractProvider]);

  // Update editor status

  useEffect(() => {
    setIsSendButtonEnabled(
      !props.disabled &&
        typeof postText === "string" &&
        postText !== "" &&
        !isLoading
    );
  }, [isLoading, postText]);

  const handleSendPost = async () => {
    // If no contrct provider, do nothing
    if (!contractProvider) return;

    // Loading...
    setIsLoading(true);

    // Generate the post data with the content and the author address
    const postData: IPostData = {
      text: postText,
      author: (human && human.profile && human.profile.eth_address) || "",
      replyOfTokenId: props.isReplyOf
    };

    console.log("SEDING POST WITH DQATA", postData);
    // Publish the tyweet through the Posta Service
    try {
      const tx = await PostaService.publishPost(postData, contractProvider);
      const receipt = await tx.wait();
      console.log("RECEIPT", receipt);
    } catch (error) {
      setPublishError(error);
    }
    // Empty post text
    setPostText("");
    setIsLoading(false);
    props.onNewPostSent && props.onNewPostSent(0);
  };

  return (
    <Container className="p-0">
      <Card bg="dark" border="secondary">
        {/* Loading Indicator */}
        {isLoading && <PublishingIndicator />}
        {/* Publish error */}
        {publishError && <PostError error={publishError} />}
        <Card.Header className="py-0">
          <p className="lead my-2">
            Hi {human && human.profile && human.profile?.display_name}!
          </p>
        </Card.Header>
        <Card.Body className="p-0">
          <FormControl
            style={{ borderRadius: 0 }}
            as="textarea"
            placeholder="Share it with the world..."
            rows={3}
            value={postText}
            onChange={(e) =>
              e.target.value.length <= maxChars && setPostText(e.target.value)
            }
            disabled={props.disabled}
          ></FormControl>
        </Card.Body>
        <Card.Footer className="p-2">
          <div className="d-flex justify-content-between align-items-center my-0">
            <div>{`${postText.length}/${maxChars}`}</div>
            <Button disabled={!isSendButtonEnabled} onClick={handleSendPost}>
              Send
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
}
