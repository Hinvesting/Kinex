export type Character = {
  name: string;
  description?: string;
  headshotUrl?: string;
  fullbodyUrl?: string;
  headshotPrompt?: string;
  fullbodyPrompt?: string;
};

export type Scene = {
  sceneNumber: number;
  prompt?: string;
  generatedImageUrl?: string;
};

export type Project = {
  id: string;
  projectName: string;
  originalText?: string;
  script?: string;
  characters: Character[];
  scenes: Scene[];
  createdAt?: string;
  updatedAt?: string;
};
