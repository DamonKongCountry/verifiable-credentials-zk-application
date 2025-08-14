import '../App.css';
import Error from "../components/Error";
import Prover from '../users/Prover';
import Verifier from '../users/Verifier';

import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

export default function Register() {
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

  const MODE = "register";
  let navigate = useNavigate();

  const changeValue = (name, value) => {
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
      console.log("aaa");
      const event = new CustomEvent('sendMessages', { detail: { messages: allMessages } });
      document.dispatchEvent(event);
    }
  }

  useEffect(() => {
    const loginHandler = () => {
      console.log("Login successful, navigating to home page.");
      navigate("/home");
    }
    document.addEventListener('loginSuccessful', loginHandler);

    // DELETE LATER
    localStorage.clear();
    return () => {
      document.removeEventListener('loginSuccessful', loginHandler);
    };
  }, []);

  return (
    <div className="background">
      <h1 className="pageTitle">Register:</h1>
      <div className="credentialContainer">
        <form className="list" onSubmit={(e) => e.preventDefault()}>
          <div className="claimBox age">
            <h3>Age</h3>
            <input className="formInput" type="text" onChange={(e) => { setAge(e.target.value); changeValue("age", String(e.target.value)) }} />
          </div>
          {!checkCorrectAgeFormat() && submitPressed && <Error message={"Invalid age format"}></Error>}
          <div className="claimBox name">
            <h3>Name</h3>
            <input className="formInput" type="text" onChange={(e) => { setName(e.target.value); changeValue("name", String(e.target.value)) }} />
          </div>
          {!checkCorrectNameFormat() && submitPressed && <Error message={"Invalid name format"}></Error>}
          <div className="claimBox sex">
            <input type="radio" onChange={() => { setMale(true); changeValue("male", "1") }} checked={male === true} />
            <h3>Male</h3>
            <input type="radio" onChange={() => { setMale(false); changeValue("male", "0") }} checked={male === false} />
            <h3>Female</h3>
          </div>
          {!checkSexEntered() && submitPressed && <Error message={"Sex not chosen"}></Error>}
          <div className="claimBox country">
            <h3>Country</h3>
            <input className="formInput" type="text" onChange={(e) => { setCountry(e.target.value); changeValue("country", String(e.target.value)) }} />
          </div>
          {!checkCorrectCountryFormat() && submitPressed && <Error message={"Invalid country format"}></Error>}
          <input className="formSubmit" type="submit" value="Submit" onClick={async () => sendMessages()} />
        </form>
      </div>
      <Prover mode={MODE} allMessages={allMessages} />
      <Verifier />
    </div>
  );
}