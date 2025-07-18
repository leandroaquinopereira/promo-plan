import type { firestore } from 'firebase-admin'

export type Reference<DocumentType> = DocumentType | firestore.DocumentReference
