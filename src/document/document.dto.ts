export class DocumentDto {
  readonly userHiddenName: string;

  readonly createdAt: Date;

  readonly filename: string;

  readonly content: string;

  readonly docType: string;
}

export class CreateDocumentDto {
  readonly userHiddenName: string;

  readonly createdAt: Date;

  readonly filename: string;

  readonly content: string;

  readonly docType: string;
}

export class UpdateDocumentDto {
  id: number;

  readonly userHiddenName: string;

  readonly createdAt: Date;

  readonly filename: string;

  readonly content: string;

  readonly docType: string;
}
