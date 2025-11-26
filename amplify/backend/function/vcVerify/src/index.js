/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
  blsVerify,
  blsVerifyProof,
} from "@mattrglobal/bbs-signatures";
 */

// the proof is made by the user and verified here
const { blsVerifyProof } = require('@mattrglobal/bbs-signatures');

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  console.log('EVENT RAW:', JSON.stringify(event || {}, null, 2));

  // NOTE
  // ==========================================================================
  // until we get the body/post method sorted out, I will be using query params
  // ==========================================================================

  const pMessages = JSON.parse(event.queryStringParameters.messages);
  let pPublicKey = event.queryStringParameters.publicKey.split(',').map((i) => Number(i));
  pPublicKey = Uint8Array.from(pPublicKey);
  let pProof = event.queryStringParameters.proof.split(',').map((i) => Number(i));
  pProof = Uint8Array.from(pProof);
  let pNonce = event.queryStringParameters.nonce.split(',').map((i) => Number(i));
  pNonce = Uint8Array.from(pNonce);

  nMessages = []
  for (const msg of pMessages) {
    nMessages.push(Uint8Array.from(Object.values(msg)))
  }
  if (nMessages.length === 0) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "OPTIONS,POST,GET" },
      body: JSON.stringify({ error: 'At least one message is required' }),
    };
  }

  // this block of code is causing errors
  if (!pMessages || !pPublicKey || !pProof) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "OPTIONS,POST,GET" },
      body: JSON.stringify({ error: 'Missing body request parameters' }),
    };
  }
  const isValid = await blsVerifyProof({ messages: nMessages, publicKey: pPublicKey, proof: pProof, nonce: pNonce });

  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify(isValid.verified),
  };
};
