import * as ccxt from 'ccxt'
import * as debug from 'debug'
import * as _ from 'underscore'

import * as Controller from '../../database2'
import BaseStrategy from '../../strategies/BaseStrategy'
import StopLossStrategy from '../../strategies/StopLossStrategy'

const logger = debug('app:exchange')


export default abstract class BaseExchange {
  private exchange: ccxt.Exchange
  private strategies: BaseStrategy[] = []


  constructor (exchange: ccxt.Exchange) {
    this.exchange = exchange
  }


  /**
   * This abstract function should be implemented by all the exchanges we are integrating with.
   * Here basically a loop or a websocket connection must be started which continously calls
   * this.onPriceUpdate(....) with the latest price for the any of the given symbols.
   */
  protected abstract startListening (): void


  private async lazyLoadStrategies (symbol: string) {
    try {
      const triggerIdsMap = await Controller.getTriggersForSymbol(this.exchange.id, symbol)

      this.strategies = []

      _.mapObject(triggerIdsMap, (trigger, id) => {
        if (trigger.strategy === 'stop-loss') this.strategies.push(StopLossStrategy.create(id, trigger))
      })

      return this.strategies
    } catch (e) {
      return []
    }
  }


  protected async onPriceUpdate (symbol: string, last: number) {
    logger('processing triggers for', symbol, 'at', last)

    const strategies = await this.lazyLoadStrategies(symbol)
    strategies.forEach(strategy => strategy.process(last))
  }


  public start () {
    //Controller.readDetails()
    // 1. load triggers from the DB
    // 2. start listening for price changes
    this.startListening()
    //this.onPriceUpdate()
  }
}
