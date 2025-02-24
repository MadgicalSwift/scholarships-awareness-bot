export interface User {
  id?: string; // Firestore auto-generates document IDs
  mobileNumber: string;
  language: string;
  botID: string;
  yearButtonCount: number;
  pdfIndex: number;
  selectedState: string;
  seeMoreCount: number;
  applyLinkCount: number;
  selectedYear: number;
  feedback?: { date: any; feedback: string }[];
  previousButtonMessage?: string;
  previousButtonMessage1?: string;
  [key: string]: any; // Allow additional properties
} 
