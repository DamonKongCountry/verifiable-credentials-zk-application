import './../App.css';
import {
  blsVerify,
  blsVerifyProof,
} from "@mattrglobal/bbs-signatures";
import { useEffect } from 'react';

// import { Amplify } from "aws-amplify";
// import awsExports from "./aws-exports";
// Amplify.configure(awsExports);

const myAPI = "api533f5e87";
const path = "/userId";

function Verifier() {
  // Verification logic goes here
  useEffect(() => {
    const sigHandler = async (event) => {
      console.log("Received verification request:", event.detail);
      const isValid = await blsVerify({ messages: event.detail.messages, publicKey: event.detail.publicKey, signature: event.detail.signature });
      // console.log("Signature verification result:", isValid);
      const resultEvent = new CustomEvent('verifySigResult', { detail: { isValid } });
      document.dispatchEvent(resultEvent);
    };

    const proofHandler = async (event) => {
      console.log("Received proof verification request:", event.detail);
      const isValid = await blsVerifyProof({ proof: event.detail.proof, publicKey: event.detail.publicKey, messages: event.detail.messages, nonce: event.detail.nonce });
      console.log("Proof verification result:", isValid);
      const resultEvent = new CustomEvent('verifyProofResult', { detail: { isValid } });
      document.dispatchEvent(resultEvent);
    };

    document.addEventListener('verifySigSend', sigHandler);
    document.addEventListener('verifyProofSend', proofHandler);
    return () => {
      document.removeEventListener('verifySigSend', sigHandler);
      document.removeEventListener('verifyProofSend', proofHandler);
    };
  }, [])

  return (
    <div>
      {/* Add UI elements for verification */}
    </div>
  );
}

export default Verifier;