import "../App.css"
import { useState, useRef, useEffect } from "react";
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

import Error from "./Error";
import LockButton from "./LockButton";
import { checkCorrectAgeFormat, checkCorrectPassportTypeFormat, checkCorrectIssueCodeFormat, checkCorrectDobFormat, checkCorrectIssueDateFormat, checkCorrectExpiryFormat, checkCorrectDocumentNoFormat } from '../logic/Checker';

const mailChecker = require('mailchecker');

export default function PassportForm({ sendMessages }) {
  const [passportType, setPassportType] = useState("");
  const [issueCode, setIssueCode] = useState("");
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("")
  const [male, setMale] = useState(null);
  const [issueDate, setIssueDate] = useState("");
  const [expiry, setExpiry] = useState("");
  const [authority, setAuthority] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [documentNo, setDocumentNo] = useState("");

  const nationalities = ["", "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Anguillan", "Argentine", "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bermudian", "Bhutanese", "Bolivian", "Botswanan", "Brazilian", "British", "British Virgin Islander", "Bruneian", "Bulgarian", "Burkinan", "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Cayman Islander", "Central African", "Chadian", "Chilean", "Chinese", "Citizen of Antigua and Barbuda", "Citizen of Bosnia and Herzegovina", "Citizen of Guinea-Bissau", "Citizen of Kiribati", "Citizen of Seychelles", "Citizen of the Dominican Republic", "Citizen of Vanuatu ", "Colombian", "Comoran", "Congolese (Congo)", "Congolese (DRC)", "Cook Islander", "Costa Rican", "Croatian", "Cuban", "Cymraes", "Cymro", "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch", "East Timorese", "Ecuadorean", "Egyptian", "Emirati", "English", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Faroese", "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Gibraltarian", "Greek", "Greenlandic", "Grenadian", "Guamanian", "Guatemalan", "Guinean", "Guyanese", "Haitian", "Honduran", "Hong Konger", "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kittitian", "Kosovan", "Kuwaiti", "Kyrgyz", "Lao", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtenstein citizen", "Lithuanian", "Luxembourger", "Macanese", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese", "Martiniquais", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monegasque", "Mongolian", "Montenegrin", "Montserratian", "Moroccan", "Mosotho", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", "Niuean", "North Korean", "Northern Irish", "Norwegian", "Omani", "Pakistani", "Palauan", "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Pitcairn Islander", "Polish", "Portuguese", "Prydeinig", "Puerto Rican", "Qatari", "Romanian", "Russian", "Rwandan", "Salvadorean", "Sammarinese", "Samoan", "Sao Tomean", "Saudi Arabian", "Scottish", "Senegalese", "Serbian", "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "South Sudanese", "Spanish", "Sri Lankan", "St Helenian", "St Lucian", "Stateless", "Sudanese", "Surinamese", "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian", "Tristanian", "Tunisian", "Turkish", "Turkmen", "Turks and Caicos Islander", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbek", "Vatican citizen", "Venezuelan", "Vietnamese", "Vincentian", "Wallisian", "Welsh", "Yemeni", "Zambian", "Zimbabwean"];

  const [submitPressed, setSubmitPressed] = useState(false);
  const [allMessages, setAllMessages] = useState({
    passportType: passportType,
    issueCode: issueCode,
    name: name,
    nationality: nationality,
    dob: dob,
    male: male,
    issueDate: issueDate,
    expiry: expiry,
    authority: authority,
    country: country,
    state: state,
    city: city,
    documentNo: documentNo
  });

  const [positions, setPositions] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const checkCorrectCountryFormat = () => {
    const countryRegex = /^[\w\s]+$/;
    return countryRegex.test(country);
  };

  const checkSexEntered = () => {
    return male !== null;
  };

  const checkCorrectMessageFormat = () => {
    return checkCorrectPassportTypeFormat(passportType) &&
      checkCorrectIssueCodeFormat(issueCode) &&
      checkCorrectNameFormat(name) &&
      nationality.length !== 0 &&
      checkCorrectDobFormat(dob) &&
      checkSexEntered() &&
      checkCorrectIssueDateFormat(issueDate) &&
      checkCorrectExpiryFormat(expiry) &&
      authority.length !== 0 && country.length !== 0 && state.length !== 0 && city.length !== 0 &&
      checkCorrectDocumentNoFormat(documentNo);
  }

  const submitPress = () => {
    setSubmitPressed(true);
    return checkCorrectMessageFormat();
  }

  const changeValue = (name, value) => {
    setAllMessages((prevMessages) => ({ ...prevMessages, [name]: value }));
  };

  return (
    <form className="list" onSubmit={(e) => e.preventDefault()}>
      <div className="claimBox email">
        <h3>Type</h3>
        <input className="formInput" type="text" maxLength="1" onChange={(e) => { setPassportType(e.target.value); changeValue("passportType", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={passportType} name={"passportType"} spot={0} />
      </div>
      {!checkCorrectPassportTypeFormat(passportType) && submitPressed && <Error message={"Invalid type format"}></Error>}
      <div className="claimBox email">
        <h3>Code of Issuing (Three characters)</h3>
        <input className="formInput" type="text" maxLength="3" onChange={(e) => { setIssueCode(e.target.value); changeValue("issueCode", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={issueCode} name={"issueCode"} spot={1} />
      </div>
      {!checkCorrectIssueCodeFormat(issueCode) && submitPressed && <Error message={"Invalid issue code format"}></Error>}
      <div className="claimBox email">
        <h3>Name</h3>
        <input className="formInput" type="text" onChange={(e) => { setName(e.target.value); changeValue("name", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={name} name={"name"} spot={2} />
      </div>
      {!checkCorrectNameFormat(name) && submitPressed && <Error message={"Invalid name format"}></Error>}
      <div className="claimBox email">
        <h3>Nationality</h3>
        <select className="formInput" type="text" onChange={(e) => { setNationality(e.target.value); changeValue("nationality", String(e.target.value)) }}>
          {nationalities.map((opt) => <option>{opt}</option>)}
        </select>
        <LockButton toggle={toggle} value={nationality} name={"nationality"} spot={3} />
      </div>
      {nationality.length === 0 && submitPressed && <Error message={"Invalid nationality format"}></Error>}
      <div className="claimBox email">
        <h3>Date of Birth</h3>
        <input className="formInput" type="date" onChange={(e) => { setDob(e.target.value); changeValue("dob", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={dob} name={"dob"} spot={4} />
      </div>
      {!checkCorrectDobFormat(dob) && submitPressed && <Error message={"Invalid dob format"}></Error>}
      <div className="claimBox sex">
        <h3>Sex</h3>
        <input type="radio" onChange={() => { setMale(true); changeValue("male", "1") }} checked={male === true} />
        <h3>Male</h3>
        <input type="radio" onChange={() => { setMale(false); changeValue("male", "0") }} checked={male === false} />
        <h3>Female</h3>
        <LockButton toggle={toggle} value={male ? "1" : "0"} name={"male"} spot={5} />
      </div>
      {!checkSexEntered() && submitPressed && <Error message={"Sex not chosen"}></Error>}
      <div className="claimBox email">
        <h3>Date of issue</h3>
        <input className="formInput" type="date" onChange={(e) => { setIssueDate(e.target.value); changeValue("issueDate", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={issueDate} name={"issueDate"} spot={6} />
      </div>
      {!checkCorrectIssueDateFormat(issueDate) && submitPressed && <Error message={"Invalid issue date format"}></Error>}
      <div className="claimBox email">
        <h3>Date of expiry</h3>
        <input className="formInput" type="date" placeholder="DD-MM-YYYY" onChange={(e) => { setExpiry(e.target.value); changeValue("expiry", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={expiry} name={"expiry"} spot={7} />
      </div>
      {!checkCorrectExpiryFormat(expiry) && submitPressed && <Error message={"Invalid expiry format"}></Error>}
      <div className="claimBox place">
        <h3>Authority</h3>
        <CountrySelect
          containerClassName="form-group"
          inputClassName=""
          onChange={(authority) => { setAuthority(authority); changeValue("authority", String(authority)) }}
          placeHolder="Select Country"
        />
        <LockButton toggle={toggle} value={authority} name={"authority"} spot={8} />
      </div>
      {authority.length === 0 && submitPressed && <Error message={"Invalid authority format"}></Error>}
      <div className="claimBox place">
        <h3>Country of birth</h3>
        <CountrySelect
          containerClassName="form-group"
          inputClassName=""
          onChange={(country) => { setCountry(country); changeValue("country", String(country)) }}
          placeHolder="Select Country"
        />
        <LockButton toggle={toggle} value={country} name={"country"} spot={9} />
      </div>
      {country.length === 0 && submitPressed && <Error message={"You must select a country"}></Error>}
      <div className="claimBox place">
        <h3>State of birth</h3>
        <StateSelect
          countryid={country?.id}
          containerClassName="form-group"
          inputClassName=""
          onChange={(state) => { setState(state); changeValue("state", String(state)) }}
          defaultValue={state}
          placeHolder="Select State"
        />
        <LockButton toggle={toggle} value={state} name={"country"} spot={9} />
      </div>
      {state.length === 0 && submitPressed && <Error message={"You must select a state"}></Error>}
      <div className="claimBox place">
        <h3>City of birth</h3>
        <CitySelect
          countryid={country?.id}
          stateid={state?.id}
          onChange={(city) => { setCity(city); changeValue("city", String(city)) }}
          defaultValue={city}
          placeHolder="Select City"
        />
        <LockButton toggle={toggle} value={city} name={"city"} spot={10} />
      </div>
      {city.length === 0 && submitPressed && <Error message={"You must select a city"}></Error>}
      <div className="claimBox">
        <h3>Document No.</h3>
        <input className="formInput" type="text" onChange={(e) => { setDocumentNo(e.target.value); changeValue("documentNo", String(e.target.value)) }} />
        <LockButton toggle={toggle} value={documentNo} name={"documentNo"} spot={11} />
      </div>
      {!checkCorrectDocumentNoFormat(documentNo) && submitPressed && <Error message={"Invalid document number format"}></Error>}
      <input className="formSubmit" type="submit" value="Submit" onClick={async () => { submitPress() && sendMessages(allMessages, positions, "pass") }} />
    </form>
  )
}