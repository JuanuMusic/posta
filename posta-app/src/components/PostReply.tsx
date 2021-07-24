import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import { IPostaNFT } from "../posta-lib/services/PostaService";
import PostDisplay from "./PostDisplay/PostDisplay";
import PostEditor from "./PostEditor/PostEditor";

interface IPostReplyProps {
  onClose?(): any;
  show: boolean;
  postReply: IPostaNFT;
}

export default function PostReply(props: IPostReplyProps) {
  const handleClose = () => {
    props.onClose && props.onClose();
  };

  return (
    <Modal show={props.show} onHide={handleClose} centered className="m-0 p-0">
      <Modal.Header className="m-0 p-0 d-flex">
        <PostDisplay
          borderless={true}
          hideSourcePost={true}
          condensed={true}
          postOrId={props.postReply}
        />
      </Modal.Header>
      <Modal.Body className="m-0 p-1 bg-dark">
        <PostEditor
          borderless={true}
          showHeader={false}
          onNewPostSent={() => props.onClose && props.onClose()}
          replyOfTokenId={props.postReply.tokenId}
        />
      </Modal.Body>
    </Modal>
  );
}
