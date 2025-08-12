import './App.css';
import { useState, useEffect, useRef, use } from 'react';
import LockButton from './components/LockButton';
import Prover from './users/Prover';
import Verifier from './users/Verifier';
import Error from './components/Error';

var MAX_MESSAGES = 4;

// run on powershell  
function App() {
  const [age, setAge] = useState(-1);
  const [name, setName] = useState("");
  const [male, setMale] = useState(null);
  const [country, setCountry] = useState("");
  const [messages, setMessages] = useState({});
  const [submitPressed, setSubmitPressed] = useState(false);
  const [allMessages, setAllMessages] = useState({});

  const basePositions = {
    age: 0,
    name: 1,
    male: 2,
    country: 3
  };
  const [positions, setPositions] = useState({});

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const posRef = useRef(positions);
  useEffect(() => {
    posRef.current = positions;
  }, [positions]);

  const toggle = (value, name) => {
    console.log("Toggling value:", value, "for name:", name);
    if (!Object.keys(messages).includes(name)) {
      // add one message
      console.log("Adding message:", name);
      setMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
      const updatedPositions = {}
      for (let i = 0; i < Object.keys(posRef.current).length; i++) {
        const oldName = Object.keys(posRef.current)[i];
        updatedPositions[oldName] = i;
      }
      updatedPositions[name] = Object.keys(updatedPositions).length;
      setPositions(updatedPositions);
    } else {
      // delete one message
      console.log("Deleting message:", name);
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        delete updatedMessages[name];
        return updatedMessages;
      });

      // preserve position order
      const updatedPositions = { ...posRef.current };
      delete updatedPositions[name];
      for (let i = 0; i < Object.keys(updatedPositions).length; i++) {
        const oldName = Object.keys(updatedPositions)[i];
        updatedPositions[oldName] = i;
      }
      // console.log("Positions updated:", updatedPositions);

      setPositions(updatedPositions);
    }

    const allMsgList = { ...messagesRef.current };
    delete allMsgList[name];
    for (let i = 0; i < Object.keys(allMessages).length; i++) {
      const key = Object.keys(allMessages)[i];
      if (messages[key] === null) {
        allMsgList[key] = allMessages[key];
      }
    }
    allMsgList[name] = value;
    console.log("All messages to send:", allMsgList);
    setAllMessages(allMsgList);

    // if (!Object.keys(allMessages).includes(name) || allMessages[name] === null) {
    //   setAllMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
    // } else {
    //   // change message order
    //   const allMsgList = { ...messagesRef.current };
    //   delete allMsgList[name];
    //   for (let i = 0; i < Object.keys(allMessages).length; i++) {
    //     const key = Object.keys(allMessages)[i];
    //     if (messages[key] === null) {
    //       allMsgList[key] = allMessages[key];
    //     }
    //   }
    //   allMsgList[name] = value;
    //   console.log("All messages to send:", allMsgList);
    //   setAllMessages(allMsgList);
    // }
  };

  const checkCorrectAgeFormat = () => {
    const ageRegex = /^\d+$/;
    return ageRegex.test(age);
  };

  const checkCorrectNameFormat = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
  };

  const checkCorrectCountryFormat = () => {
    const countryRegex = /^[\w\s]+$/;
    return countryRegex.test(country);
  };

  const checkSexEntered = () => {
    return male !== null;
  };

  const checkCorrectMessageFormat = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const ageRegex = /^\d+$/;
    const countryRegex = /^[\w\s]+$/;

    if (!nameRegex.test(name)) {
      console.error("Invalid name format");
      return false;
    } else if (!ageRegex.test(age) || age < 0) {
      console.error("Invalid age format");
      return false;
    } else if (!countryRegex.test(country)) {
      console.error("Invalid country format");
      return false;
    } else if (male !== true && male !== false) {
      console.error("Sex not chosen");
      return false;
    }
    return true;
  }

  const sendMessages = () => {
    // Send messages to the prover
    setSubmitPressed(true);

    // sort out all messages order
    // const allMsgList = { ...messagesRef.current };
    // for (let i = 0; i < Object.keys(allMessages).length; i++) {
    //   const key = Object.keys(allMessages)[i];
    //   if (messages[key] === null) {
    //     allMsgList[key] = allMessages[key];
    //   }
    // }
    // console.log("All messages to send:", allMsgList);

    if (checkCorrectMessageFormat()) {
      const event = new CustomEvent('sendMessages', { detail: { messages: allMessages, positions: posRef.current } });
      document.dispatchEvent(event);
    }
  }

  const changeValue = (name, value) => {
    if (Object.keys(messages).includes(name)) {
      setMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
      setAllMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
    }
  };

  useEffect(() => {
    console.log("All messages updated:", allMessages);
  }, [allMessages]);

  useEffect(() => {
    // console.log("Messages updated:", messages);
  }, [messages]);


  useEffect(() => {
    // console.log("Positions updated:", positions);
  }, [positions]);

  return (
    <div className="App">
      <h1>Enter yo shiet:</h1>
      <div className="credentialContainer">
        <form className="list" onSubmit={(e) => e.preventDefault()}>
          <div className="claimBox age">
            <h3>Age</h3>
            <input type="text" onChange={(e) => { setAge(e.target.value); changeValue("age", String(e.target.value)) }} />
            <LockButton toggle={toggle} value={age} name={"age"} id={0} />
          </div>
          {!checkCorrectAgeFormat() && submitPressed && <Error message={"Invalid age format"}></Error>}
          <div className="claimBox name">
            <h3>Name</h3>
            <input type="text" onChange={(e) => { setName(e.target.value); changeValue("name", String(e.target.value)) }} />
            <LockButton toggle={toggle} value={name} name={"name"} id={1} />
          </div>
          {!checkCorrectNameFormat() && submitPressed && <Error message={"Invalid name format"}></Error>}
          <div className="claimBox sex">
            <input type="radio" onChange={() => { setMale(true); changeValue("male", "1") }} checked={male === true} />
            <h3>Male</h3>
            <input type="radio" onChange={() => { setMale(false); changeValue("male", "0") }} checked={male === false} />
            <h3>Female</h3>
            <LockButton toggle={toggle} value={male ? "1" : "0"} name={"male"} id={2} />
          </div>
          {!checkSexEntered() && submitPressed && <Error message={"Sex not chosen"}></Error>}
          <div className="claimBox country">
            <h3>Country</h3>
            <input type="text" onChange={(e) => { setCountry(e.target.value); changeValue("country", String(e.target.value)) }} />
            <LockButton toggle={toggle} value={country} name={"country"} id={3} />
          </div>
          {!checkCorrectCountryFormat() && submitPressed && <Error message={"Invalid country format"}></Error>}
          <input type="submit" value="Submit" onClick={async () => sendMessages()} />
        </form>
      </div>
      <Prover messages={messages} positions={positions} basePos={basePositions} allMessages={allMessages} />
      <Verifier />
    </div>
  );
}

export default App;
