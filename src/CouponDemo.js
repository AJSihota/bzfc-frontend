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
  Label,
} from 'semantic-ui-react'
import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

// Demo steps configuration
const DEMO_STEPS = [
  {
    key: 'register',
    title: 'Register',
    description: 'Register as a vendor',
    icon: 'user plus',
    color: '#e94560',
  },
  {
    key: 'approve',
    title: 'Approve',
    description: 'Approve the vendor',
    icon: 'check circle',
    color: '#00d9ff',
  },
  {
    key: 'create',
    title: 'Create',
    description: 'Create coupon series',
    icon: 'ticket',
    color: '#0f3460',
  },
  {
    key: 'issue',
    title: 'Issue',
    description: 'Issue to customer',
    icon: 'gift',
    color: '#00ff88',
  },
  {
    key: 'redeem',
    title: 'Redeem',
    description: 'Redeem coupons',
    icon: 'shopping cart',
    color: '#ffaa00',
  },
]

// Helper to get test account addresses
const TEST_ACCOUNTS = {
  alice: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  bob: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694BH',
  charlie: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
}

function VendorRegistration({ onNext, lastVendorId }) {
  const [metadata, setMetadata] = useState('My Business')
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          You are registering as a <strong>vendor</strong> (merchant) in the coupon system.
          This creates a record that can later be approved by an admin.
        </p>
      </Message>

      <Message warning style={{ marginBottom: '1rem' }}>
        <Message.Header>Quick Tip</Message.Header>
        <p>
          <Icon name="lightbulb" /> Use <strong>Alice</strong> account for testing.
          Select it from the dropdown at the top of the page.
        </p>
      </Message>

      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Field>
          <label style={{ color: 'rgba(255,255,255,0.9)' }}>Business Name / Description</label>
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
            callable: 'registerVendor',
            inputParams: [metadata],
            paramFields: [true],
          }}
        />

        {status && (
          <Message
            positive={status.includes('Finalized') || status.includes('inBlock') || status.includes('Ready')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Finalized') || status.includes('Ready') ? 'Success!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && (status.includes('Finalized') || status.includes('Ready')) && (
          <Button primary fluid onClick={onNext} style={{ marginTop: '1rem' }}>
            <Icon name="arrow right" /> Continue to Approval
          </Button>
        )}
      </Form>
    </div>
  )
}

function VendorApproval({ onNext, suggestedVendorId }) {
  const [vendorId, setVendorId] = useState(suggestedVendorId)
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          An <strong>admin</strong> must approve vendors before they can create coupon series.
          In dev mode, Alice has admin privileges.
        </p>
      </Message>

      <Message positive style={{ marginBottom: '1rem' }}>
        <Message.Header>Auto-Filled</Message.Header>
        <p>
          <Icon name="check circle" /> Vendor ID <strong>{suggestedVendorId}</strong> is pre-filled from your registration.
          Just click Approve!
        </p>
      </Message>

      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Field>
          <label style={{ color: 'rgba(255,255,255,0.9)' }}>Vendor ID to Approve</label>
          <Input
            type="number"
            value={vendorId}
            onChange={(e) => setVendorId(parseInt(e.target.value) || 0)}
          >
            <input />
            <Label basic color="blue" pointing="left">
              Your vendor ID
            </Label>
          </Input>
        </Form.Field>

        <TxButton
          label="Approve Vendor"
          type="SIGNED-TX"
          setStatus={setStatus}
          attrs={{
            palletRpc: 'coupon',
            callable: 'approveVendor',
            inputParams: [vendorId],
            paramFields: [true],
          }}
        />

        {status && (
          <Message
            positive={status.includes('Finalized') || status.includes('inBlock') || status.includes('Ready')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Finalized') || status.includes('Ready') ? 'Vendor Approved!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && (status.includes('Finalized') || status.includes('Ready')) && (
          <Button primary fluid onClick={onNext} style={{ marginTop: '1rem' }}>
            <Icon name="arrow right" /> Continue to Create Series
          </Button>
        )}
      </Form>
    </div>
  )
}

function SeriesCreation({ onNext, suggestedVendorId }) {
  const [vendorId, setVendorId] = useState(suggestedVendorId)
  const [metadata, setMetadata] = useState('Summer Sale 2026')
  const [expiry, setExpiry] = useState(1000000)
  const [maxSupply, setMaxSupply] = useState(1000)
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          You're creating a <strong>coupon series</strong> - a batch of coupons with a max supply and expiration.
          Customers can later receive and redeem these coupons.
        </p>
      </Message>

      <Message positive style={{ marginBottom: '1rem' }}>
        <Message.Header>Defaults Set</Message.Header>
        <p>
          <Icon name="magic" /> All fields are pre-filled with sensible defaults.
          Just click "Create Series" to continue!
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
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>
              Expiry Block
              <Label basic size="mini" style={{ marginLeft: '0.5rem' }}>
                Use high number (e.g., 1000000)
              </Label>
            </label>
            <Input
              type="number"
              value={expiry}
              onChange={(e) => setExpiry(parseInt(e.target.value) || 100)}
            />
          </Form.Field>
          <Form.Field>
            <label style={{ color: 'rgba(255,255,255,0.9)' }}>Max Supply</label>
            <Input
              type="number"
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
            callable: 'createSeries',
            inputParams: [vendorId, metadata, expiry, maxSupply],
            paramFields: [true, true, true, true],
          }}
        />

        {status && (
          <Message
            positive={status.includes('Finalized') || status.includes('inBlock') || status.includes('Ready')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Finalized') || status.includes('Ready') ? 'Series Created!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && (status.includes('Finalized') || status.includes('Ready')) && (
          <Button primary fluid onClick={onNext} style={{ marginTop: '1rem' }}>
            <Icon name="arrow right" /> Continue to Issue Coupons
          </Button>
        )}
      </Form>
    </div>
  )
}

