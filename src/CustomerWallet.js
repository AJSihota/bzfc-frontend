import React, { useEffect, useState } from 'react'
import {
  Card,
  Input,
  Message,
  Icon,
  Label,
  Segment,
  Button,
} from 'semantic-ui-react'
import { u8aToString } from '@polkadot/util'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

const MAX_SERIES_TO_SCAN = 20
// ponytail: O(n) scans capped — fine for demo scale.
// Upgrade path: keysPaged enumeration for large series/wrap counts.

// decode like the vendor/admin apps do: toU8a(true) strips the compact length prefix.
const decodeBytes = f => {
  try {
    if (!f) return ''
    if (f.toUtf8) return f.toUtf8()
    if (f.toU8a) return u8aToString(f.toU8a(true))
  } catch {
    /* fall through */
  }
  return ''
}
const toDisplay = baseUnits => {
  const s = baseUnits?.toString() || '0'
  if (s.length <= 17) return s.replace(/^0+(?=\d)/, '') === '' ? '0' : s
  return s.slice(0, -17).replace(/^0+(?=\d)/, '') || '0'
}

export default function CustomerWallet() {
  const { api, currentAccount, keyring } = useSubstrateState()
  const [wraps, setWraps] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [balances, setBalances] = useState({})
  const [redeemAmount, setRedeemAmount] = useState('1')
  const [activeKey, setActiveKey] = useState(null)
  const [merchant, setMerchant] = useState('')

  const address = currentAccount?.address

  const accountName = (() => {
    if (!address || !keyring?.getPair) return 'CUSTOMER'
    try {
      return keyring.getPair(address)?.meta?.name?.toUpperCase() || 'CUSTOMER'
    } catch {
      return 'CUSTOMER'
    }
  })()

  // default spend destination: Bob (the vendor) from the dev keyring
  useEffect(() => {
    if (!merchant && keyring?.getPairs) {
      const bob = keyring.getPairs().find(p => p.meta?.name?.toLowerCase() === 'bob')
      if (bob) setMerchant(bob.address)
    }
  }, [keyring, merchant])

  useEffect(() => {
    let unsubscribeAll = null
    let isMounted = true

    const load = async () => {
      // api.query modules appear only after metadata is injected post-'ready';
      // early ticks are a no-op and the next block re-runs this.
      if (!api || !address || !api.query?.lambda?.clientWraps) return

      const bal = {}

      // Lambda wraps (client token ledgers, e.g. "Coffee Shop Coupons")
      const wrapList = []
      if (api.query?.lambda?.clientWraps && api.query?.lambda?.balanceOf) {
        const count = (await api.query.lambda.nextWrapId()).toNumber()
        for (let id = 0; id < count; id += 1) {
          // eslint-disable-next-line no-await-in-loop
          const w = await api.query.lambda.clientWraps(id)
          if (w.isNone) continue
          const wv = w.unwrap()
          // eslint-disable-next-line no-await-in-loop
          const b = await api.query.lambda.balanceOf(id, address)
          bal[`wrap-${id}`] = b
          wrapList.push({
            key: `wrap-${id}`,
            id,
            kind: 'wrap',
            name: decodeBytes(wv.name),
            status: JSON.stringify(wv.status).replace(/"/g, ''),
          })
        }
      }

      // Coupon series (vendor coupon campaigns)
      const coupons = []
      if (api.query?.coupon?.series) {
        for (let id = 0; id < MAX_SERIES_TO_SCAN; id += 1) {
          // eslint-disable-next-line no-await-in-loop
          const s = await api.query.coupon.series(id)
          if (s.isNone) break
          const sv = s.unwrap()
          // eslint-disable-next-line no-await-in-loop
          const b = await api.query.coupon.balances(address, id)
          bal[`coupon-${id}`] = b
          coupons.push({
            key: `coupon-${id}`,
            id,
            kind: 'coupon',
            name: decodeBytes(sv.metadata),
            expiry: sv.expiry.toString(),
          })
        }
      }

      if (!isMounted) return
      const all = [...wrapList, ...coupons]
      setWraps(wrapList)
      setSeriesList(coupons)
      setBalances(bal)
      setActiveKey(cur => (cur === null && all.length > 0 ? all[0].key : cur))
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
  }, [api, address, api?.query?.lambda, api?.query?.coupon])

  const allTokens = [...wraps, ...seriesList]
  const active = allTokens.find(t => t.key === activeKey)
  const activeBalance = active ? balances[active.key] : null
  const canSpend = activeBalance && !activeBalance.isZero()

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
            <Icon name="ticket" /> My Tokens &amp; Coupons
          </Card.Header>
          <Card.Meta style={{ color: '#9fd6ff' }}>
            {accountName} · {address ? `${address.slice(0, 8)}…` : '—'}
          </Card.Meta>

          {allTokens.length === 0 && (
            <Message info style={{ marginTop: '1rem' }}>
              <Message.Header>No tokens yet</Message.Header>
              <p>
                Have the <strong>vendor</strong> send tokens or issue coupons to
                this exact address:
              </p>
              <p style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {address || '…'}
              </p>
            </Message>
          )}

          {allTokens.map(t => {
            const b = balances[t.key]
            const isActive = t.key === activeKey
            return (
              <Segment
                key={t.key}
                inverted
                onClick={() => setActiveKey(t.key)}
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
                      {t.name || (t.kind === 'wrap' ? `Wrap ${t.id}` : `Series ${t.id}`)}
                    </strong>
                    <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                      {t.kind === 'wrap'
                        ? `client token · ${t.status}`
                        : `coupon · expires block ${t.expiry}`}
                    </div>
                  </div>
                  <Label circular color="yellow" size="large">
                    {b ? (t.kind === 'wrap' ? toDisplay(b.toString()) : b.toString()) : '…'}
                  </Label>
                </div>
              </Segment>
            )
          })}

          {active && active.kind === 'wrap' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85em', marginBottom: '0.3rem' }}>
                <Icon name="store" /> Spend at merchant (sends back to The Pub):
              </div>
              <Input
                value={merchant}
                onChange={(_, d) => setMerchant(d.value)}
                size="small"
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              <Input
                type="number"
                min="1"
                value={redeemAmount}
                onChange={(_, d) => setRedeemAmount(d.value)}
                size="small"
                style={{ width: '90px', marginRight: '0.5rem' }}
              />
              <Button
                color="orange"
                size="large"
                disabled={!canSpend || !redeemAmount || !merchant}
                onClick={() => {
                  const amt = `${redeemAmount}00000000000000000`
                  api.tx.lambda
                    .transferSameWrap(active.id, merchant, amt)
                    .signAndSend(currentAccount, ({ status, dispatchError }) => {
                      if (dispatchError) console.error('spend failed', dispatchError.toHuman())
                      else if (status.isFinalized) console.log('spend finalized', status.asFinalized.toString())
                    })
                    .catch(e => console.error('spend error', e))
                }}
              >
                Spend
              </Button>
              <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '0.5rem' }}>
                <Icon name="lock" /> Locked to this client wrap — cannot leave
                the merchant&apos;s ecosystem
              </div>
            </div>
          )}

          {active && active.kind === 'coupon' && (
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
                disabled={!canSpend || !redeemAmount}
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
