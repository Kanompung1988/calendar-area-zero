import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore'

const COLLECTION_NAME = 'calendar_events'

// GET - Fetch all events
export async function GET() {
  try {
    const eventsRef = collection(db, COLLECTION_NAME)
    const q = query(eventsRef, orderBy('created_at', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
    }))
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...eventData } = body // Remove id if provided, Firestore will generate it
    
    const newEvent = {
      ...eventData,
      created_at: Timestamp.now()
    }
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newEvent)
    
    return NextResponse.json({
      id: docRef.id,
      ...newEvent,
      created_at: newEvent.created_at.toDate().toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

// PUT - Update existing event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, created_at, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID required' },
        { status: 400 }
      )
    }
    
    const eventRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(eventRef, updateData)
    
    return NextResponse.json({ 
      id, 
      ...updateData,
      created_at: created_at || new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE - Remove event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID required' },
        { status: 400 }
      )
    }
    
    const eventRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(eventRef)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
