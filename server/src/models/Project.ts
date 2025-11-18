import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICharacter {
  name: string;
  description?: string;
  headshotUrl?: string;
  fullbodyUrl?: string;
  headshotPrompt?: string;
  fullbodyPrompt?: string;
}

export interface IScene {
  sceneNumber: number;
  prompt?: string;
  generatedImageUrl?: string;
}

export interface IProject extends Document {
  user: Types.ObjectId;
  projectName: string;
  originalText?: string;
  script?: string;
  characters: ICharacter[];
  scenes: IScene[];
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema = new Schema<ICharacter>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    headshotUrl: { type: String },
    fullbodyUrl: { type: String },
    headshotPrompt: { type: String },
    fullbodyPrompt: { type: String },
  },
  { _id: false }
);

const SceneSchema = new Schema<IScene>(
  {
    sceneNumber: { type: Number, required: true },
    prompt: { type: String },
    generatedImageUrl: { type: String },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectName: { type: String, required: true, trim: true },
    originalText: { type: String },
    script: { type: String },
    characters: { type: [CharacterSchema], default: [] },
    scenes: { type: [SceneSchema], default: [] },
  },
  { timestamps: true }
);

ProjectSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
