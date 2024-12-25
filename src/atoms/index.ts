import { atom } from "jotai";
import { TConnector, TNode } from "../types";
import { CONNECTORS, DEFAULT_CONNECTOR } from "../constants";
import { Settings } from "../enums";
import { TUser } from "../types";

export const userAtom = atom(undefined as undefined | null | TUser);

export const nodesAtom = atom<TNode[]>([]);
export const selectedNodesAtom = atom<TNode[]>([]);
export const modalAtom = atom<React.ReactElement>();
export const nodeIdsBeingUpdatedAtom = atom(new Set<string>());
export const connectorAtom = atom<TConnector>(
  CONNECTORS.map((c) => c.key).includes(
    localStorage.getItem(Settings.CONNECTOR) as TConnector,
  )
    ? (localStorage.getItem(Settings.CONNECTOR) as TConnector)
    : DEFAULT_CONNECTOR,
);
