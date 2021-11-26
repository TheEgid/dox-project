import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export default class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userHiddenName: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ length: 160 })
  filename: string;

  @Column("text", { nullable: true })
  content: string;

  @Column({ length: 50 })
  docType: string;
}
