Transfer
0x4154	TransferTransaction	Send mosaics and messages between two accounts.

Mosaic
0x414D	MosaicDefinitionTransaction	Create a new mosaic.
0x424D	MosaicSupplyChangeTransaction	Change the mosaic total supply.

Namespace
0x414E	NamespaceRegistrationTransaction	Register a namespace to organize your assets.
0x424E	AddressAliasTransaction	Attach a namespace name to an account.
0x434E	MosaicAliasTransaction	Attach a namespace name to a mosaic.

Metadata
0x4144	AccountMetadataTransaction	Associate a key-value state to an account.
0x4244	MosaicMetadataTransaction	Associate a key-value state to a mosaic.
0x4344	NamespaceMetadataTransaction	Associate a key-value state to a namespace.






Account Link
0x414C	AccountKeyLinkTransaction	Delegate the account importance to a proxy account. Required for all accounts willing to activate delegated harvesting.
0x424C	NodeKeyLinkTransaction	Link an account with a public key used by TLS to create sessions. Required for all accounts willing to activate delegated harvesting.

Aggregate
0x4141	AggregateCompleteTransaction	Send transactions in batches to different accounts.
0x4241	AggregateBondedTransaction	Propose an arrangement of transactions between different accounts.
–	CosignatureTransaction	Cosign an AggregateBondedTransaction.

Core
0x4143	VotingKeyLinkTransaction	Link an account with a BLS public key. Required for node operators willing to vote finalized blocks.
0x4243	VrfKeyLinkTransaction	Link an account with a VRF public key. Required for all harvesting eligible accounts.

Multisignature
0x4155	MultisigAccountModificationTransaction	Create or modify a multisig contract.

Hash Lock
0x4148	HashLockTransaction	Lock a deposit needed to announce aggregate bonded transactions.

Secret Lock
0x4152	SecretLockTransaction	Start a token swap between different chains.
0x4252	SecretProofTransaction	Conclude a token swap between different chains.

Account restriction
0x4150	AccountAddressRestrictionTransaction	Allow or block incoming and outgoing transactions for a given a set of addresses.
0x4250	AccountMosaicRestrictionTransaction	Allow or block incoming transactions containing a given set of mosaics.
0x4350	AccountOperationRestrictionTransaction	Allow or block outgoing transactions by transaction type.

Mosaic restriction
0x4151	MosaicGlobalRestrictionTransaction	Set global rules to transfer a restrictable mosaic.
0x4251	MosaicAddressRestrictionTransaction	Set address specific rules to transfer a restrictable mosaic.
