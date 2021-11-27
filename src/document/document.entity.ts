import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { DocumentDto } from "./document.dto";

@Entity()
export default class Document extends DocumentDto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userHiddenName: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @Column({ length: 160 })
  filename: string;

  @Column("text", { nullable: true })
  content: string;

  @Column({ length: 50 })
  docType: string;
}
