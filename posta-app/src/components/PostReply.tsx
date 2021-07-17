import { Modal } from "react-bootstrap";
import { IPostaNFT } from "../posta-lib/services/PostaService";
import PostDisplay from "./PostDisplay";
import PostEditor from "./PostEditor/PostEditor";

interface IPostReplyProps {
  onClose?(): any;
  show: boolean;
  postReply: IPostaNFT
}

export default function PostReply(props: IPostReplyProps) {
  const handleClose = () => {
    props.onClose && props.onClose();
  };

  console.log("postReply", props.postReply)
  return (
    <Modal show={props.show} onHide={handleClose} centered>
      <Modal.Header>
        <Modal.Title>
          <PostDisplay postOrId={props.postReply} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <PostEditor
          onNewPostSent={() => console.log("Post replied")}
          isReplyOf={props.postReply.tokenId}
        />
        )
      </Modal.Body>
    </Modal>
  );
}
