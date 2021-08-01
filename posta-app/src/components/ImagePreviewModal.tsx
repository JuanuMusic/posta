import { Modal } from "react-bootstrap";

interface IImagePreviewModalProps {
    show: boolean;
    imageSrc: string;
    onHide(): void;
}

export default function ImagePreviewModal(props: IImagePreviewModalProps) {
  return (
    <Modal
      show={props.show}
      centered
      className="modal-image-preview"
      onHide={props.onHide}
    >
      <img src={props.imageSrc} />
    </Modal>
  );
}
