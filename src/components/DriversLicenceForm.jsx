import "../App.css"
import { useState, useRef, useEffect } from "react";
import { CountrySelect, StateSelect } from "react-country-state-city";

import Error from "./Error";
import LockButton from "./LockButton";
import { checkCorrectLicenceClassFormat, checkCorrectCardNoFormat, checkCorrectLicenceNoFormat, checkCorrectDobFormat, checkCorrectExpiryFormat, checkCorrectRearNoFormat } from "../logic/Checker"

export default function DriversLicenceForm({ sendMessages }) {
  const [cardNo, setCardNo] = useState(-1);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [licenceClass, setLicenceClass] = useState("");
  const [licenceNo, setLicenceNo] = useState(-1);
  const [dob, setDob] = useState("");
  const [expiry, setExpiry] = useState("");
  const [rearNo, setRearNo] = useState(-1);


  const [submitPressed, setSubmitPressed] = useState(false);
  const [allMessages, setAllMessages] = useState({
    licenceClass: licenceClass,
    name: name,
    cardNo: cardNo,
    licenceNo: licenceNo,
    dob: dob,
    expiry: expiry,
    rearNo: rearNo,
    country: country,
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

  const checkCorrectNameFormat = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
  };

  const checkCorrectMessageFormat = () => {
    return checkCorrectNameFormat();
  }

  const submitPress = () => {
    setSubmitPressed(true);
    return checkCorrectMessageFormat()
  }

  const changeValue = (name, value) => {
    setAllMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
  };

  return (
    <form className="list driver" onSubmit={(e) => e.preventDefault()}>
      <div className="claimBox class">
        <h3>Licence Class (for example: C, R, MC)</h3>
        <input className="formInput" type="text" maxLength="1" onChange={(e) => { setLicenceClass(e.target.value); changeValue("licenceClass", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={licenceClass} name={"licenceClass"} spot={0} />
      </div>
      {!checkCorrectLicenceClassFormat(licenceClass, "drivers") && submitPressed && <Error message={"Invalid email format"}></Error>}
      <div className="claimBox name">
        <h3>Name</h3>
        <input className="formInput" type="text" onChange={(e) => { setName(e.target.value); changeValue("name", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={name} name={"name"} spot={1} />
      </div>
      {!checkCorrectNameFormat(name) && submitPressed && <Error message={"Invalid name format"}></Error>}
      <div className="claimBox cardNo">
        <h3>Card number</h3>
        <input className="formInput" type="number" maxLength="10" onChange={(e) => { setCardNo(e.target.value); changeValue("cardNo", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={cardNo} name={"cardNo"} spot={2} />
      </div>
      {!checkCorrectCardNoFormat(cardNo) && submitPressed && <Error message={"Card number is 10 digits long"}></Error>}
      <div className="claimBox licenceNo">
        <h3>Licence number</h3>
        <input className="formInput" type="number" maxLength="8" onChange={(e) => { setLicenceNo(e.target.value); changeValue("licenceNo", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={licenceNo} name={"licenceNo"} spot={3} />
      </div>
      {!checkCorrectLicenceNoFormat(licenceNo) && submitPressed && <Error message={"Licence number is 6 to 9 digits long"}></Error>}
      <div className="claimBox dob">
        <h3>Date of Birth</h3>
        <input className="formInput" type="date" onChange={(e) => { setDob(e.target.value); changeValue("dob", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={dob} name={"dob"} spot={4} />
      </div>
      {!checkCorrectDobFormat(dob) && submitPressed && <Error message={"Invalid date of birth"}></Error>}
      <div className="claimBox expiry">
        <h3>Expiry Date</h3>
        <input className="formInput" type="date" onChange={(e) => { setExpiry(e.target.value); changeValue("expiry", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={expiry} name={"expiry"} spot={5} />
      </div>
      {!checkCorrectExpiryFormat(expiry) && submitPressed && <Error message={"Invalid expiry date"}></Error>}
      <div className="claimBox rearNo">
        <h3>Rear Card Number</h3>
        <input className="formInput" type="number" maxLength="8" onChange={(e) => { setRearNo(e.target.value); changeValue("rearNo", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={rearNo} name={"rearNo"} spot={6} />
      </div>
      {!checkCorrectRearNoFormat(rearNo) && submitPressed && <Error message={"Rear number should be 8 digits long"}></Error>}
      <div className="claimBox country">
        <h3>Country</h3>
        <CountrySelect
          containerClassName="form-group"
          inputClassName=""
          onChange={(country) => { setCountry(country.name); console.log(country.name); changeValue("country", String(country.name)) }}
          placeHolder="Select Country"
        />
        <LockButton toggle={toggle} value={country} name={"country"} spot={7} />
      </div>
      {country.length == 0 && submitPressed && <Error message={"Country not selected"}></Error>}
      <input className="formSubmit" type="submit" value="Submit" onClick={async () => { submitPress() && sendMessages(allMessages, positions, "drivers") }} />
    </form>
  )
}