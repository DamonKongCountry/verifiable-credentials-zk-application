import "../App.css"
import { useState, useRef, useEffect } from "react";

import Error from "./Error";
import LockButton from "./LockButton";

const mailChecker = require('mailchecker');

export default function AccountForm({ sendMessages }) {
  const [age, setAge] = useState(-1);
  const [name, setName] = useState("");
  const [male, setMale] = useState(null);
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [submitPressed, setSubmitPressed] = useState(false);
  const [allMessages, setAllMessages] = useState({
    email: '',
    age: -1,
    name: '',
    male: null,
    country: ''
  });

  const [positions, setPositions] = useState([]);

  const posRef = useRef(positions);
  useEffect(() => {
    posRef.current = positions;
  }, [positions]);

  const toggle = (value, name, spot) => {
    console.log("Toggling value:", value, "for name:", name);
    const newPos = [...positions];
    console.log(newPos, spot);
    const foundIndex = newPos.indexOf(spot)
    if (foundIndex !== -1) {
      newPos.splice(foundIndex, 1);
    } else {
      newPos.push(spot)
    }
    console.log(newPos);
    setPositions(newPos);

    // maintain allMessages' base format
    setAllMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
  };

  const checkCorrectEmailFormat = () => {
    return mailChecker.isValid(email)
  }

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

  const submitPress = () => {
    setSubmitPressed(true);
    return checkCorrectMessageFormat()
  }

  const changeValue = (name, value) => {
    setAllMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
  };

  return (
    <form className="list" onSubmit={(e) => e.preventDefault()}>
      <div className="claimBox email">
        <h3 className="formLabel">Email:</h3>
        <input className="formInput" type="email" onChange={(e) => { setEmail(e.target.value); changeValue("email", String(e.target.value)) }} />
        <div className="formToggle">
          <LockButton toggle={toggle} value={age} name={"age"} spot={0} />
        </div>
      </div>
      {!checkCorrectEmailFormat() && submitPressed && <Error message={"Invalid email format"}></Error>}
      <div className="claimBox age">
        <h3 className="formLabel">Age:</h3>
        <input className="formInput" type="number" onChange={(e) => { setAge(e.target.value); changeValue("age", String(e.target.value)) }} />
        <div className="formToggle">
          <LockButton toggle={toggle} value={age} name={"age"} spot={1} />
        </div>
      </div>
      {!checkCorrectAgeFormat() && submitPressed && <Error message={"Invalid age format"}></Error>}
      <div className="claimBox name">
        <h3 className="formLabel">Name:</h3>
        <input className="formInput" type="text" onChange={(e) => { setName(e.target.value); changeValue("name", String(e.target.value)) }} />
        <div className="formToggle">
          <LockButton toggle={toggle} value={name} name={"name"} spot={2} />
        </div>
      </div>
      {!checkCorrectNameFormat() && submitPressed && <Error message={"Invalid name format"}></Error>}
      <div className="claimBox sex">
        <h3>Sex:</h3>
        <input type="radio" onChange={() => { setMale(true); changeValue("male", true) }} checked={male === true} />
        <h3 className="formLabel">Male</h3>
        <input type="radio" onChange={() => { setMale(false); changeValue("male", false) }} checked={male === false} />
        <h3>Female</h3>
        <div className="formToggle">
          <LockButton toggle={toggle} value={male ? true : false} name={"male"} spot={3} />
        </div>
      </div>
      {!checkSexEntered() && submitPressed && <Error message={"Sex not chosen"}></Error>}
      <div className="claimBox country">
        <h3 className="formLabel">Country:</h3>
        <input className="formInput" type="text" onChange={(e) => { setCountry(e.target.value); changeValue("country", String(e.target.value)) }} />
        <div className="formToggle">
          <LockButton toggle={toggle} value={country} name={"country"} spot={4} />
        </div>
      </div>
      {!checkCorrectCountryFormat() && submitPressed && <Error message={"Country not chosen"}></Error>}
      <input className="formSubmit" type="submit" value="Submit" onClick={async () => { submitPress() && sendMessages(allMessages, positions, "acc") }} />
    </form>
  )
}