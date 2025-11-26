import '../App.css';
import Error from "../components/Error";
import Prover from '../users/Prover';
import Verifier from '../users/Verifier';

import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
// import { randomBytes } from '@noble/post-quantum/utils';

import { ApiError, get } from "aws-amplify/api";


const crypto = require("crypto");
const mailChecker = require('mailchecker');
const issuerAPI = "api533f5e87";

export default function Register() {
  const [age, setAge] = useState(-1);
  const [name, setName] = useState("");
  const [male, setMale] = useState(null);
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [submitPressed, setSubmitPressed] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [allMessages, setAllMessages] = useState({
    age: -1,
    name: '',
    male: null,
    country: ''
  });

  const MODE = "register";
  const loadingSize = "50";
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

  const checkCorrectEmailFormat = () => {
    return mailChecker.isValid(email)
  }

  const checkCorrectMessageFormat = () => {
    return checkSexEntered() && checkCorrectAgeFormat() && checkCorrectCountryFormat() && checkCorrectNameFormat() && checkCorrectEmailFormat();
  }

  const login = async () => {
    // Send messages to the prover
    setSubmitPressed(true);
    setSubmitLoading(true);
    console.log({
      email: email,
      name: name,
      age: age,
      country: country,
      male: male
    })
    if (checkCorrectMessageFormat()) {
      // call API

      try {
        const restOperation = get({
          apiName: issuerAPI,
          path: '/vcUserId-dev',
          options: {
            retryStrategy: {
              strategy: 'no-retry' // Overrides default retry strategy
            },
            queryParams: {
              email: email,
              name: name,
              age: age,
              country: country,
              male: male
            }
          }
        });
        let response = await restOperation.response;
        console.log('base response =', response)
        if (response.statusCode === 200) {
          response = await response.body.json();
          console.log('GET call succeeded: ', response);

          // check if user details are correct within the api, only if statusCode is 200
          //get data from the "proper" key
          for (const [form, data] of Object.entries(response)) {
            localStorage.setItem(form + "Pk", Object.values(data.publicKey));
            localStorage.setItem(form + "Sig", Object.values(data.signature));
          }

          // set localStorage values
          console.log("Login successful, navigating to home page.");
          localStorage.setItem("token", crypto.randomBytes(32));
          localStorage.setItem("email", email);

          // navigate to verification page
          navigate("/home");
        } else {
          setAuthError('Status code not 200');
        }
      } catch (error) {
        console.log('GET call failed: ', error);
        setAuthError('GET call failed');
      }
    }
    setSubmitLoading(false);
  }

  return (
    <div className="background">
      <h1 className="pageTitle">Register</h1>
      <div className="pageContents">
        <div className="credentialContainer login">
          <form className="list" onSubmit={(e) => e.preventDefault()}>
            <div className="claimBox email">
              <h3>Email</h3>
              <input className="formInput" type="email" onChange={(e) => { setEmail(e.target.value); changeValue("email", String(e.target.value)) }} />
            </div>
            {!checkCorrectEmailFormat() && submitPressed && <Error message={"Invalid email format"}></Error>}
            <div className="claimBox age">
              <h3>Age:</h3>
              <input className="formInput" type="text" onChange={(e) => { setAge(e.target.value); changeValue("age", String(e.target.value)) }} />
            </div>
            {!checkCorrectAgeFormat() && submitPressed && <Error message={"Invalid age format"}></Error>}
            <div className="claimBox name">
              <h3>Name:</h3>
              <input className="formInput" type="text" onChange={(e) => { setName(e.target.value); changeValue("name", String(e.target.value)) }} />
            </div>
            {!checkCorrectNameFormat() && submitPressed && <Error message={"Invalid name format"}></Error>}
            <div className="claimBox sex">
              <input type="radio" onChange={() => { setMale(true); changeValue("male", true) }} checked={male === true} />
              <h3>Male:</h3>
              <input type="radio" onChange={() => { setMale(false); changeValue("male", false) }} checked={male === false} />
              <h3>Female</h3>
            </div>
            {!checkSexEntered() && submitPressed && <Error message={"Sex not chosen"}></Error>}
            <div className="claimBox country">
              <h3>Country:</h3>
              <input className="formInput" type="text" onChange={(e) => { setCountry(e.target.value); changeValue("country", String(e.target.value)) }} />
            </div>
            {!checkCorrectCountryFormat() && submitPressed && <Error message={"Invalid country format"}></Error>}
            <input className={submitLoading ? "formDisabled" : "formSubmit"} type="submit" disabled={submitLoading} value="Submit" onClick={async () => login()} />
            {submitLoading && <div className="loadingContainer">
              <div className="loadingIcon" />
            </div>}
            {authError.length !== 0 && <Error message={authError}></Error>}
          </form>
        </div>
      </div>
    </div>
  );
}