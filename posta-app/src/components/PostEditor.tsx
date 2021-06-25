import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormGroup from "react-bootstrap/FormGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import IPFSStorageService from "../services/IPFSStorageService";
import PostaService from "../services/PostaService";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from '@ethersproject/providers'

interface IPostEditorProps extends IBasePostaProps {
  disabled?: boolean;
  onNewPostSent(stackId: number): void;
}

export default function PostEditor(props: IPostEditorProps) {
  const [postText, setPostText] = useState("");
  const [isEditorEnabled, setIsEditorEnabled] = useState(false);
  const [isSendButtonEnabled, setIsSendButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { chainId, library } = useWeb3React();
  const context = useWeb3React<Web3Provider>()

  useEffect(() => {
    setIsEditorEnabled(
      props.human &&
        props.human.profile &&
        props.human.profile.registered &&
        !isLoading
    );
  }, [props.human, props.human.profile, props.human.profile.registered, isLoading]);

  useEffect(() => {
    setIsSendButtonEnabled(
      props.human &&
        props.human.profile &&
        props.human.profile.registered &&
        typeof postText === "string" && 
        postText !== "" &&
        !isLoading
    );
  }, [props.human, isLoading, postText]);

  const handleSendPost = async () => {
    // Generate the post data with the content and the author address
    const postData: IPostData = {
      text: postText,
      author: props.human.address,
    };

    setIsLoading(true);
    // Publish the tyweet through the Posta Service
    await PostaService.publishPost(postData, new Web3Provider(await context.library?.provider!));

    setPostText("");
    setIsLoading(false);
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
              onChange={(e) => setPostText(e.target.value)}
              disabled={!isEditorEnabled}
            ></FormControl>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="d-flex justify-content-end">
          <Button disabled={!isSendButtonEnabled} onClick={handleSendPost} className="mb-5">
            Send
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
