export class DocumentDto {
  readonly userHiddenName: string;

  readonly createdAt: Date;

  updatedAt?: Date;

  readonly filename: string;

  readonly content: string;

  readonly docType: string;
}

export class UpdateDocumentDto extends DocumentDto {
  readonly id: number;
}
