const nem = require('nem2-sdk');

const url = process.env.API_URL || 'http://localhost:3000';
const namespace = process.argv[2];

const nsId = new nem.NamespaceId(namespace);
const nsHttp = new nem.NamespaceHttp(url);

console.log('Namespace: %s (%s)', nsId.fullName, nsId.toHex());
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex());
console.log('');

nsHttp.getLinkedAddress(nsId).subscribe(
  data => {
    const address = data;
    console.log('Namespace: %s', nsId.fullName);
    console.log('Address:   %s', address.pretty());
    console.log('Endpoint:  %s/account/%s', url, address.plain());
  },
  err => console.error('Error: ', err)
);
