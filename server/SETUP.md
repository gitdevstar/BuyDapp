# Setup

## Install Libraries
First download or clone the source repository. Then install the libraries for the
example including the DocuSign Node.js SDK:

````
npm install
````

## Configure
To run the example, you must configure the `index.js` file with an access token, account id, and the signer's name and email.

You can either change the `index.js` file itself, or use environment variables or query parameter settings.

* **Access token:** Use the [OAuth Token Generator](https://developers.docusign.com/oauth-token-generator).
  To use the token generator, you'll need a
  [free DocuSign Developer's account.](https://go.docusign.com/o/sandbox/)
* **Account Id:** After logging into the [DocuSign Sandbox system](https://demo.docusign.net),
  you can copy your Account Id from the dropdown menu by your name. See the figure:

  ![Figure](https://raw.githubusercontent.com/docusign/qs-02-node-send-envelope/master/documentation/account_id.png)
* **Signer name and email:** Remember to try the DocuSign signing ceremony using both a mobile phone and a regular
  email client.
