
export enum HealthStatus {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export interface Bird {
  id: string;
  name: string;
  species: string;
  age: string;
  acquireDate: string;
  status: HealthStatus;
  lastUpdate: string; // ISO Date string
  photo?: string; // Base64 string for the image
}

export interface HealthLog {
  id: string;
  birdId: string;
  date: string;
  appetite: string;
  activity: string;
  droppings: string;
  singing: string;
  resultStatus: HealthStatus;
  notes?: string; // New field for extra notes
}

export interface AdvancedRecord {
  id: string;
  birdId: string;
  date: string;
  weight?: string; // in grams
  isMolting?: boolean;
  event?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  preview: string;
  content: string;
}

export const SPECIES_OPTIONS = [
  "Canário",
  "Periquito",
  "Calopsita",
  "Papagaio",
  "Agapornis",
  "Curió",
  "Coleiro",
  "Outro"
];

// logic helpers
export enum Severity {
  NORMAL = 0,
  MILD = 1,
  SEVERE = 2,
}

export interface QuestionOption {
  label: string;
  value: string;
  severity: Severity;
}

export const HEALTH_QUESTIONS = {
  appetite: [
    { label: "Normal", value: "normal", severity: Severity.NORMAL },
    { label: "Baixo", value: "low", severity: Severity.MILD },
    { label: "Recusou", value: "refused", severity: Severity.SEVERE },
  ],
  activity: [
    { label: "Ativo", value: "active", severity: Severity.NORMAL },
    { label: "Normal", value: "normal", severity: Severity.NORMAL },
    { label: "Quieto", value: "quiet", severity: Severity.MILD },
    { label: "Muito Quieto", value: "very_quiet", severity: Severity.SEVERE },
  ],
  droppings: [
    { label: "Normal", value: "normal", severity: Severity.NORMAL },
    { label: "Mole", value: "soft", severity: Severity.MILD },
    { label: "Diarreia", value: "diarrhea", severity: Severity.SEVERE },
    { label: "Cor Diferente", value: "discolored", severity: Severity.SEVERE },
  ],
  singing: [
    { label: "Normal", value: "normal", severity: Severity.NORMAL },
    { label: "Silencioso", value: "silent", severity: Severity.MILD },
    { label: "Diferente", value: "different", severity: Severity.MILD },
  ]
};
