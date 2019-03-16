import { Table, Column, Model } from 'sequelize-typescript'


@Table({ timestamps: true })
export default class Triggers extends Model<Triggers> {
  @Column
  symbol: string

  @Column
  exchange: string

  @Column
  price: number

  @Column
  uid: number

  @Column
  kind: string

  @Column
  triggeredAt: Date

  @Column
  hasTriggered: boolean

  @Column
  orderId: string
}