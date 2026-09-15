/**
 * Digital Personal Data Protection (DPDP) Act, 2023 Compliance Data
 * Adhrit Industries — Data Fiduciary Information & Statutory Notices
 */

export interface GrievanceOfficerInfo {
  name: string;
  designation: string;
  email: string;
  phone: string;
  address: string;
  responseTimeDays: number;
  acknowledgmentHours: number;
}

export interface DpdpRight {
  id: string;
  section: string;
  title: string;
  hindiTitle: string;
  description: string;
  actionHint: string;
}

export const DPDP_COMPLIANCE_DATA = {
  actName: 'Digital Personal Data Protection Act, 2023',
  actReference: 'Act No. 22 of 2023 (Republic of India)',
  dataFiduciary: {
    name: 'ADHRIT INDUSTRIES',
    brandName: 'SAMRIDDHI BROOM™',
    status: 'Data Fiduciary under Section 2(i) of DPDP Act, 2023',
    cityState: 'Ranchi, Jharkhand, India',
    registeredAddress: '71, DG Road, Ghulmohar Parks, Lalpur, Ranchi, Jharkhand — 834001',
    officialEmail: 'info@adhritindustries.com',
  },
  grievanceOfficer: {
    name: 'Santosh Kumar',
    designation: 'Designated Grievance Redressal & Data Protection Officer',
    email: 'grievance@adhritindustries.com',
    phone: '+91 92792 40691',
    address: 'Adhrit Industries, 71, DG Road, Ghulmohar Parks, Lalpur, Ranchi, Jharkhand — 834001',
    acknowledgmentHours: 48,
    responseTimeDays: 30,
  } as GrievanceOfficerInfo,
  boardEscalation: {
    authorityName: 'Data Protection Board of India (DPBI)',
    ministry: 'Ministry of Electronics and Information Technology (MeitY), Government of India',
    note: 'Under Section 13(3) of the DPDP Act, if your grievance is not redressed by our Grievance Officer within 30 days, or if you are dissatisfied with the response, you have the statutory right to appeal directly to the Data Protection Board of India.',
  },
  purposesOfProcessing: [
    {
      title: 'Enquiry Communication & Customer Support',
      details: 'Processing your name, contact phone number, and message to directly answer wholesale or retail broom queries and supply estimates.',
      lawfulBasis: 'Explicit consent under Section 6(1) of DPDP Act, 2023.',
    },
    {
      title: 'Order Fulfillment & Dispatch Coordination',
      details: 'Coordinating delivery address and phone numbers with certified logistics and transport partners for dispatch from our Ranchi facility.',
      lawfulBasis: 'Fulfillment of contract / order request.',
    },
    {
      title: 'Statutory GST & Invoicing Compliance',
      details: 'Generating legally mandated commercial invoices, e-way bills, and tax records required by Indian financial regulations.',
      lawfulBasis: 'Legal obligation under Indian taxation statutes.',
    },
  ],
  rights: [
    {
      id: 'access',
      section: 'Section 11',
      title: 'Right to Access Information About Personal Data',
      hindiTitle: 'व्यक्तिगत डेटा के बारे में जानकारी प्राप्त करने का अधिकार',
      description: 'You have the right to obtain a summary of personal data being processed by Adhrit Industries, the processing activities, and identities of third parties with whom data has been shared.',
      actionHint: 'Request a digital summary of the records we maintain regarding your inquiries or orders.',
    },
    {
      id: 'correction',
      section: 'Section 12',
      title: 'Right to Correction and Erasure',
      hindiTitle: 'सुधार और डेटा मिटाने (Erasure) का अधिकार',
      description: 'You have the right to request the correction of inaccurate data, updating of incomplete records, or permanent erasure of your personal data once the specified purpose is fulfilled.',
      actionHint: 'Update your phone/address or request deletion of historical contact logs.',
    },
    {
      id: 'grievance',
      section: 'Section 13',
      title: 'Right of Grievance Redressal',
      hindiTitle: 'शिकायत निवारण का अधिकार',
      description: 'You have the right to readily available means of grievance redressal provided by Adhrit Industries regarding the performance of our obligations or your data rights.',
      actionHint: 'Contact our Grievance Officer with guaranteed acknowledgment within 48 hours.',
    },
    {
      id: 'nomination',
      section: 'Section 14',
      title: 'Right to Nominate',
      hindiTitle: 'नामांकन करने का अधिकार',
      description: 'You have the right to nominate another individual who shall, in the event of your death or incapacity, exercise your data rights on your behalf.',
      actionHint: 'Designate a trusted representative for institutional trade contracts.',
    },
    {
      id: 'withdraw',
      section: 'Section 6(4)',
      title: 'Right to Withdraw Consent',
      hindiTitle: 'सहमति वापस लेने का अधिकार',
      description: 'You may withdraw your consent at any time. The withdrawal of consent shall not affect the legality of processing carried out prior to such withdrawal.',
      actionHint: 'Opt out of ongoing communication logs with a single click or email.',
    },
  ] as DpdpRight[],
  bilingualNotice: {
    en: {
      heading: 'Statutory Privacy Notice under Section 5 of DPDP Act, 2023',
      summary: 'Adhrit Industries is dedicated to safeguarding your personal data in strict compliance with the Digital Personal Data Protection Act, 2023 of India. We only collect the minimal personal data necessary to attend to your business inquiries and supply orders.',
      noSalePledge: 'Zero Data Commercialization: We strictly DO NOT sell, rent, monetize, or disclose your personal data to any unauthorized third party or marketing network.',
      retentionPolicy: 'Data Retention: Your personal contact records are retained strictly for the duration necessary to satisfy the commercial inquiry, complete order deliveries, or fulfill mandatory legal and taxation records under Indian law.',
    },
    hi: {
      heading: 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 की धारा 5 के तहत वैधानिक सूचना',
      summary: 'अधृत इंडस्ट्रीज भारत के डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के कड़े नियमों के तहत आपके व्यक्तिगत डेटा की सुरक्षा के लिए पूरी तरह प्रतिबद्ध है। हम केवल आपके व्यापारिक प्रश्नों और ऑर्डर की आपूर्ति के लिए आवश्यक न्यूनतम डेटा ही एकत्र करते हैं।',
      noSalePledge: 'डेटा का कोई व्यापारिक विक्रय नहीं: हम आपके व्यक्तिगत डेटा को कभी भी किसी तीसरे पक्ष या मार्केटिंग एजेंसी को नहीं बेचते, किराए पर नहीं देते और न ही साझा करते हैं।',
      retentionPolicy: 'डेटा प्रतिधारण (Retention): आपका डेटा केवल व्यापारिक संचार, ऑर्डर डिलीवरी और भारतीय कानूनों/कर नियमों के तहत जरूरी समय तक ही सुरक्षित रखा जाता है।',
    },
  },
};
