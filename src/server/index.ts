import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Room } from './Room'

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.set('trust proxy', true);

app.listen(process.env.PORT ?? 3000, () => {
  console.log('Server running on port ' + (process.env.PORT ?? '3000'))
})

// app.get('*', (_, res) => {
//   res.status(404).send('Not found')
// })

const rooms: {
  [roomCode: string]: Room
} = {}

app.post('/createRoom', (_, res) => {
  let room: Room
  while (true) {
    room = Room.createRoom()
    if (!rooms[room.roomCode]) {
      rooms[room.roomCode] = room
      break
    }
  }

  console.log(`Room created: ${room.roomCode}`)

  const clientId = crypto.getRandomValues(new Uint32Array(1))[0].toString()

  const success = room.addClient({
    id: clientId,
    room: room.roomCode,
    player: 'x'
  })

  if (!success) {
    res.status(500).send('Failed to add client to room')
    console.log(`Failed to add client to room: ${room.roomCode}`)
    delete rooms[room.roomCode]
    console.log(`Deleted room: ${room.roomCode}`)
    return
  }

  console.log(`Client added to room: ${room.roomCode}`)

  // const payload = {
  //   roomCode: room.roomCode,
  //   clientId
  // }

  // res
  //   .status(200)
  //   .send(payload)

  res.redirect(303, `/room/${room.roomCode}?clientId=${clientId}`)
})

app.post('/joinRoom/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode
  const room = rooms[roomCode];

  if (!room) {
    res.status(404).send('Room not found');
    return;
  }

  const clientId = crypto.getRandomValues(new Uint32Array(1))[0].toString()

  const success = room.addClient({
    id: clientId,
    room: room.roomCode,
    player: 'o'
  })

  if (!success) {
    res.status(400).send('Room is full')
    console.log(`Client failed to join room: ${room.roomCode}`)
    return
  }

  console.log(`Client joined room: ${room.roomCode}`)

  // const payload = {
  //   roomCode: room.roomCode,
  //   clientId
  // }

  res.redirect(303, `/room/${room.roomCode}?clientId=${clientId}`)
})

app.get('/room/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode
  const room = rooms[roomCode]

  console.log(`Client connecting to room: ${roomCode}`)

  if (!room) {
    console.log(`Room not found: ${roomCode}`)
    res.status(404).send('Room not found')
    return
  }

  const clientId = req.query.clientId as string

  const client = room.clients.find(c => c.id === clientId)

  if (!client) {
    console.log(`Client not found in room: ${roomCode}`)
    res.status(404).send('Client not found in room')
    return
  }

  req.on('close', () => {
    room.disconnectClient(client)

    if (room.clients.length === 0) {
      delete rooms[room.roomCode]
      console.log(`Deleted room: ${room.roomCode}`)
    }
  })

  req.on('error', () => {
    console.log('Error')
  })

  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers)


  room.addClient({
    id: clientId,
    room: room.roomCode,
    player: client.player,
    res
  })
})

app.post('/room/:roomCode/taketurn', (req, res) => {
  const roomCode = req.params.roomCode
  const room = rooms[roomCode]

  if (!room) {
    console.log(`Room not found: ${roomCode}`)
    res.status(404).send('Room not found')
    return
  }

  const clientId = req.query.clientId as string
  const client = room.clients.find(c => c.id === clientId)

  if (!client) {
    console.log(`Client not found in room: ${roomCode}`)
    res.status(404).send('Client not found in room')
    return
  }

  
  const data = req.body

  if (!data) {
    console.log('Missing data')
    res.status(400).send('Missing data')
    return
  }

  const boardIndex = data.boardIndex
  const fieldIndex = data.fieldIndex

  if (typeof boardIndex !== 'number' || typeof fieldIndex !== 'number') {
    console.log('Invalid data')
    res.status(400).send('Invalid data')
    return
  }

  room.takeTurn(client, boardIndex, fieldIndex)

  res.status(200).send()
})

app.post('/room/:roomCode/leave', (req, res) => {
  const roomCode = req.params.roomCode
  const room = rooms[roomCode]

  if (!room) {
    console.log(`Room not found: ${roomCode}`)
    res.status(404).send('Room not found')
    return
  }

  const clientId = req.query.clientId as string
  const client = room.clients.find(c => c.id === clientId)

  if (!client) {
    console.log(`Client not found in room: ${roomCode}`)
    res.status(404).send('Client not found in room')
    return
  }
  
  client.res?.end()

  res.status(200).send()
})
