import { Card, Spinner } from "react-bootstrap";

/**
 * A component used to indicate the publishing status on the Post Editor
 * @returns 
 */
export default function PublishingIndicator() {
  return (
    <div
      className="bg-dark-85 d-flex justify-content-center align-items-center"
      style={{
        position: "absolute",
        zIndex: 10,
        height: "100%",
        width: "100%"
      }}
    >
      <Card>
        <Card.Body className="d-flex justify-content-around align-items-center text-dark">
          <Spinner animation="border" className="mr-2" /> Publishing...
        </Card.Body>
      </Card>
    </div>
  );
}
