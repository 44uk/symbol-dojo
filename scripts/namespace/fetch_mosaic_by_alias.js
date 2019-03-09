const nem = require('nem2-sdk');

const url = process.env.API_URL || 'http://localhost:3000';
const namespace = process.argv[2];

const nsId = new nem.NamespaceId(namespace);
const nsHttp = new nem.NamespaceHttp(url);

console.log('Namespace: %s (%s)', nsId.fullName, nsId.toHex());
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex());
console.log('');

nsHttp.getLinkedMosaicId(nsId).subscribe(
  data => {
    const mosId = data;
    console.log('Namespace: %s', nsId.fullName);
    console.log('MosaicId:  %s [%s, %s]',
      mosId.id.toHex(),
      mosId.id.lower,
      mosId.id.higher
    );
  },
  err => console.error('Error: ', err)
);
