import { CONNECTORS } from "../constants";

export type TConnector = (typeof CONNECTORS)[number]["key"];

export type TChunk = {
  id: string;
  connector?: TConnector;
};

export type TNode = {
  id: string;
  name: string;
  size: number;
  url?: string;
  chunks?: TChunk[];
  children?: TNode[];
  createdAt: string;
  updatedAt: string;
  uploaded: number;
};

export type TUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  apiKey: string;
};

export type TBucket = {
  id: string;
  name: string;
  users: string[];
  createdAt: string;
  updatedAt: string;
};
