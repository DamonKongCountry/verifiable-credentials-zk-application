/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
// this is /userId
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { blsSign, blsVerify, generateBls12381G2KeyPair, blsCreateProof, blsVerifyProof } = require('@mattrglobal/bbs-signatures');

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const accDb = "verifiable-credentials-zk-login-dynamodb";
const passportDb = "verifiable-credentials-zk-passport-dynamodb";
const driverLicenceDb = "verifiable-credentials-zk-drivers-dynamodb";

// handle retrieving and deleting user data only 
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  // ORDER IS IMPORTANT FOR SIGNATURES
  const orderAcc = [
    "email",
    "age",
    "name",
    "male",
    "country",
  ]
  const orderPassport = [
    'type',
    'issueCode',
    'name',
    'nationality',
    'dob',
    'male',
    'issueDate',
    'expiry',
    'authority',
    'country',
    'state',
    'city',
    'documentNo'
  ]
  const orderDriverLicence = [
    "licenceClass",
    "name",
    "cardNo",
    "licenceNo",
    "dob",
    "expiry",
    "rearNo",
    "country",
  ];

  // improper
  let orderArrAcc = null;
  let orderArrPass = null;
  let orderArrDriver = null;

  let messagesAcc = null;
  let pairAcc = null;
  let signatureAcc = null;
  try {
    messagesAcc = await dynamo.send(
      new GetCommand({
        TableName: accDb,
        Key: {
          email: event.queryStringParameters.email,
        },
      })
    );
    if (!messagesAcc) {
      return {
        statusCode: 400,
        //  Uncomment below to enable CORS requests
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify("Account not found"),
      };
    }
    messagesAcc = messagesAcc.Item;

    event.queryStringParameters.male = event.queryStringParameters.male === "true"
    event.queryStringParameters.age = Number(event.queryStringParameters.age)

    if (messagesAcc.name !== event.queryStringParameters.name ||
      messagesAcc.age !== event.queryStringParameters.age ||
      messagesAcc.male !== event.queryStringParameters.male ||
      messagesAcc.country !== event.queryStringParameters.country) {
      return {
        statusCode: 401,
        //  Uncomment below to enable CORS requests
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify("Account details incorrect"),
      };
    }
    // set in order
    orderArrAcc = []
    for (const key of orderAcc) {
      orderArrAcc.push(messagesAcc[key] ?? "");
    }

    // convert
    messagesAcc = Object.values(orderArrAcc).map(value => Uint8Array.from(Buffer.from(String(value), "utf-8")));
    // return {
    //   statusCode: 200,
    //   //  Uncomment below to enable CORS requests
    //   headers: {
    //     "Access-Control-Allow-Origin": "*",
    //     "Access-Control-Allow-Headers": "*"
    //   },
    //   body: JSON.stringify({messagesAcc}),
    // };
    pairAcc = await generateBls12381G2KeyPair();
    signatureAcc = await blsSign({ keyPair: pairAcc, messages: messagesAcc });
    if (messagesAcc && pairAcc && pairAcc.publicKey && signatureAcc) {
      const isValid = await blsVerify({ messages: messagesAcc, publicKey: pairAcc.publicKey, signature: signatureAcc });
      // return {
      //   statusCode: 200,
      //   //  Uncomment below to enable CORS requests
      //   headers: {
      //     "Access-Control-Allow-Origin": "*",
      //     "Access-Control-Allow-Headers": "*"
      //   },
      //   body: JSON.stringify(isValid),
      // }
      if (!isValid.verified) {
        return {
          statusCode: 400,
          //  Uncomment below to enable CORS requests
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          },
          body: JSON.stringify("Account signature verification failed"),
        };
      }
    }

  } catch (err) {
    // log full error to CloudWatch for debugging
    console.error('DynamoDB GetCommand (acc) error:', err);

    // return a JSON error response (500) with message and stack for debugging
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({
        error: 'Failed to fetch account record',
        message: err?.message ?? String(err),
        stack: err?.stack ?? null
      }),
    };
  }

  // // user exists so fetch passport and driver's licence data
  let messagesPass = null;
  let pairPass = null;
  let signaturePass = null;

  let messagesDriver = null;
  let pairDriver = null;
  let signatureDriver = null;

  try {
    // get passport info
    messagesPass = await dynamo.send(
      new GetCommand({
        TableName: passportDb,
        Key: {
          email: event.queryStringParameters.email,
        },
      })
    );
    messagesPass = messagesPass.Item;
    orderArrPass = []
    for (const key of orderPassport) {
      orderArrPass.push(messagesPass[key] ?? "");
    }

    messagesPass = Object.values(orderArrPass).map(value => Uint8Array.from(Buffer.from(String(value), "utf-8")));
    pairPass = await generateBls12381G2KeyPair();
    signaturePass = await blsSign({ keyPair: pairPass, messages: messagesPass });


    // get driver info
    messagesDriver = await dynamo.send(
      new GetCommand({
        TableName: driverLicenceDb,
        Key: {
          email: event.queryStringParameters.email,
        },
      })
    );
    messagesDriver = messagesDriver.Item;
    orderArrDriver = []
    for (const key of orderDriverLicence) {
      orderArrDriver.push(messagesDriver[key] ?? "");
    }

    messagesDriver = Object.values(orderArrDriver).map(value => Uint8Array.from(Buffer.from(String(value), "utf-8")));
    pairDriver = await generateBls12381G2KeyPair();
    signatureDriver = await blsSign({ keyPair: pairDriver, messages: messagesDriver });

  } catch (err) {
    return {
      statusCode: 400,
      //  Uncomment below to enable CORS requests
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify("User details not found"),
    };
  }

  try {
    if (messagesPass && pairPass && pairPass.publicKey && signaturePass) {
      const isValid = await blsVerify({ messages: messagesPass, publicKey: pairPass.publicKey, signature: signaturePass });
      if (!isValid.verified) {
        return {
          statusCode: 400,
          //  Uncomment below to enable CORS requests
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          },
          body: JSON.stringify("Passport signature verification failed"),
        };
      }
    }
  } catch (error) {
    // return a JSON error response (500) with message and stack for debugging
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({
        error: 'Failed to fetch account record',
        message: err?.message ?? String(err),
        stack: err?.stack ?? null
      }),
    };
  }

  try {
    if (messagesDriver && pairDriver && pairDriver.publicKey && signatureDriver) {
      const isValid = await blsVerify({ messages: messagesDriver, publicKey: pairDriver.publicKey, signature: signatureDriver });
      if (!isValid.verified) {
        return {
          statusCode: 400,
          //  Uncomment below to enable CORS requests
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          },
          body: JSON.stringify("Driver signature verification failed"),
        };
      }
    }
  } catch (error) {
    // return a JSON error response (500) with message and stack for debugging
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({
        error: 'Failed to fetch account record',
        message: err?.message ?? String(err),
        stack: err?.stack ?? null
      }),
    };
  }

  const proof = await blsCreateProof({ signature: signatureAcc, publicKey: pairAcc.publicKey, nonce: Uint8Array.from(Buffer.from("nonce", "utf8")), revealed: [0, 1], messages: messagesAcc })
  const isProofVerified = await blsVerifyProof({
    proof,
    publicKey: pairAcc.publicKey,
    messages: messagesAcc.slice(0, 2),
    nonce: Uint8Array.from(Buffer.from("nonce", "utf8")),
  });
  if (!isProofVerified.verified) {
    // verification works here but not on the frontend? what the fuck?
    return {
      statusCode: 400,
      //  Uncomment below to enable CORS requests
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify("Proof verification failed"),
    };
  }
  // convert each element to base64
  try {
    signatureAcc = Object.values(signatureAcc).map(value => btoa(String.fromCharCode(value)));
    signaturePass = Object.values(signaturePass).map(value => btoa(String.fromCharCode(value)));
    signatureDriver = Object.values(signatureDriver).map(value => btoa(String.fromCharCode(value)));
    pairAcc.publicKey = Object.values(pairAcc.publicKey).map(value => btoa(String.fromCharCode(value)));
    pairPass.publicKey = Object.values(pairPass.publicKey).map(value => btoa(String.fromCharCode(value)));
    pairDriver.publicKey = Object.values(pairDriver.publicKey).map(value => btoa(String.fromCharCode(value)));
  } catch {
    return {
      statusCode: 400,
      //  Uncomment below to enable CORS requests
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify("Base64 conversion error"),
    };
  }

  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    },
    // body: JSON.stringify({proof}),
    body: JSON.stringify({
      improper: {
        orderArrAcc,
        orderArrPass,
        orderArrDriver
      },
      proper: {
        acc: {
          publicKey: pairAcc.publicKey,
          signature: signatureAcc
        },
        pass: {
          publicKey: pairPass.publicKey,
          signature: signaturePass
        },
        driver: {
          publicKey: pairDriver.publicKey,
          signature: signatureDriver
        }
      }
    }),
  };
};