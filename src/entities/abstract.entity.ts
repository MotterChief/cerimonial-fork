// Essa classe irá servir para que oas outras entidades possam herdar os campos comuns de uma entidade

import { Timestamp } from "firebase/firestore";

export interface AbstractEntity {
  idCreateUser: string;
  createdAt: Timestamp;
  idUpdateUser: string;
  updatedAt: Timestamp;
}