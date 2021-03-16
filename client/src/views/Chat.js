import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import io from "socket.io-client";
import {
  Button,
  Fade,
  FormControl,
  InputGroup,
  ListGroup,
  Modal,
} from "react-bootstrap";

let socket;
const ENDPOINT = "localhost:5000";

export default function Chat() {
  const location = useLocation();
  const history = useHistory();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const messageRef = useRef();
  const lastMsgRef = useRef();
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nameParam = params.get("name");
    const roomParam = params.get("room");

    socket = io(ENDPOINT);

    socket.emit("join", { name: nameParam, room: roomParam }, ({ error }) => {
      if (error) return console.log(error);

      setName(nameParam);
      setRoom(roomParam);
    });

    return () => {
      socket.off();
    };
  }, [location.search]);

  useLayoutEffect(() => {
    console.log("layoutEffect()");
    if (lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    socket.on("message", (incomingMessage) => {
      setMessages([...messages, incomingMessage]);
    });
  }, [messages]);

  useEffect(() => {
    socket.on("roomInfo", (usersInRoom) => {
      setUsersInRoom(usersInRoom);
    });
  }, []);

  const exit = () => {
    socket.disconnect();
    history.push("");
  };

  const sendMessage = () => {
    const msg = messageRef.current.value.trim();

    if (!msg) return;

    socket.emit(
      "sendMessage",
      {
        message: msg,
      },
      ({ error }) => {
        if (error) return console.error(error);

        messageRef.current.value = "";
      }
    );
  };

  return (
    <div className="position-absolute vh-100 vw-100 bg-info">
      <Fade in={Boolean(name && room)}>
        <Modal.Dialog centered size="lg">
          <Modal.Header closeButton onHide={exit}>
            <Modal.Title className="text-muted">{`Room ${room} (${name})`}</Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ height: "400px" }}>
            <div className="d-flex">
              <div className="d-flex flex-column w-75 ">
                <div
                  className=" overflow-auto pr-2 m-1"
                  style={{ height: "296px" }}
                >
                  {messages.map((msg, index) => {
                    const itsMe = msg.sender === name;
                    const lastMsg = messages.length - 1 === index;

                    return (
                      <div
                        ref={lastMsg ? lastMsgRef : null}
                        key={index}
                        className={`d-flex flex-column  mb-3 ${
                          itsMe ? "align-items-end" : "align-items-start"
                        }`}
                      >
                        <div>
                          <div
                            className={`p-2 rounded  ${
                              itsMe
                                ? "text-info bg-white border border-info"
                                : "bg-info text-white"
                            }`}
                          >{`${msg.message}`}</div>
                          <div
                            className={`text-muted ${itsMe && "text-right"}`}
                          >{`${itsMe ? "Me" : msg.sender}`}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <InputGroup className="mt-4">
                  <FormControl
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    ref={messageRef}
                    placeholder="Type your message here..."
                    style={{ height: "40px" }}
                  />
                  <InputGroup.Append>
                    <Button onClick={sendMessage} variant="info">
                      Send
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </div>
              <div className="w-25 px-3 text-muted border-left ml-3">
                <div className="pl-2 text-info text-center h4">Online</div>

                <ListGroup variant="flush">
                  {usersInRoom.map((user, index) => {
                    return (
                      <ListGroup.Item className="text-center" key={user}>
                        {user}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </div>
            </div>
          </Modal.Body>

          {/*<Modal.Footer>*/}
          {/*  <InputGroup className="mb-3">*/}
          {/*    <FormControl*/}
          {/*      onKeyPress={(e) => e.key === "Enter" && sendMessage()}*/}
          {/*      ref={messageRef}*/}
          {/*      placeholder="Type your message here..."*/}
          {/*      style={{ height: "40px" }}*/}
          {/*    />*/}
          {/*    <InputGroup.Append>*/}
          {/*      <Button onClick={sendMessage} variant="info">*/}
          {/*        Send*/}
          {/*      </Button>*/}
          {/*    </InputGroup.Append>*/}
          {/*  </InputGroup>*/}
          {/*</Modal.Footer>*/}
        </Modal.Dialog>
      </Fade>
    </div>
  );
}
