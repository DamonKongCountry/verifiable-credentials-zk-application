import './App.css';
import {
  generateBls12381G2KeyPair,
  blsSign,
  blsVerify,
  blsCreateProof,
  blsVerifyProof,
  sign,
} from "@mattrglobal/bbs-signatures";
import React, { useState, useEffect } from 'react';
import LockButton from './components/LockButton';

// run on powershell  
function App() {
  const [keyPair, setKeyPair] = useState(null);
  const [age, setAge] = useState(-1);
  const [name, setName] = useState("");
  const [male, setMale] = useState(true);
  const [country, setCountry] = useState("");
  const [messages, setMessages] = useState({});
  const credentialSize = 4; // Example size, adjust as needed
  const sentDetails = ["age", "name"];

  const toggle = (value, name) => {
    if (!messages[name]) {
      setMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
    } else {
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        delete updatedMessages[name];
        return updatedMessages;
      });
    }
  };

  useEffect(() => {
    const processMessage = async () => {
      if (!keyPair) {
        console.log("Key pair not set.");
        return;
      } else if (Object.keys(messages).length === 0) {
        console.log("No messages to sign.");
      }
      if (keyPair.secretKey) {
        try {
          const fMessages = [];
          for (const value of Object.values(messages)) {
            fMessages.push(Uint8Array.from(Buffer.from(value, "utf-8")));
          }
          console.log("fMessages:", fMessages);
          const signature = await blsSign({keyPair, messages: fMessages});
          console.log("Signature:", signature);
          if (keyPair.publicKey) {
            try {
              const isValid = await blsVerify({messages: fMessages, publicKey: keyPair.publicKey, signature});
              console.log("Signature valid:", isValid);
              processProof(signature).then((result) => {
                console.log("Proof is Done:", result);
              });
            } catch (error) {
              console.error("Verification error:", error);
              return;
            }
          }
        } catch (error) {
          console.error("Signing error:", error);
          return;
        }
      }
    };

    const processProof = async (signature) => {
      if (!keyPair || Object.keys(messages).length === 0) {
        console.log("Key pair or message not set for proof.");
        return false;
      }
      
      if (keyPair.secretKey && keyPair.publicKey) {
        let isProofValid = false;
        try {
          const fMessages = [];
          // console.log("sentDetails: ", sentDetails);
          // console.log("messages keys: ", Object.keys(messages));
          for (const [key, value] of Object.entries(messages)) {
            if (sentDetails.find((k) => k === key) != -1) {
              console.log("Adding message for proof:", key, value);
              fMessages.push(Uint8Array.from(Buffer.from(value, "utf-8")));
            }
          }
          // console.log("fMessages for proof:", fMessages);
          if (fMessages.length === 0) {
            console.log("No messages to create proof.");
            return false;
          }
          console.log("stuff = ", signature, " ", fMessages, " ", keyPair.secretKey);
          
          // Get all original messages for proof creation
          const allMessages = [];
          for (const value of Object.values(messages)) {
            allMessages.push(Uint8Array.from(Buffer.from(value, "utf-8")));
          }
          
          const proof = await blsCreateProof({
            signature, 
            publicKey: keyPair.publicKey,
            messages: allMessages,  // Use all original messages
            nonce: Uint8Array.from(Buffer.from("nonce", "utf8")),
            revealed: [0, 1]  // Reveal only the first message (age)
          });
          console.log("Proof created:", proof);
          
          if (keyPair.publicKey) {
            try {
              isProofValid = await blsVerifyProof({
                proof,
                publicKey: keyPair.publicKey,
                messages: fMessages,  // Only the revealed messages
                nonce: Uint8Array.from(Buffer.from("nonce", "utf8"))
              });
              console.log("Proof valid:", isProofValid);
            } catch (error) {
              console.error("Proof verification error:", error);
              return false;
            }
          }
        } catch (error) {
          console.error("Proof creation error:", error);
          return false;
        }
        return isProofValid;
      }
      return false;
    };
    
    processMessage();
    
  }, [keyPair]);
  
  useEffect(() => {
    if (Object.keys(messages).length > 0) {
      console.log("Messages updated:", messages);
    }
  }, [messages]);

  const keyGenerated = async () => {
    const pair = await generateBls12381G2KeyPair();
    console.log("Key Pair Generated:", pair);
    setKeyPair(pair);
  };

  return (
    <div className="App">
      <h1>Enter your age:</h1>
      <div className="credentialContainer">
        <form className="list" onSubmit={(e) => e.preventDefault()}>
          <div className="claimBox age">
            <h3>Age</h3>
            <input type="text" onChange={(e) => setAge(e.target.value)}/>
            <LockButton toggle={toggle} value={age} name={"age"}/>
          </div>
          <div className="claimBox name">
            <h3>Name</h3>
            <input type="text" onChange={(e) => setName(e.target.value)}/>
            <LockButton toggle={toggle} value={name} name={"name"}/>
          </div>
          <div className="claimBox sex">
            <input type="radio" onChange={() => setMale(true)}/>
            <h3>Male</h3>
            <input type="radio" onChange={() => setMale(false)}/>
            <h3>Female</h3>
            <LockButton toggle={toggle} value={male} name={"male"}/>
          </div>
          <div className="claimBox country">
            <h3>Country</h3>
            <input type="text" onChange={(e) => setCountry(e.target.value)}/>
            <LockButton toggle={toggle} value={country} name={"country"}/>
          </div>
          <input type="submit" value="Submit" onClick={async () => keyGenerated()}/>
        </form>
        <div className="list">
          
          
          
          
        </div>
      </div>
      
    </div>
  );
}

export default App;
