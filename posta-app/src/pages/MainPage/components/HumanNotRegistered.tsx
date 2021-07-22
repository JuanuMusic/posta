import { Card, Container, Spinner } from "react-bootstrap";

interface IHumanNotRegisteredProps {
  isLoading: boolean;
}

export default function HumanNotRegistered(props: IHumanNotRegisteredProps) {
  return (
    <Container className="p-0">
      <Card bg="dark">
        {props.isLoading && (
          <div
            className="bg-dark-85 d-flex justify-content-center align-items-center"
            style={{
              position: "absolute",
              zIndex: 10,
              height: "100%",
              width: "100%",
            }}
          >
            <Card style={{ opacity: 1 }}>
              <Card.Body className="d-flex justify-content-around align-items-center text-dark">
                <Spinner animation="border" className="mr-2" /> Validating
                humanity...
              </Card.Body>
            </Card>
          </div>
        )}
        <Container className="text-light px-4 py-2">
          <h3 className="text-warning">Prove your humanity</h3>
          <p>
            It looks like you are not registered on Kovan's Proof of Humanity. </p><p>Go to <a href="https://app-kovan.poh.dev/" className="text-warning">Kovans's Proof of Humanity</a> and register your rightfully owned Kovan identity.<br />
            <small className="text-warning">
              (if you are registered, make sure to select the right account)
            </small>
          </p>
        </Container>
      </Card>
    </Container>
  );
}
