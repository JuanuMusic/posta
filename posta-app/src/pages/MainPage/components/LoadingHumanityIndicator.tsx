import { Spinner } from "react-bootstrap";

export default function LoadHumanityIndicator() {
  return (
    <div className="d-flex">
      <div>
        <Spinner animation="border" role="status" />
        <span>Veryfing humanity...</span>
      </div>
    </div>
  );
}
