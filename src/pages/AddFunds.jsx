import React from "react";

export default function AddFunds() {
  return (
    <div className="container">
      <div className="card">
        <h3>Add Funds</h3>
        <p>To add funds to your JAP account, open the JAP add funds page:</p>
        <a className="button" href="https://justanotherpanel.com/addfunds" target="_blank">Open JAP Add Funds</a>
        <h4>Suggested steps</h4>
        <ol>
          <li>Open the JAP add funds page</li>
          <li>Choose your payment method</li>
          <li>Complete payment and wait for balance update</li>
        </ol>
      </div>
    </div>
  );
}
