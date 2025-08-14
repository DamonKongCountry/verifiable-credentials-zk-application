import React, { useState, useEffect } from 'react';
import '../App.css';

export default function LockButton({ toggle, value, name, spot }) {
  const [isClicked, setClicked] = useState(false);

  return (
    <button className={isClicked ? "verifyToggle buttonClicked" : "verifyToggle buttonDefault"} type="button" onClick={() => { toggle(value, name, spot); setClicked((isClicked) => isClicked ? false : true) }}>
      {/* <div className="tickImg" alt="toggle icon"/> */}
    </button>
  )
}