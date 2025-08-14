import '../App.css';
import { useState, useEffect, useRef } from 'react';
import LockButton from '../components/LockButton';
import Prover from '../users/Prover';
import Verifier from '../users/Verifier';
import Error from '../components/Error';

export default function Verify() {
  const [age, setAge] = useState(-1);
  const [name, setName] = useState("");
  const [male, setMale] = useState(null);
  const [country, setCountry] = useState("");
  const [submitPressed, setSubmitPressed] = useState(false);
  const [allMessages, setAllMessages] = useState({
    age: -1,
    name: '',
    male: null,
    country: ''
  });

  // keep allMessages in this format
  const basePositions = {
    age: 0,
    name: 1,
    male: 2,
    country: 3
  };
  const [positions, setPositions] = useState([]);

  const MODE = "verify";

  const posRef = useRef(positions);
  useEffect(() => {
    posRef.current = positions;
  }, [positions]);

  const toggle = (value, name, spot) => {
    console.log("Toggling value:", value, "for name:", name);
    const newPos = [...positions];
    if (newPos.find(i => i === spot)) {
      newPos.pop(spot)
    } else {
      newPos.push(spot)
    }
    setPositions(newPos);

    // maintain allMessages' base format
    setAllMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
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
    return checkSexEntered() && checkCorrectAgeFormat() && checkCorrectCountryFormat() && checkCorrectNameFormat();
  }

  const sendMessages = () => {
    // Send messages to the prover
    setSubmitPressed(true);

    if (checkCorrectMessageFormat()) {
      const event = new CustomEvent('verifyMessages', { detail: { messages: allMessages, positions: posRef.current } });
      document.dispatchEvent(event);
    }
  }

  const changeValue = (name, value) => {
    setAllMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
  };

  useEffect(() => {
    console.log("All Messages = ", allMessages);
  }, [allMessages])

  return (
    <div className="App">
      <h1>Enter info:</h1>
      <div className="credentialContainer">
        <form className="list" onSubmit={(e) => e.preventDefault()}>
          <div className="claimBox age">
            <h3>Age</h3>
            <input type="text" onChange={(e) => { setAge(e.target.value); changeValue("age", String(e.target.value)) }} />
            <LockButton toggle={toggle} value={age} name={"age"} spot={0} />
          </div>
          {!checkCorrectAgeFormat() && submitPressed && <Error message={"Invalid age format"}></Error>}
          <div className="claimBox name">
            <h3>Name</h3>
            <input type="text" onChange={(e) => { setName(e.target.value); changeValue("name", String(e.target.value)) }} />
            <LockButton toggle={toggle} value={name} name={"name"} spot={1} />
          </div>
          {!checkCorrectNameFormat() && submitPressed && <Error message={"Invalid name format"}></Error>}
          <div className="claimBox sex">
            <input type="radio" onChange={() => { setMale(true); changeValue("male", "1") }} checked={male === true} />
            <h3>Male</h3>
            <input type="radio" onChange={() => { setMale(false); changeValue("male", "0") }} checked={male === false} />
            <h3>Female</h3>
            <LockButton toggle={toggle} value={male ? "1" : "0"} name={"male"} spot={2} />
          </div>
          {!checkSexEntered() && submitPressed && <Error message={"Sex not chosen"}></Error>}
          <div className="claimBox country">
            <h3>Country</h3>
            <input type="text" onChange={(e) => { setCountry(e.target.value); changeValue("country", String(e.target.value)) }} />
            <LockButton toggle={toggle} value={country} name={"country"} spot={3} />
          </div>
          {!checkCorrectCountryFormat() && submitPressed && <Error message={"Invalid country format"}></Error>}
          <input type="submit" value="Submit" onClick={async () => sendMessages()} />
        </form>
      </div>
      <Prover positions={positions} basePos={basePositions} allMessages={allMessages} mode={MODE} />
      <Verifier />
    </div>
  );
}