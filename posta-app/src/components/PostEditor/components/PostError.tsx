import { Card, FormControl, Spinner } from "react-bootstrap";
import { CardHeading } from "react-bootstrap-icons";

/**
 * A component used to indicate the publishing status on the Post Editor
 * @returns
 */
export default function PostError({ error }: { error: any }) {
  return (
    <div
      className="bg-dark-85 d-flex justify-content-center align-items-center"
      style={{
        position: "absolute",
        zIndex: 10,
        height: "100%",
        width: "100%",
      }}
    >
      <Card className="my-5 p-0">
        <Card.Header className="text-danger py-1">Oh no...</Card.Header>
        <Card.Body className="text-danger py-1">
          <p className="my-1">There was an issue publishing your post...</p>
          <FormControl as="textarea" rows={3} value={error.message} disabled={true} />
        </Card.Body>
      </Card>
    </div>
  );
}
