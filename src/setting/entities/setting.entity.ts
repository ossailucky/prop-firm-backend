// setting.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appName: string;

  @Column()
  appDescription: string;

  @Column()
  refferalPercentage: number;

  @Column()
  currency: string;

  @Column({nullable:true})
  ETHAddress: string;

  @Column({nullable:true})
  USDTAddress: string;

  @Column({nullable:true})
  BTCAddress: string;

  @Column({nullable:true})
  litecoinAddress: string;

  @Column()
  appEmail: string;

  @Column({ nullable: true })
  appLogo: string;

  @Column({ nullable: true })
  appFavicon: string;

  @Column({nullable: true, type: "longtext"})
  termsAndConditions: string;
}
