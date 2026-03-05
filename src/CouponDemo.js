import React, { useState, useEffect } from 'react'
import {
  Card,
  Grid,
  Button,
  Form,
  Input,
  Message,
  Segment,
  Header,
  Icon,
  Step,
} from 'semantic-ui-react'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

// Demo steps configuration
const DEMO_STEPS = [
  {
    key: 'register',
    title: 'Register Vendor',
    description: 'A vendor (merchant) requests to join the coupon ecosystem',
    icon: 'user plus',
    color: '#e94560',
  },
  {
    key: 'approve',
    title: 'Approve Vendor',
    description: 'Governance reviews and approves the vendor',
    icon: 'check circle',
    color: '#00d9ff',
  },
  {
    key: 'create',
    title: 'Create Series',
    description: 'Vendor creates a coupon series with expiry and supply limit',
    icon: 'ticket',
    color: '#0f3460',
  },
  {
    key: 'issue',
    title: 'Issue Coupons',
    description: 'Vendor issues coupons to a customer',
    icon: 'gift',
    color: '#00ff88',
  },
  {
    key: 'redeem',
    title: 'Redeem Coupons',
    description: 'Customer redeems coupons for goods/services',
    icon: 'shopping cart',
    color: '#ffaa00',
  },
]

function VendorRegistration({ onNext }) {
  const { currentAccount } = useSubstrateState()
  const [metadata, setMetadata] = useState('')
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          You are registering as a <strong>vendor</strong> in the coupon system.
          This creates a record with your business details that can later be approved by governance.
        </p>
      </Message>

      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Field>
          <label style={{ color: 'rgba(255,255,255,0.9)' }}>Vendor Name / Description</label>
          <Input
            placeholder="e.g., ACME Coffee Shop"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
          />
        </Form.Field>

        <TxButton
          label="Register as Vendor"
          type="SIGNED-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'coupon',
            callable: 'register_vendor',
            inputParams: [metadata],
            paramFields: [true],
          }}
        />

        {status && (
          <Message
            positive={status.includes('Ready') || status.includes('inBlock')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Ready') ? 'Success!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && status.includes('Ready') && (
          <Button primary fluid onClick={onNext} style={{ marginTop: '1rem' }}>
            Continue to Next Step
          </Button>
        )}
      </Form>
    </div>
  )
}

function VendorApproval({ onNext }) {
  const [vendorId, setVendorId] = useState(0)
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          Governance (admin) reviews and approves vendors.
          Once approved, vendors can create coupon series and issue coupons.
        </p>
      </Message>

      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Field>
          <label style={{ color: 'rgba(255,255,255,0.9)' }}>Vendor ID to Approve</label>
          <Input
            type="number"
            placeholder="Enter vendor ID (e.g., 0, 1, 2)"
            value={vendorId}
            onChange={(e) => setVendorId(parseInt(e.target.value) || 0)}
          />
        </Form.Field>

        <TxButton
          label="Approve Vendor"
          type="SIGNED-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'coupon',
            callable: 'approve_vendor',
            inputParams: [vendorId],
            paramFields: [true],
          }}
        />

        {status && (
          <Message
            positive={status.includes('Ready') || status.includes('inBlock')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Ready') ? 'Vendor Approved!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && status.includes('Ready') && (
          <Button primary fluid onClick={onNext} style={{ marginTop: '1rem' }}>
            Continue to Next Step
          </Button>
        )}
      </Form>
    </div>
  )
}

