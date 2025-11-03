import '../App.css';
import { useState, useEffect, useRef } from 'react';
import LockButton from '../components/LockButton';
import Prover from '../users/Prover';
import Verifier from '../users/Verifier';
import Error from '../components/Error';
import AccountForm from '../components/AccountForm';
import PassportForm from '../components/PassportForm';
import DriversLicenceForm from '../components/DriversLicenceForm';

import { useNavigate } from 'react-router';
import { blsCreateProof, generateBls12381G2KeyPair, blsSign, blsVerify, BBS_SIGNATURE_LENGTH, blsVerifyProof } from '@mattrglobal/bbs-signatures';

import { Amplify, API } from "aws-amplify";
import { post, get } from "aws-amplify/api";
// import amplifyconfig from './amplifyconfiguration.json';
// Amplify.configure(amplifyconfig);

const verifyAPI = "verifierapi9ad310";
const mailChecker = require('mailchecker');

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
  const [verified, setVerified] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [])

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
    let improperMessages = {};
    //console.log(localStorage.getItem("accPk"));
    //console.log(localStorage.getItem("accSig"));
    try {
      // convert this into an object with indexes
      // we need to convert the pk and sig to the uint8array TYPE
      switch (formType) {
        case "acc":
          pk = localStorage.getItem("accPk");
          sig = localStorage.getItem("accSig");
          improperMessages = localStorage.getItem("orderArrAcc").split(",");
          // console.log(improperMessages.entries())
          break;
        case "drivers":
          pk = localStorage.getItem("driverPk");
          sig = localStorage.getItem("driverSig");
          improperMessages = localStorage.getItem("orderArrDriver").split(",");
          break;
        case "pass":
          pk = localStorage.getItem("passPk");
          sig = localStorage.getItem("passSig");
          improperMessages = localStorage.getItem("orderArrPass").split(",");
          break;
        default:
          console.log("Invalid formType!");
      }
      const revertedPk = {};
      for (const [index, value] of pk.split(",").entries()) {
        revertedPk[index] = atob(value).charCodeAt(0);
      }
      //console.log("rpk =", revertedPk)
      pk = Uint8Array.from(Object.values(revertedPk))

      const revertedSig = {};
      for (const [index, value] of sig.split(",").entries()) {
        revertedSig[index] = atob(value).charCodeAt(0);
      }
      //console.log("rsig =", revertedSig)
      sig = Uint8Array.from(Object.values(revertedSig))

      //console.log("rsig =", sig)
      //console.log("rpk =", pk)
    } catch (err) {
      console.error('Error restoring pk/sig:', err);
      setSubmitLoading(false);
      setVerificationError(true);
      return;
    }

    const keyPair = await generateBls12381G2KeyPair();
    let fMessages = []
    for (const msg of Object.values(messages)) {
      fMessages.push(Uint8Array.from(Buffer.from(String(msg), "utf8")))
    }

    // const eMessages = [
    //   Uint8Array.from(Buffer.from("message1", "utf-8")),
    //   Uint8Array.from(Buffer.from("message2", "utf-8")),
    // ];
    //console.log("improper msgs =", improperMessages);
    const signature = await blsSign({
      keyPair: keyPair,
      messages: fMessages,
    });
    const isVerified = await blsVerify({
      publicKey: keyPair.publicKey,
      messages: fMessages,
      signature: signature,
    });
    if (!isVerified.verified) {
      console.log("Proof not verified")
      setVerificationError(true);
    }
    //console.log("verified =", isVerified.verified)
    const nonce = Uint8Array.from(Buffer.from("nonce", "utf8"));
    //console.log(typeof (pk) === typeof (keyPair.publicKey));
    //console.log(typeof (sig) === typeof (signature));
    for (const i in pk) {
      if (typeof (pk[i]) !== typeof (keyPair.publicKey[i])) {
        console.log("Inconsisent pk");
        break;
      }
    }
    for (const i in sig) {
      if (typeof (sig[i]) !== typeof (signature[i])) {
        console.log("Inconsisent sig");
        break;
      }
    }
    //console.log("pk =", pk, "\nkeyPair =", keyPair.publicKey, "local pk =", localStorage.getItem("accPk"), "\nsig =", sig, "\nsignature =", signature, "\nlocal sig =", localStorage.getItem("accSig"))
    //console.log("pos =", positions, "msgs =", fMessages);

    // crafted signature and keyPair.publicKey works
    const testProof = await blsCreateProof({ signature: signature, publicKey: keyPair.publicKey, messages: fMessages, revealed: positions, nonce: nonce })
    //console.log("test proof created =", testProof);
    const rMessages = [];
    for (const [k, v] of fMessages.entries()) {
      // console.log(k)
      if (k in positions) {
        rMessages.push(v)
      }
    }
    // console.log("rMessages =", rMessages, "\nfMessages =", fMessages);
    //console.log("proof =", testProof, "kP =", keyPair.publicKey, "msgs =", rMessages, "nonce =", nonce);
    const testVerified = await blsVerifyProof({ proof: testProof, publicKey: keyPair.publicKey, messages: rMessages, nonce: nonce })
    //const properProof = await blsCreateProof({ signature: sig, publicKey: pk, messages: fMessages, revealed: positions, nonce: nonce })
    // console.log("proper proof created =", properProof);

    //console.log(testVerified.verified);
    if (testProof && keyPair.publicKey) {
      // send to API
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
              proof: testProof,
              publicKey: keyPair.publicKey,
              nonce: nonce,
              email: 'damon.k.crowley@gmail.com',
              localVerified: testVerified,
            }
          },
        });
        const body = await restOperation.response;
        //console.log("BODY =", body);
        const response = await body.body.json();

        console.log('POST call succeeded');

        // here is what is actually running
        if (positions.length === 0) {
          setVerificationError(true);
          setVerified(false);
          setSubmitLoading(false);
          return;
        }
        for (const k in Object.keys(messages)) {
          console.log("Checking:", String(Object.values(messages)[k]), "and", String(improperMessages[k]))
          if (!(String(Object.values(messages)[k]) === String(improperMessages[k])) && positions.includes(Number(k))) {
            setVerificationError(true);
            setVerified(false);
            setSubmitLoading(false);
            return;
          }
        }

        console.log(response);
        if (response) {
          setVerificationError(false)
          setVerified(true);
          setSubmitLoading(false);
        }
      } catch (error) {
        console.log('POST call failed');
        setVerificationError(false);
        setSubmitLoading(false);
      }
    }



    // what would've happened in the old model (NOT FUNCTIONAL ANYMORE)
    // const event = new CustomEvent('verifyMessages', { detail: { messages: messages, positions: positions } });
    // document.dispatchEvent(event);
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
      <h1 className="pageTitle">Verify credentials</h1>
      <div className="pageContents verify">
        <div className="credentialList">
          <ul>
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
            // <form className="list" onSubmit={(e) => e.preventDefault()}>
            //   <div className="claimBox email">
            //     <h3>Email</h3>
            //     <input className="formInput" type="text" onChange={(e) => { setEmail(e.target.value); changeValue("email", String(e.target.value)) }} />
            //   </div>
            //   {!checkCorrectEmailFormat() && submitPressed && <Error message={"Invalid email format"}></Error>}
            //   <div className="claimBox age">
            //     <h3>Age</h3>
            //     <input className="formInput" type="text" onChange={(e) => { setAge(e.target.value); changeValue("age", String(e.target.value)) }} />
            //     <LockButton toggle={toggle} value={age} name={"age"} spot={0} />
            //   </div>
            //   {!checkCorrectAgeFormat() && submitPressed && <Error message={"Invalid age format"}></Error>}
            //   <div className="claimBox name">
            //     <h3>Name</h3>
            //     <input className="formInput" type="text" onChange={(e) => { setName(e.target.value); changeValue("name", String(e.target.value)) }} />
            //     <LockButton toggle={toggle} value={name} name={"name"} spot={1} />
            //   </div>
            //   {!checkCorrectNameFormat() && submitPressed && <Error message={"Invalid name format"}></Error>}
            //   <div className="claimBox sex">
            //     <input type="radio" onChange={() => { setMale(true); changeValue("male", "1") }} checked={male === true} />
            //     <h3>Male</h3>
            //     <input type="radio" onChange={() => { setMale(false); changeValue("male", "0") }} checked={male === false} />
            //     <h3>Female</h3>
            //     <LockButton toggle={toggle} value={male ? "1" : "0"} name={"male"} spot={2} />
            //   </div>
            //   {!checkSexEntered() && submitPressed && <Error message={"Sex not chosen"}></Error>}
            //   <div className="claimBox country">
            //     <h3>Country</h3>
            //     <input className="formInput" type="text" onChange={(e) => { setCountry(e.target.value); changeValue("country", String(e.target.value)) }} />
            //     <LockButton toggle={toggle} value={country} name={"country"} spot={3} />
            //   </div>
            //   {!checkCorrectCountryFormat() && submitPressed && <Error message={"Invalid country format"}></Error>}
            //   <input className="formSubmit" type="submit" value="Submit" onClick={async () => sendMessages()} />
            // </form>
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
          {verificationError && !verified && <Error message={"Verification Error"} main={true} />}
          {verified && !verificationError && <h3 className='proverMsg'>Messages verified!</h3>}
        </div>
        <Prover positions={positions} allMessages={allMessages} mode={"verify"} />
        <Verifier />
      </div>
    </div>
  );
}