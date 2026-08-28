import React, { useEffect, useState } from 'react'
import {
  Card,
  Input,
  Message,
  Icon,
  Label,
  Segment,
} from 'semantic-ui-react'
import { u8aToString } from '@polkadot/util'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

const MAX_SERIES_TO_SCAN = 20
// ponytail: O(n) series scan capped at MAX_SERIES_TO_SCAN — fine for demo scale.
// Upgrade path: storage map key enumeration (api.query.coupon.series.keysPaged).

export default function CustomerWallet() {
  const { api, currentAccount, keyring } = useSubstrateState()
  const [seriesList, setSeriesList] = useState([])
  const [balances, setBalances] = useState({})
  const [redeemAmount, setRedeemAmount] = useState('1')
  const [activeSeries, setActiveSeries] = useState(null)

  const accountName = (() => {
    const addr = currentAccount?.address
    if (!addr || !keyring?.getPair) return 'CUSTOMER'
    try {
      return keyring.getPair(addr)?.meta?.name?.toUpperCase() || 'CUSTOMER'
    } catch {
      return 'CUSTOMER'
    }
  })()

  useEffect(() => {
    let unsubscribeAll = null
    let isMounted = true

    const load = async () => {
      const addr = currentAccount?.address
      if (!api || !addr) return
      const list = []
      for (let id = 0; id < MAX_SERIES_TO_SCAN; id += 1) {
        // eslint-disable-next-line no-await-in-loop
        const s = await api.query.coupon.series(id)
        if (s.isNone) break
        const sv = s.unwrap()
        list.push({
          id,
          metadata: u8aToString(sv.metadata.toU8a()).replace(/\0.*$/g, ''),
          expiry: sv.expiry.toString(),
          maxSupply: sv.maxSupply.toString(),
          circulating: sv.circulating.toString(),
        })
      }
      const bal = {}
      for (const s of list) {
        // eslint-disable-next-line no-await-in-loop
        const b = await api.query.coupon.balances(addr, s.id)
        bal[s.id] = b
      }
      if (!isMounted) return
      setSeriesList(list)
      setBalances(bal)
      setActiveSeries(cur => (cur === null && list.length > 0 ? list[0].id : cur))
    }

    load()
    api?.rpc.chain
      .subscribeNewHeads(() => load())
      .then(unsub => {
        unsubscribeAll = unsub
      })
      .catch(() => {})

    return () => {
      isMounted = false
      if (unsubscribeAll) unsubscribeAll()
    }
  }, [api, currentAccount])

  const active = seriesList.find(s => s.id === activeSeries)
  const activeBalance = active ? balances[active.id] : null
  const canRedeem = activeBalance && !activeBalance.isZero()

  return (
    <Card.Group>
      <Card
        fluid
        style={{
          maxWidth: '420px',
          margin: '0 auto',
          borderRadius: '24px',
          backgroundColor: '#0f3460',
          color: 'white',
        }}
      >
        <Card.Content>
          <Label ribbon color="green">
            <Icon name="mobile" /> Customer Wallet — what your customer sees
          </Label>
          <Card.Header style={{ marginTop: '0.75em', color: 'white' }}>
            <Icon name="ticket" /> My Coupons
          </Card.Header>
          <Card.Meta style={{ color: '#9fd6ff' }}>
            {accountName} · {currentAccount?.address?.slice(0, 8)}…
          </Card.Meta>

          {seriesList.length === 0 && (
            <Message info style={{ marginTop: '1rem' }}>
              <Message.Header>No coupons yet</Message.Header>
              <p>
                Switch to <strong>Alice</strong> (vendor) and issue coupons to
                this account — they will appear here instantly.
              </p>
            </Message>
          )}

          {seriesList.map(s => {
            const bal = balances[s.id]
            const isActive = s.id === activeSeries
            return (
              <Segment
                key={s.id}
                inverted
                onClick={() => setActiveSeries(s.id)}
                style={{
                  cursor: 'pointer',
                  marginTop: '0.75rem',
                  borderRadius: '16px',
                  backgroundColor: isActive ? '#16306b' : '#0d2a57',
                  border: isActive
                    ? '2px solid #00d9ff'
                    : '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1.05em' }}>
                      {s.metadata || `Series ${s.id}`}
                    </strong>
                    <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                      expires at block {s.expiry}
                    </div>
                  </div>
                  <Label circular color="yellow" size="large">
                    {bal ? bal.toString() : '…'}
                  </Label>
                </div>
              </Segment>
            )
          })}

          {active && (
            <div style={{ marginTop: '1rem' }}>
              <Input
                type="number"
                min="1"
                value={redeemAmount}
                onChange={(_, d) => setRedeemAmount(d.value)}
                size="small"
                style={{ width: '90px', marginRight: '0.5rem' }}
              />
              <TxButton
                label="Redeem"
                type="SIGNED-TX"
                color="orange"
                size="large"
                disabled={!canRedeem || !redeemAmount}
                attrs={{
                  palletRpc: 'coupon',
                  callable: 'redeem',
                  inputParams: [active.id, redeemAmount],
                  paramFields: [true, true],
                }}
              />
              <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '0.5rem' }}>
                <Icon name="lock" /> Non-transferable — valid at the issuing
                merchant only
              </div>
            </div>
          )}
        </Card.Content>
      </Card>
    </Card.Group>
  )
}
