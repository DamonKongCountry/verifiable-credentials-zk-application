//have these functions take in inputs based on the licence
import { format, isPast } from 'date-fns';
const mailChecker = require('mailchecker');
var nationalities = require("i18n-nationality");

export function checkCorrectAgeFormat(age) {
  const ageRegex = /^\d+$/;
  return ageRegex.test(age);
};

export function checkCorrectCardNoFormat(cardNo) {
  const cardNoRegex = /^[\d]{10}$/;
  return cardNoRegex.test(cardNo);
};

export function checkCorrectDobFormat(dob) {
  // may need to check with account age here for future
  return isPast(dob)
};

export function checkCorrectDocumentNoFormat(documentNo) {
  const regex = /^PA[\d]{7}$/;
  return regex.test(documentNo);
};

export function checkCorrectEmailFormat(email) {
  return mailChecker.isValid(email);
};

export function checkCorrectExpiryFormat(expiryDate) {
  return expiryDate instanceof Date && !isPast(expiryDate);
};

export function checkCorrectIssueCodeFormat(issueCode) {
  //dropdown of country codes
  return String(issueCode).toUpperCase() in nationalities.getAlpha3Codes()
};

export function checkCorrectIssueDateFormat(issueDate) {
  return issueDate instanceof Date && isPast(issueDate);
};

export function checkCorrectLicenceClassFormat(licenceClass, credential) {
  switch (credential) {
    case "drivers":
      return ["C", "R", "LR", "MR", "HR", "HC", "MC"].includes(licenceClass);
    default:
      console.log("Licence not found");
  }

};

export function checkCorrectLicenceNoFormat(licenceNo) {
  const cardNoRegex = /^[\d]{6,9}$/;
  return cardNoRegex.test(licenceNo);
};

export function checkCorrectNameFormat(name) {
  const nameRegex = /^[A-Za-z\s]+$/;
  return nameRegex.test(name);
};

export function checkCorrectRearNoFormat(rearNo) {
  const cardNoRegex = /^[\d]{8}$/;
  return cardNoRegex.test(rearNo);
};

export function checkCorrectPassportTypeFormat(type) {
  return type === "R" || type === "P";
};