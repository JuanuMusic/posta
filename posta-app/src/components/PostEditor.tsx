import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormGroup from "react-bootstrap/FormGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import useContractProvider from "../hooks/useContractProvider";
import { IPostData, PostaService } from "../posta-lib/services/PostaService";
import useHuman from "../hooks/useHuman";

interface IPostEditorProps extends IBasePostaProps {
  disabled?: boolean;
  onNewPostSent(stackId: number): void;
}

export default function PostEditor(props: IPostEditorProps) {
  const [postText, setPostText] = useState("");
  const [isEditorEnabled, setIsEditorEnabled] = useState(false);
  const [isSendButtonEnabled, setIsSendButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const contractProvider = useContractProvider();
  const human = useHuman();

  const MAX_CHARS = 140;

  // Update editor status
  useEffect(() => {
    const isHuman = human && !human.isLoading && human.profile && !!human.profile.registered;
    setIsEditorEnabled(isHuman && !isLoading);
  }, [human, human.isLoading, human.profile]);

  useEffect(() => {
    const isHuman = human && !human.isLoading && human.profile && !!human.profile.registered;
    setIsSendButtonEnabled(
      isHuman &&
        typeof postText === "string" &&
        postText !== "" &&
        !isLoading
    );
  }, [human.isLoading, isLoading, postText]);

  const handleSendPost = async () => {
    if (!contractProvider) return;
    // Generate the post data with the content and the author address
    const postData: IPostData = {
      text: postText,
      author: props.human.address,
    };

    setIsLoading(true);
    // Publish the tyweet through the Posta Service
    await PostaService.publishPost(postData, contractProvider);

    setPostText("");
    setIsLoading(false);
    props.onNewPostSent && props.onNewPostSent(0);
  };

  return (
    <Container>
      <Row>
        <Col xs={12}>
          <FormGroup controlId="formPostEditor">
            <FormControl
              as="textarea"
              placeholder="What's happening?"
              rows={3}
              value={postText}
              onChange={(e) =>
                e.target.value.length <= MAX_CHARS &&
                setPostText(e.target.value)
              }
              disabled={!isEditorEnabled}
            ></FormControl>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="d-flex justify-content-between ">
          <div>{`${postText.length}/${MAX_CHARS}`}</div>
          <Button
            disabled={!isSendButtonEnabled}
            onClick={handleSendPost}
            className="mb-5"
          >
            Send
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