function SeriesCreation({ onNext }) {
  const [vendorId, setVendorId] = useState(0)
  const [metadata, setMetadata] = useState('')
  const [expiry, setExpiry] = useState(100)
  const [maxSupply, setMaxSupply] = useState(1000)
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          You are creating a <strong>coupon series</strong> - a batch of coupons with a maximum supply and expiration date.
          Customers can later redeem these coupons for goods/services.
        </p>
      </Message>

      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group widths="equal">
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Your Vendor ID</label>
            <Input
              type="number"
              value={vendorId}
              onChange={(e) => setVendorId(parseInt(e.target.value) || 0)}
            />
          </Form.Field>
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Series Name</label>
            <Input
              placeholder="e.g., Summer Sale 2026"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Expiry (Block Number)</label>
            <Input
              type="number"
              placeholder="e.g., 1000"
              value={expiry}
              onChange={(e) => setExpiry(parseInt(e.target.value) || 100)}
            />
          </Form.Field>
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Max Supply (Total Coupons)</label>
            <Input
              type="number"
              placeholder="e.g., 1000"
              value={maxSupply}
              onChange={(e) => setMaxSupply(parseInt(e.target.value) || 1000)}
            />
          </Form.Field>
        </Form.Group>

        <TxButton
          label="Create Coupon Series"
          type="SIGNED-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'coupon',
            callable: 'create_series',
            inputParams: [vendorId, metadata, expiry, maxSupply],
            paramFields: [true, true, true, true],
          }}
        />

        {status && (
          <Message
            positive={status.includes('Ready') || status.includes('inBlock')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Ready') ? 'Series Created!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && status.includes('Ready') && (
          <Button primary fluid onClick={onNext} style={{ marginTop: '1rem' }}>
            Continue to Next Step
          </Button>
        )}
      </Form>
    </div>
  )
}

function IssueCoupons({ onNext }) {
  const [seriesId, setSeriesId] = useState(0)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(10)
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          You are <strong>issuing coupons</strong> to a customer.
          The customer will receive these coupons in their wallet and can redeem them later.
        </p>
      </Message>

      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group widths="equal">
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Series ID</label>
            <Input
              type="number"
              value={seriesId}
              onChange={(e) => setSeriesId(parseInt(e.target.value) || 0)}
            />
          </Form.Field>
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Recipient Address</label>
            <Input
              placeholder="5GrwvaEF5zXb..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </Form.Field>
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
            />
          </Form.Field>
        </Form.Group>

        <TxButton
          label="Issue Coupons"
          type="SIGNED-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'coupon',
            callable: 'issue',
            inputParams: [seriesId, recipient, amount],
            paramFields: [true, true, true],
          }}
        />

        {status && (
          <Message
            positive={status.includes('Ready') || status.includes('inBlock')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Ready') ? 'Coupons Issued!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && status.includes('Ready') && (
          <Button primary fluid onClick={onNext} style={{ marginTop: '1rem' }}>
            Continue to Next Step
          </Button>
        )}
      </Form>
    </div>
  )
}

function RedeemCoupons({ onComplete }) {
  const [seriesId, setSeriesId] = useState(0)
  const [amount, setAmount] = useState(1)
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          You are <strong>redeeming coupons</strong> from your balance.
          This represents using coupons to purchase goods/services from a vendor.
        </p>
      </Message>

      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group widths="equal">
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Series ID</label>
            <Input
              type="number"
              value={seriesId}
              onChange={(e) => setSeriesId(parseInt(e.target.value) || 0)}
            />
          </Form.Field>
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Amount to Redeem</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
            />
          </Form.Field>
        </Form.Group>

        <TxButton
          label="Redeem Coupons"
          type="SIGNED-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'coupon',
            callable: 'redeem',
            inputParams: [seriesId, amount],
            paramFields: [true, true],
          }}
        />

        {status && (
          <Message
            positive={status.includes('Ready') || status.includes('inBlock')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Ready') ? 'Coupons Redeemed!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && status.includes('Ready') && (
          <Button positive fluid onClick={onComplete} style={{ marginTop: '1rem' }}>
            Complete Demo!
          </Button>
        )}
      </Form>
    </div>
  )
}

function CouponBalance({ seriesId }) {
  const { api, currentAccount } = useSubstrateState()
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    if (!api || !api.query || !currentAccount) return

    let unsubscribe
    api.query.coupon?.balances(currentAccount.address, seriesId, (result) => {
      if (result.isNone) {
        setBalance(0)
      } else {
        setBalance(result.toHuman ? result.toHuman() : result.toString())
      }
    }).then(unsub => {
      unsubscribe = unsub
    }).catch(console.error)

    return () => {
      unsubscribe && unsubscribe()
    }
  }, [api, currentAccount, seriesId])

  if (balance === null) return null

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <div style={{ fontSize: '2rem', color: '#00d9ff', fontWeight: 'bold' }}>{balance}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
        Series {seriesId}
      </div>
    </div>
  )
}