function IssueCoupons({ onNext }) {
  const [seriesId, setSeriesId] = useState(0)
  const [recipient, setRecipient] = useState(TEST_ACCOUNTS.bob)
  const [amount, setAmount] = useState(10)
  const [status, setStatus] = useState('')

  return (
    <div>
      <Message info style={{ marginBottom: '1rem' }}>
        <Message.Header>What's Happening</Message.Header>
        <p>
          You're <strong>issuing coupons</strong> to a customer.
          The customer will receive these coupons and can redeem them later.
        </p>
      </Message>

      <Message positive style={{ marginBottom: '1rem' }}>
        <Message.Header>Pre-Filled for Testing</Message.Header>
        <p>
          <Icon name="user" /> Recipient is set to <strong>Bob's address</strong>.
          Series ID is set to <strong>0</strong> (first series).
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
            positive={status.includes('Finalized') || status.includes('inBlock') || status.includes('Ready')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Finalized') || status.includes('Ready') ? 'Coupons Issued!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && (status.includes('Finalized') || status.includes('Ready')) && (
          <Button primary fluid onClick={onNext} style={{ marginTop: '1rem' }}>
            <Icon name="arrow right" /> Continue to Redeem
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
          You're <strong>redeeming coupons</strong> from your balance.
          This simulates a customer using coupons for a purchase.
        </p>
      </Message>

      <Message warning style={{ marginBottom: '1rem' }}>
        <Message.Header>Important</Message.Header>
        <p>
          <Icon name="exchange" /> Switch to <strong>Bob's account</strong> (the recipient) to redeem the coupons.
          Bob received the coupons in the previous step.
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
            positive={status.includes('Finalized') || status.includes('inBlock') || status.includes('Ready')}
            negative={status.includes('Error') || status.includes('failed')}
            style={{ marginTop: '1rem' }}
          >
            <Message.Header>
              {status.includes('Finalized') || status.includes('Ready') ? 'Coupons Redeemed!' : status.includes('Error') ? 'Error' : 'Processing...'}
            </Message.Header>
            <p>{status}</p>
          </Message>
        )}

        {status && (status.includes('Finalized') || status.includes('Ready')) && (
          <Button positive fluid size="large" onClick={onComplete} style={{ marginTop: '1rem' }}>
            <Icon name="trophy" /> Complete Demo!
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
    <div style={{ textAlign: 'center', padding: '1rem', background: '#1a1a2e', borderRadius: '8px' }}>
      <div style={{ fontSize: '2rem', color: '#00d9ff', fontWeight: 'bold' }}>{balance}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
        Series {seriesId}
      </div>
    </div>
  )
}

export default function CouponDemo(props) {
  const { api, currentAccount } = useSubstrateState()
  
  // Track the vendor ID for auto-filling
  const [lastVendorId, setLastVendorId] = useState(1)
  
  // Check if coupon pallet is available
  const palletAvailable = api && api.tx && api.tx.coupon && api.query && api.query.coupon
  
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])

  const handleStepComplete = (stepKey) => {
    setCompletedSteps([...completedSteps, stepKey])
    setCurrentStep(currentStep + 1)
    // Increment vendor ID hint after registration
    if (stepKey === 'register') {
      setLastVendorId(prev => prev + 1)
    }
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setLastVendorId(1)
  }

  const allCompleted = completedSteps.length === DEMO_STEPS.length

  // Get the actual vendor ID to use (lastVendorId - 1 since we increment after registration)
  const currentVendorId = Math.max(0, lastVendorId - 1)

  // Don't render if pallet not available
  if (!palletAvailable) {
    return (
      <Grid.Column width={16}>
        <Card style={{ background: '#16213e', marginBottom: '2rem' }}>
          <Card.Content>
            <Header as="h2" style={{ color: '#fff', marginBottom: '0.5rem' }}>
              BZFC Coupon Demo
            </Header>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 0 }}>
              Walk through the complete coupon lifecycle
            </p>
          </Card.Content>
        </Card>
        <Message warning>
          <Message.Header>Loading Coupon Module...</Message.Header>
          <p>Waiting for the chain connection to be established.</p>
        </Message>
      </Grid.Column>
    )
  }

  return (
    <Grid.Column width={16}>
      <Card style={{ background: '#16213e', marginBottom: '1rem' }}>
        <Card.Content>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Header as="h2" style={{ color: '#fff', marginBottom: '0.25rem' }}>
                BZFC Coupon Demo
              </Header>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 0, fontSize: '0.95rem' }}>
                Walk through the complete coupon lifecycle in 5 steps
              </p>
            </div>
            {completedSteps.length > 0 && (
              <Button size="small" onClick={resetDemo}>
                <Icon name="redo" /> Reset
              </Button>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Progress Indicator */}
      <Segment style={{ background: '#1a1a2e', padding: '1rem', marginBottom: '1rem' }}>
        <Step.Group size="mini" widths={5} fluid>
          {DEMO_STEPS.map((step, index) => (
            <Step
              key={step.key}
              active={currentStep === index}
              completed={completedSteps.includes(step.key)}
              style={{
                color: completedSteps.includes(step.key) ? '#00ff88' : currentStep === index ? step.color : 'rgba(255,255,255,0.5)',
                background: currentStep === index ? 'rgba(255,255,255,0.05)' : 'transparent',
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
        <Message success size="large" style={{ marginBottom: '1rem' }}>
          <Message.Header>
            <Icon name="trophy" color="yellow" /> Demo Complete!
          </Message.Header>
          <p>
            You've successfully walked through the entire coupon lifecycle:
          </p>
          <Label.Group>
            <Label color="green"><Icon name="check" /> Vendor Registered</Label>
            <Label color="blue"><Icon name="check" /> Vendor Approved</Label>
            <Label color="teal"><Icon name="check" /> Series Created</Label>
            <Label color="olive"><Icon name="check" /> Coupons Issued</Label>
            <Label color="orange"><Icon name="check" /> Coupons Redeemed</Label>
          </Label.Group>
        </Message>
      )}

      {/* Current Step Content */}
      {palletAvailable && !allCompleted && (
        <Segment style={{ background: '#16213e', padding: '1.5rem' }}>
          {currentStep === 0 && (
            <VendorRegistration 
              onNext={() => handleStepComplete('register')} 
              lastVendorId={lastVendorId}
            />
          )}
          {currentStep === 1 && (
            <VendorApproval 
              onNext={() => handleStepComplete('approve')}
              suggestedVendorId={currentVendorId}
            />
          )}
          {currentStep === 2 && (
            <SeriesCreation 
              onNext={() => handleStepComplete('create')}
              suggestedVendorId={currentVendorId}
            />
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
      {palletAvailable && currentAccount && (
        <Segment style={{ background: '#0f3460', padding: '1rem', marginTop: '1rem' }}>
          <Header as="h4" style={{ color: '#fff', marginBottom: '0.5rem' }}>
            <Icon name="id card outline" /> Your Coupon Balance
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
      {palletAvailable && !currentAccount && (
        <Message warning style={{ marginTop: '1rem' }}>
          <Message.Header>Select an Account</Message.Header>
          <p>
            Please select an account from the dropdown at the top of the page to interact with the demo.
            Use <strong>Alice</strong> for most steps (she has admin privileges in dev mode).
          </p>
        </Message>
      )}
    </Grid.Column>
  )
}
