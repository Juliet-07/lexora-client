export interface BeneficialOwner {
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  residentialAddress: string;
  ownershipPercentage: string;
  natureOfControl: string;
}

export interface DirectorOfficer {
  firstName: string;
  lastName: string;
  title: string;
  dob: string;
  nationality: string;
  residentialAddress: string;
  pepStatus: string;
}

export interface RelatedEntity {
  entityName: string;
  registrationNumber: string;
  jurisdiction: string;
  businessActivity: string;
  shareholderName: string;
  ownershipPercentage: string;
  natureOfRelationship: string;
}

export interface KycData {
  // Individual
  fullName: string;
  dob: string;
  placeOfBirth: string;
  nationality: string;
  taxResidency: string;
  taxId: string;
  occupation: string;
  employer: string;
  // Employment details (individual)
  employmentStatus: string;
  industrySector: string;
  employerAddress: string;
  // Source of wealth (individual)
  primarySourceOfFunds: string[];
  primarySourceOfFundsOther: string;
  sourceOfWealth: string;
  netWorth: string;
  annualIncome: string;
  // Address (generic / individual + others)
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Contact
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  // ID
  idNumber: string;
  idIssueDate: string;
  idExpiryDate: string;
  idIssuingCountry: string;

  // Corporate — Section A: Entity details
  legalEntityName: string;
  entityType: string;
  entityTypeOther: string;
  registrationNumber: string;
  taxJurisdiction: string;
  dateEstablished: string;
  // Registered Business Address
  regStreet: string;
  regCity: string;
  regState: string;
  regPostalCode: string;
  regCountry: string;
  // Business Activity Information
  primaryBusinessActivity: string;
  businessDescription: string;
  annualRevenue: string;
  numberOfEmployees: string;
  countriesOfOperation: string;
  website: string;

  // Legacy corporate fields (kept for compatibility w/ identification step)
  tradingName: string;
  incorporationCountry: string;
  incorporationDate: string;
  businessType: string;

  // Partnership
  partnershipName: string;
  partnershipType: string;
  partnershipRegNumber: string;
  partnershipJurisdiction: string;
  partnershipFormationDate: string;
  partnershipBusinessActivity: string;
  partners: string;
  // Trust
  trustName: string;
  trustType: string;
  trustDeedDate: string;
  trustJurisdiction: string;
  settlor: string;
  trustees: string;
  beneficiaries: string;
  protector: string;
  trustPurpose: string;

  // Ownership & Control (corporate)
  hasBeneficialOwner: "yes" | "no" | "";
  beneficialOwnersList: BeneficialOwner[];
  directorsList: DirectorOfficer[];
  hasRelatedEntity: "yes" | "no" | "";
  relatedEntitiesList: RelatedEntity[];

  // Legacy free-text ownership (still used by partnership / trust steps)
  beneficialOwners: string;
  directors: string;

  // AML
  purpose: string;
  sourceOfFunds: string[];
  transactionData: string[];
  expectedVolume: string;
  expectedValue: string;
  expectedCountries: string;
  highRiskIndicators: string[];
  isPep: "yes" | "no" | "";

  // Declaration / Authorized signatory
  signatoryFullName: string;
  signatoryTitle: string;
  signature: string;
  signatureDate: string;
  agreeTrue: boolean;
  agreeUpdate: boolean;
  agreeConsent: boolean;
}

export const emptyBeneficialOwner: BeneficialOwner = {
  firstName: "",
  lastName: "",
  dob: "",
  nationality: "",
  residentialAddress: "",
  ownershipPercentage: "",
  natureOfControl: "",
};

export const emptyDirector: DirectorOfficer = {
  firstName: "",
  lastName: "",
  title: "",
  dob: "",
  nationality: "",
  residentialAddress: "",
  pepStatus: "",
};

export const emptyRelatedEntity: RelatedEntity = {
  entityName: "",
  registrationNumber: "",
  jurisdiction: "",
  businessActivity: "",
  shareholderName: "",
  ownershipPercentage: "",
  natureOfRelationship: "",
};

export const initialData: KycData = {
  fullName: "",
  dob: "",
  placeOfBirth: "",
  nationality: "",
  taxResidency: "",
  taxId: "",
  occupation: "",
  employer: "",
  employmentStatus: "",
  industrySector: "",
  employerAddress: "",
  primarySourceOfFunds: [],
  primarySourceOfFundsOther: "",
  sourceOfWealth: "",
  netWorth: "",
  annualIncome: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  primaryPhone: "",
  secondaryPhone: "",
  email: "",
  idNumber: "",
  idIssueDate: "",
  idExpiryDate: "",
  idIssuingCountry: "",

  legalEntityName: "",
  entityType: "",
  entityTypeOther: "",
  registrationNumber: "",
  taxJurisdiction: "",
  dateEstablished: "",
  regStreet: "",
  regCity: "",
  regState: "",
  regPostalCode: "",
  regCountry: "",
  primaryBusinessActivity: "",
  businessDescription: "",
  annualRevenue: "",
  numberOfEmployees: "",
  countriesOfOperation: "",
  website: "",

  tradingName: "",
  incorporationCountry: "",
  incorporationDate: "",
  businessType: "",

  partnershipName: "",
  partnershipType: "",
  partnershipRegNumber: "",
  partnershipJurisdiction: "",
  partnershipFormationDate: "",
  partnershipBusinessActivity: "",
  partners: "",
  trustName: "",
  trustType: "",
  trustDeedDate: "",
  trustJurisdiction: "",
  settlor: "",
  trustees: "",
  beneficiaries: "",
  protector: "",
  trustPurpose: "",

  hasBeneficialOwner: "",
  beneficialOwnersList: [],
  directorsList: [],
  hasRelatedEntity: "",
  relatedEntitiesList: [],

  beneficialOwners: "",
  directors: "",

  purpose: "",
  sourceOfFunds: [],
  transactionData: [],
  expectedVolume: "",
  expectedValue: "",
  expectedCountries: "",
  highRiskIndicators: [],
  isPep: "",

  signatoryFullName: "",
  signatoryTitle: "",
  signature: "",
  signatureDate: "",
  agreeTrue: false,
  agreeUpdate: false,
  agreeConsent: false,
};
