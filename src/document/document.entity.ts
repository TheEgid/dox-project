import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;
}
