import '../App.css';
import { useState, useEffect, useRef } from 'react';
import Prover from '../users/Prover';
import Verifier from '../users/Verifier';
import Error from '../components/Error';
import AccountForm from '../components/AccountForm';
import PassportForm from '../components/PassportForm';
import DriversLicenceForm from '../components/DriversLicenceForm';

import { useNavigate } from 'react-router';
import { blsCreateProof } from '@mattrglobal/bbs-signatures';

import { get } from "aws-amplify/api";
// import amplifyconfig from './amplifyconfiguration.json';
// Amplify.configure(amplifyconfig);

const verifyAPI = "verifierapi9ad310";

export default function Verify() {
  const [allMessages, setAllMessages] = useState({
    age: -1,
    name: '',
    male: null,
    country: ''
  });
  const [mode, setMode] = useState("account");

  const [credentialList, setCredentialList] = useState(["credentialAccount", "credentialDriversLicence", "credentialPassport"])
  const textFor = { "credentialAccount": "Account (Testing)", "credentialDriversLicence": "Driver's Licence", "credentialPassport": "Regular Passport" }

  // keep allMessages in this format
  const [positions, setPositions] = useState([]);
  const [verificationError, setVerificationError] = useState(false);
  const [errMsg, setErrMsg] = useState("Verification Error")
  const [verified, setVerified] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [])

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

  const sendMessages = async (messages, positions, formType) => {
    // Send messages to the prover
    //console.log(positions);
    //console.log(messages);
    setVerified(false);
    setVerificationError(false);
    setSubmitLoading(true);

    // create proof
    let pk = null;
    let sig = null;
    try {
      // convert this into an object with indexes
      // we need to convert the pk and sig to the uint8array TYPE
      switch (formType) {
        case "acc":
          pk = localStorage.getItem("accPk");
          sig = localStorage.getItem("accSig");
          break;
        case "drivers":
          pk = localStorage.getItem("driverPk");
          sig = localStorage.getItem("driverSig");
          break;
        case "pass":
          pk = localStorage.getItem("passPk");
          sig = localStorage.getItem("passSig");
          break;
        default:
          console.log("Invalid formType!");
      }
      const revertedPk = [];
      for (const num of pk.split(",")) {
        revertedPk.push(Number(num))
      }
      pk = Uint8Array.from(Object.values(revertedPk))

      const revertedSig = [];
      for (const num of sig.split(",")) {
        revertedSig.push(Number(num))
      }
      sig = Uint8Array.from(Object.values(revertedSig))
    } catch (err) {
      console.error('Error restoring pk/sig:', err);
      setErrMsg('Error Restoring Public Key or Signature')
      setSubmitLoading(false);
      setVerificationError(true);
      return;
    }
    let fMessages = []
    for (const msg of Object.values(messages)) {
      fMessages.push(Uint8Array.from(Buffer.from(String(msg), "utf8")))
    }

    const nonce = Uint8Array.from(Buffer.from("nonce", "utf8"));

    const rMessages = [];
    positions.sort();
    for (const [k, v] of fMessages.entries()) {
      if (positions.indexOf(k) !== -1) {
        rMessages.push(v)
      }
    }
    let properProof = null;
    try {
      properProof = await blsCreateProof({ signature: sig, publicKey: pk, messages: fMessages, revealed: positions, nonce: nonce })
    } catch (err) {
      console.error('Proof creation error:', err);
      setErrMsg('All details must be correct for proof creation')
      setSubmitLoading(false);
      setVerificationError(true);
      return;
    }

    if (properProof) {
      console.log("proper proof exists")
    }

    if (properProof && pk) {
      // send to API
      console.log(rMessages);
      try {
        const restOperation = get({
          apiName: verifyAPI,
          path: '/vcVerify-dev',
          options: {
            retryStrategy: {
              strategy: 'no-retry' // Overrides default retry strategy
            },
            queryParams: {
              messages: JSON.stringify(rMessages),
              proof: properProof,
              publicKey: pk,
              nonce: nonce,
              email: 'damon.k.crowley@gmail.com',
            }
          },
        });
        const body = await restOperation.response;
        const response = await body.body.json();

        console.log('GET call succeeded');

        console.log(response);

        setSubmitLoading(false);
        if (response) {
          setVerificationError(false);
          setVerified(true);
        } else {
          setVerificationError(true);
          setVerified(false);
        }
      } catch (error) {
        console.log('GET call failed');
        setErrMsg('GET Call Failed');
        setSubmitLoading(false);
        setVerificationError(true);
      }
    }
  }

  const changeCredential = (text) => {
    setVerificationError(false);
    setVerified(false);
    switch (text) {
      case "credentialAccount":
        setMode("account");
        break;
      case "credentialDriversLicence":
        setMode("drivers");
        break;
      case "credentialPassport":
        setMode("passport");
        break;
      default:
        console.log("Mode not found!")
    }
  };

  useEffect(() => {
    console.log("All Messages = ", allMessages);
  }, [allMessages])

  return (
    <div className="background">
      <h1 className="pageTitle">Verify Credentials</h1>
      <div className="pageContents verify">
        <div className="credentialListBox">
          <ul className="credentialList">
            <div className="divider"></div>
            {credentialList.map((item, index) => (
              <>
                <button className="buttonList" onClick={() => changeCredential(item)}>
                  <p key={index}>{textFor[item]}</p>
                </button>
                <div className="divider"></div>
              </>
            ))}
          </ul>
        </div>
        <div className="credentialContainer">
          {mode === "account" && (
            <AccountForm sendMessages={sendMessages} toggle={toggle} />
          )}
          {mode === "drivers" && (
            <DriversLicenceForm sendMessages={sendMessages} toggle={toggle} />
          )}
          {mode === "passport" && (
            <PassportForm sendMessages={sendMessages} toggle={toggle} />
          )}
          {submitLoading && <div className="loadingContainer">
            <div className="loadingIcon" />
          </div>}
          {verificationError && !verified && <Error message={errMsg} main={true} />}
          {verified && !verificationError && <h3 className='proverMsg'>Messages verified!</h3>}
        </div>
      </div>
    </div>
  );
}