import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { FormControl, Button, Card } from "react-bootstrap";
import {
  IPostData,
  IPostRequest,
  PostaService,
  ISignedPostRequest
} from "../../posta-lib/services/PostaService";
import { useHuman } from "../../contextProviders/HumanProvider";
import PublishingIndicator from "./components/PublishingIndicator";
import PostError from "./components/PostError";
import { usePostaContext } from "../../contextProviders/PostaContext";
import { BigNumber, ethers } from "ethers";
import ProfilePicture, { AvatarSize } from "../ProfilePicture";
import { Link } from "react-router-dom";
import PostOnBehalfOfDialog from "../PostOnBehalfOfDialog";
//import PostDisplay from "../PostDisplay";

interface IPostEditorProps extends IBasePostaProps {
  disabled?: boolean;
  replyOfTokenId?: BigNumber;
  showHeader?: boolean;
  borderless?: boolean;
  onNewPostSent(stackId: number): void;
  postRequest?: ISignedPostRequest;
}

export default function PostEditor(props: IPostEditorProps) {
  const [publishError, setPublishError] = useState();
  const [postText, setPostText] = useState("");
  const [isSendButtonEnabled, setIsSendButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { postaService, contractProvider } = usePostaContext();
  const [isSigning, setIsSigning] = useState(false);
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [postRequestDownloadURL, setPostRequestDownloadURL] = useState("");
  const [isPostOnBehalfOfVisible, setIsPostOnBehalfOfVisible] = useState(false);
  const human = useHuman();
  const [maxChars, setMaxChars] = useState(140);

  useEffect(() => {
    async function loadMaxChars() {
      if (postaService) {
        setMaxChars(await postaService.getMaxChars());
      }
    }

    loadMaxChars();
  }, [postaService]);

  useEffect(() => {
    if (props.postRequest) {
      setPostText(props.postRequest.text);
    }
  }, [props.postRequest]);

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
    if (!postaService) return;

    // Loading...
    setIsLoading(true);

    // Generate the post data with the content and the author address
    const postData: IPostData = {
      text: postText,
      author: (human && human.profile && human.profile.eth_address) || "",
      replyOfTokenId: props.replyOfTokenId,
    };

    // Publish the tyweet through the Posta Service
    try {
      if (props.postRequest && human.profile.eth_address) {
        const tx = await postaService.publishOnBehalfOf(
          props.postRequest,
          human.profile.eth_address
        );
        console.log("Transaction", tx);
      } else {
        const tx = await postaService.publishPost(postData);
        console.log("Transaction", tx);
      }
    } catch (error) {
      console.error(JSON.stringify(error));
      console.error(error.stack);
      setPublishError(error);
    }
    // Empty post text
    setPostText("");
    setIsLoading(false);
    props.onNewPostSent && props.onNewPostSent(0);
  };

  const handleDownloadSignedPostRequest = async () => {
    if (!postaService || !human.profile.eth_address) return;

    try {
      setIsSigning(true);

      // Generate the post data with the content and the author address
      const postData: IPostRequest = {
        text: postText,
        author: (human && human.profile && human.profile.eth_address) || "",
        replyOfTokenId: props.replyOfTokenId,
        nonce: new Date().getDate()
      };

      // Nonce is current time. (any better way?).-
      const signedMessage = await postaService.signPostaRequest(postData);

      // Create file
      var file = new Blob([
        JSON.stringify({
          text: postData.text,
          author: postData.author,
          replyOfTokenId: postData.replyOfTokenId
            ? postData.replyOfTokenId.toString()
            : "0",
          nonce: postData.nonce,
          signature: signedMessage,
        }),
      ]);
      // Create Url from file
      var url = window.URL.createObjectURL(file);
      // Update state
      setPostRequestDownloadURL(url);
      setIsDownloadReady(true);
      setIsSigning(false);
    } catch (error) {
      console.error("Error signing posta request", error);
      setIsSigning(false);
      setIsDownloadReady(false);
    }
  };

  const handlePostOnBehalfOfClicked = () => {
    setIsPostOnBehalfOfVisible(true);
  };

  return (
    <>
      <PostOnBehalfOfDialog
        show={isPostOnBehalfOfVisible}
        onClose={() => setIsPostOnBehalfOfVisible(false)}
      />
      <div className="d-flex p-0">
        <Card
          bg="dark"
          border={props.borderless ? "border-0" : "secondary"}
          className="w-100"
        >
          {props.showHeader && (
            <div className="d-flex justify-content-between">
              <small className="m-2">
                <ProfilePicture
                  imageUrl={human && human.profile.photo}
                  size={AvatarSize.Small}
                />{" "}
                Hi {human && human.profile && human.profile?.display_name}!
              </small>
              <Button className="align-self-center mr-1" onClick={handlePostOnBehalfOfClicked} size="sm">
                Post on behalf of...
              </Button>
            </div>
          )}
          {/* Loading Indicator */}
          {isLoading && <PublishingIndicator />}
          {/* Publish error */}
          {/* {publishError && <PostError error={publishError} />} */}
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
            ></FormControl>
          </Card.Body>
          <Card.Footer className="p-2">
            <div className="d-flex justify-content-between align-items-center my-0">
              <div className="text-light">{`${postText.length}/${maxChars}`}</div>
              {!props.postRequest &&
                (!isDownloadReady ? (
                  <Button
                    size="sm"
                    disabled={!isSendButtonEnabled || isSigning}
                    onClick={handleDownloadSignedPostRequest}
                  >
                    {isSigning
                      ? "Signing..."
                      : "Sign post request"}
                  </Button>
                ) : (
                  <a
                    className="btn btn-success btn-sm"
                    target="_blank"
                    href={postRequestDownloadURL}
                    download="posta_publish_request.txt"
                  >
                    Download request
                  </a>
                ))}
              <Button size="sm" disabled={!isSendButtonEnabled} onClick={handleSendPost}>
                {props.postRequest ? "Post on behalf of" : "Post forever"}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </>
  );
}
