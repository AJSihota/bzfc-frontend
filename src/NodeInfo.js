import React, { useEffect, useState } from 'react'
import { Card, Icon, Grid } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

function Main(props) {
  const { api, socket } = useSubstrateState()
  const [nodeInfo, setNodeInfo] = useState({})

  useEffect(() => {
    const getInfo = async () => {
      try {
        const [chain, nodeName, nodeVersion] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version(),
        ])
        setNodeInfo({ chain, nodeName, nodeVersion })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [api.rpc.system])

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>
            <Icon name="cube" style={{ marginRight: '8px', color: '#e94560' }} />
            BZFC Node
          </Card.Header>
          <Card.Meta>
            <span>{nodeInfo.chain || 'BZFC Development Chain'}</span>
          </Card.Meta>
          <Card.Description>
            <div style={{ marginBottom: '8px' }}>
              <strong>Socket:</strong>
            </div>
            <code style={{ 
              fontSize: '0.8rem', 
              wordBreak: 'break-all',
              color: '#00d9ff'
            }}>
              {socket}
            </code>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name="setting" /> v{nodeInfo.nodeVersion}
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function NodeInfo(props) {
  const { api } = useSubstrateState()
  return api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.name &&
    api.rpc.system.version ? (
    <Main {...props} />
  ) : null
}