export default function CouponDemo() {
  const { currentAccount } = useSubstrateState()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])

  const handleStepComplete = (stepKey) => {
    setCompletedSteps([...completedSteps, stepKey])
    setCurrentStep(currentStep + 1)
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setCompletedSteps([])
  }

  const allCompleted = completedSteps.length === DEMO_STEPS.length

  return (
    <Grid.Column width={16}>
      <Card style={{ background: '#16213e', marginBottom: '2rem' }}>
        <Card.Content>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Header as="h2" style={{ color: '#fff', marginBottom: '0.5rem' }}>
                BZFC Coupon Demo
              </Header>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 0 }}>
                Walk through the complete coupon lifecycle
              </p>
            </div>
            {completedSteps.length > 0 && (
              <Button size="small" onClick={resetDemo}>
                <Icon name="redo" /> Reset Demo
              </Button>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Progress Indicator */}
      <Segment style={{ background: '#1a1a2e', padding: '1.5rem', marginBottom: '1rem' }}>
        <Step.Group size="mini" widths={5}>
          {DEMO_STEPS.map((step, index) => (
            <Step
              key={step.key}
              active={currentStep === index}
              completed={completedSteps.includes(step.key)}
              style={{
                color: completedSteps.includes(step.key) ? '#00ff88' : currentStep === index ? step.color : 'rgba(255,255,255,0.5)'
              }}
            >
              <Icon
                name={completedSteps.includes(step.key) ? 'check' : step.icon}
              />
              <Step.Content>
                <Step.Title>{step.title}</Step.Title>
              </Step.Content>
            </Step>
          ))}
        </Step.Group>
      </Segment>

      {/* Completion Message */}
      {allCompleted && (
        <Message success style={{ marginBottom: '1rem' }}>
          <Message.Header>Demo Complete!</Message.Header>
          <p>
            You've successfully walked through the entire coupon lifecycle.
            This demonstrates the core functionality of the BZFC Coupon system.
          </p>
        </Message>
      )}

      {/* Current Step Content */}
      {!allCompleted && (
        <Segment style={{ background: '#16213e', padding: '2rem' }}>
          {currentStep === 0 && (
            <VendorRegistration onNext={() => handleStepComplete('register')} />
          )}
          {currentStep === 1 && (
            <VendorApproval onNext={() => handleStepComplete('approve')} />
          )}
          {currentStep === 2 && (
            <SeriesCreation onNext={() => handleStepComplete('create')} />
          )}
          {currentStep === 3 && (
            <IssueCoupons onNext={() => handleStepComplete('issue')} />
          )}
          {currentStep === 4 && (
            <RedeemCoupons onComplete={() => handleStepComplete('redeem')} />
          )}
        </Segment>
      )}

      {/* Current Balance Display */}
      {currentAccount && (
        <Segment style={{ background: '#0f3460', padding: '1rem', marginTop: '1rem' }}>
          <Header as="h4" style={{ color: '#fff', marginBottom: '0.5rem' }}>
            <Icon name="wallet" /> Your Coupon Balance
          </Header>
          <Grid columns={3} stackable>
            <Grid.Row>
              <Grid.Column>
                <CouponBalance seriesId={0} />
              </Grid.Column>
              <Grid.Column>
                <CouponBalance seriesId={1} />
              </Grid.Column>
              <Grid.Column>
                <CouponBalance seriesId={2} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      )}

      {/* Instructions for Demo */}
      {!currentAccount && (
        <Message warning style={{ marginTop: '1rem' }}>
          <Message.Header>Connect Your Wallet</Message.Header>
          <p>
            Please select an account from the dropdown above to interact with the coupon demo.
            You can use the built-in test accounts (Alice, Bob, etc.) for testing.
          </p>
        </Message>
      )}
    </Grid.Column>
  )
}
