import { useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { ISignedPostRequest, IPostRequest } from "../posta-lib/services/PostaService";
import PostEditor from "./PostEditor/PostEditor";

interface IPostOnBehalfOfProps {
  onClose?(): any;
  onRequestLoaded?(data: IPostRequest): any;
  show: boolean;
}

export default function PostOnBehalfOfDialog(props: IPostOnBehalfOfProps) {
  const [postRequest, setPostRequest] = useState<ISignedPostRequest | null>(null);

  const handleClose = () => {
    props.onClose && props.onClose();
  };

  const handleRequestLoaded = (request: ISignedPostRequest) => {
    setPostRequest(request);
  };

  return (
    <Modal show={props.show} onHide={handleClose} centered className="m-0 p-0">
      {/* <Modal.Header className="m-0 p-0 d-flex">
            <PostDisplay
              borderless={true}
              hideSourcePost={true}
              condensed={true}
              postOrId={props.postReply}
            />
          </Modal.Header> */}
      <Modal.Body className="m-0 p-1 bg-dark">
        {postRequest ? (
          <PostEditor
            postRequest={postRequest}
            borderless={true}
            showHeader={false}
            onNewPostSent={() => props.onClose && props.onClose()}
          />
        ) : (
          <PostRequestUploader onRequestLoaded={handleRequestLoaded} />
        )}
      </Modal.Body>
    </Modal>
  );
}

function PostRequestUploader(props: any) {
  const handleFileChosen = async (file: Blob) => {
    const data = await file.text();
    console.log("DATA", data);
    const request = JSON.parse(data);
    console.log("REQUEST", request);
    if (request) {
      props.onRequestLoaded && props.onRequestLoaded(request);
    }
  };

  return (
    <Form.Group controlId="formFile" className="mb-3 text-light">
      <Form.Label>Please, select a signed post request file</Form.Label>
      <Form.Control
        type="file"
        size="sm"
        onChange={(e: any) => handleFileChosen(e.target.files[0])}
      />
    </Form.Group>
  );
}
