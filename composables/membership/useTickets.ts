import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  ModalState
} from '~/types/membership'

import { mockTickets } from '~/composables/membership/mockData'

/**
 * Ticket management composable (티켓 관리)
 */
export const useTickets = () => {
  // ===========================================
  // State
  // ===========================================
  const tickets = useState<Ticket[]>(
    'membership-tickets',
    () => [...mockTickets]
  )

  // modal state
  const ticketModal = useState<ModalState<Ticket>>('ticket-modal', () => ({
    show: false,
    mode: 'create',
    item: null
  }))

  // ===========================================
  // CRUD
  // ===========================================
  const createTicket = async (data: CreateTicketRequest): Promise<Ticket> => {
    const newId = Math.max(0, ...tickets.value.map(i => i.id)) + 1
    const now = new Date().toISOString()

    const created: Ticket = {
      id: newId,
      ...data,
      createdAt: now,
      updatedAt: now
    }

    tickets.value.unshift(created)
    return created
  }

  const updateTicket = async (data: UpdateTicketRequest): Promise<Ticket> => {
    const idx = tickets.value.findIndex(i => i.id === data.id)
    if (idx === -1) throw new Error('티켓을 찾을 수 없습니다.')

    const existing = tickets.value[idx]!
    const updated: Ticket = {
      ...data,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    }

    tickets.value[idx] = updated
    return updated
  }

  const deleteTicket = async (id: number): Promise<void> => {
    const idx = tickets.value.findIndex(i => i.id === id)
    if (idx === -1) throw new Error('티켓을 찾을 수 없습니다.')

    tickets.value.splice(idx, 1)
  }

  // ===========================================
  // Modal helpers
  // ===========================================
  const openTicketModal = (
    mode: 'create' | 'edit' | 'view',
    item?: Ticket
  ) => {
    ticketModal.value = {
      show: true,
      mode,
      item: item || null
    }
  }

  const closeTicketModal = () => {
    ticketModal.value = {
      show: false,
      mode: 'create',
      item: null
    }
  }

  return {
    // state
    tickets: readonly(tickets),
    ticketModal: readonly(ticketModal),

    // crud
    createTicket,
    updateTicket,
    deleteTicket,

    // modal helpers
    openTicketModal,
    closeTicketModal
  }
} 