import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { useHistory } from "react-router";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:5000";

export default function Home() {
  const history = useHistory();
  const nameRef = useRef();
  const roomRef = useRef();
  const [error, setError] = useState("");

  const login = (e) => {
    e.preventDefault();

    const name = nameRef.current.value;
    const room = roomRef.current.value;

    if (!name || !room) return;

    axios
      .post("login", { name, room })
      .then((res) => {
        history.push(`chat?name=${name}&room=${room}`);
      })
      .catch((err) => {
        setError(err.response.data);
      });
  };

  useEffect(() => {
    const state = history.location.state;
    if (state) state.error && setError(state.error);
  }, [history.location.state]);

  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center my-container"
      style={{ height: "100vh" }}
    >
      {error && (
        <Alert variant="danger" style={{ width: "300px" }}>
          Error !
        </Alert>
      )}

      <Card style={{ width: "300px" }}>
        <Card.Body>
          <Card.Title>Login</Card.Title>
          <Form onSubmit={login}>
            <Form.Group>
              <Form.Label>Enter Name</Form.Label>
              <Form.Control
                required
                isInvalid={error}
                type="text"
                ref={nameRef}
              />
              {error && <Form.Text className="text-danger">{error}</Form.Text>}
            </Form.Group>
            <Form.Group>
              <Form.Label>Enter Room</Form.Label>
              <Form.Control required type="text" ref={roomRef} />
            </Form.Group>
            <Form.Group>
              <Button type="submit" className="w-100">
                Enter
              </Button>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
