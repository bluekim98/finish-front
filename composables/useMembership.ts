import type { 
  UniqueCode, 
  Ticket, 
  Schedule,
  CreateUniqueCodeRequest,
  UpdateUniqueCodeRequest,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ModalState
} from '~/types/membership'

// ===========================================
// 목 데이터 (Mock Data)
// ===========================================

const mockUniqueCodes: UniqueCode[] = [
  {
    id: 1,
    title: '기본 골프 프로그램',
    description: '일반 골프 수업과 자유 연습을 위한 기본 프로그램',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 2,
    title: '프리미엄 골프 프로그램',
    description: '개인 레슨과 그룹 수업이 포함된 프리미엄 프로그램',
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  },
  {
    id: 3,
    title: '주말 골프 패키지',
    description: '주말 전용 골프 프로그램',
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z'
  }
]

const mockTickets: Ticket[] = [
  {
    id: 1,
    type: '횟수제',
    title: '10회 이용권',
    usageCount: {
      total: 10,
      cancellable: 2
    },
    validityPeriod: {
      type: '3개월',
      days: 90
    },
    maxParticipants: 'unlimited',
    price: 150000,
    usageLimit: {
      weekly: { type: '제한없음' },
      monthly: { type: '제한없음' }
    },
    reservationTime: {
      type: '시간대지정',
      startTime: '09:00',
      endTime: '21:00'
    },
    uniqueCodeIds: [1],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 2,
    type: '기간제',
    title: '1개월 무제한 이용권',
    validityPeriod: {
      type: '1개월',
      days: 30
    },
    maxParticipants: 'unlimited',
    price: 200000,
    usageLimit: {
      weekly: { type: '제한없음' },
      monthly: { type: '제한없음' }
    },
    reservationTime: {
      type: '하루종일'
    },
    uniqueCodeIds: [1, 2],
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  }
]

const mockSchedules: Schedule[] = [
  {
    id: 1,
    title: '초급자 골프 레슨',
    instructor: '김골프',
    description: '골프 기초를 배우는 초급자 대상 레슨',
    maxParticipants: 8,
    location: '1번 연습장',
    period: {
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      weekdays: ['월', '수', '금']
    },
    time: {
      startTime: '14:00',
      endTime: '16:00'
    },
    reservationCancelPolicy: {
      enabled: true,
      absolute: {
        hours: 24
      }
    },
    uniqueCodeIds: [1],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 2,
    title: '주말 자유 연습',
    description: '주말 자유 연습 시간',
    maxParticipants: 'unlimited',
    location: '전체 연습장',
    period: {
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      weekdays: ['토', '일']
    },
    time: {
      startTime: '09:00',
      endTime: '18:00'
    },
    uniqueCodeIds: [3],
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z'
  }
]

// ===========================================
// Composable
// ===========================================

export const useMembership = () => {
  // 상태 관리
  const uniqueCodes = useState<UniqueCode[]>('membership-unique-codes', () => [...mockUniqueCodes])
  const tickets = useState<Ticket[]>('membership-tickets', () => [...mockTickets])
  const schedules = useState<Schedule[]>('membership-schedules', () => [...mockSchedules])

  // 모달 상태 관리
  const uniqueCodeModal = useState<ModalState<UniqueCode>>('unique-code-modal', () => ({
    show: false,
    mode: 'create',
    item: null
  }))

  const ticketModal = useState<ModalState<Ticket>>('ticket-modal', () => ({
    show: false,
    mode: 'create',
    item: null
  }))

  const scheduleModal = useState<ModalState<Schedule>>('schedule-modal', () => ({
    show: false,
    mode: 'create',
    item: null
  }))

  // ===========================================
  // 고유번호 CRUD
  // ===========================================

  const createUniqueCode = async (data: CreateUniqueCodeRequest): Promise<UniqueCode> => {
    const newId = Math.max(...uniqueCodes.value.map(item => item.id)) + 1
    const now = new Date().toISOString()
    
    const newUniqueCode: UniqueCode = {
      id: newId,
      title: data.title,
      description: data.description,
      createdAt: now,
      updatedAt: now
    }
    
    uniqueCodes.value.unshift(newUniqueCode)
    return newUniqueCode
  }

  const updateUniqueCode = async (data: UpdateUniqueCodeRequest): Promise<UniqueCode> => {
    const index = uniqueCodes.value.findIndex(item => item.id === data.id)
    if (index === -1) {
      throw new Error('고유번호를 찾을 수 없습니다.')
    }

    const existingItem = uniqueCodes.value[index]!
    const updatedUniqueCode: UniqueCode = {
      id: existingItem.id,
      title: data.title,
      description: data.description,
      createdAt: existingItem.createdAt,
      updatedAt: new Date().toISOString()
    }

    uniqueCodes.value[index] = updatedUniqueCode
    return updatedUniqueCode
  }

  const deleteUniqueCode = async (id: number): Promise<void> => {
    // 연결된 티켓이나 일정이 있는지 확인
    const hasTickets = tickets.value.some(ticket => ticket.uniqueCodeIds.includes(id))
    const hasSchedules = schedules.value.some(schedule => schedule.uniqueCodeIds.includes(id))
    
    if (hasTickets || hasSchedules) {
      throw new Error('연결된 티켓 또는 일정이 있어 삭제할 수 없습니다.')
    }

    const index = uniqueCodes.value.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('고유번호를 찾을 수 없습니다.')
    }

    uniqueCodes.value.splice(index, 1)
  }

  // ===========================================
  // 티켓 CRUD
  // ===========================================

  const createTicket = async (data: CreateTicketRequest): Promise<Ticket> => {
    const newId = Math.max(...tickets.value.map(item => item.id), 0) + 1
    const now = new Date().toISOString()
    
    const newTicket: Ticket = {
      id: newId,
      type: data.type,
      title: data.title,
      usageCount: data.usageCount,
      validityPeriod: data.validityPeriod,
      maxParticipants: data.maxParticipants,
      price: data.price,
      usageLimit: data.usageLimit,
      reservationTime: data.reservationTime,
      uniqueCodeIds: data.uniqueCodeIds,
      createdAt: now,
      updatedAt: now
    }
    
    tickets.value.unshift(newTicket)
    return newTicket
  }

  const updateTicket = async (data: UpdateTicketRequest): Promise<Ticket> => {
    const index = tickets.value.findIndex(item => item.id === data.id)
    if (index === -1) {
      throw new Error('티켓을 찾을 수 없습니다.')
    }

    const existingItem = tickets.value[index]!
    const updatedTicket: Ticket = {
      id: existingItem.id,
      type: data.type,
      title: data.title,
      usageCount: data.usageCount,
      validityPeriod: data.validityPeriod,
      maxParticipants: data.maxParticipants,
      price: data.price,
      usageLimit: data.usageLimit,
      reservationTime: data.reservationTime,
      uniqueCodeIds: data.uniqueCodeIds,
      createdAt: existingItem.createdAt,
      updatedAt: new Date().toISOString()
    }

    tickets.value[index] = updatedTicket
    return updatedTicket
  }

  const deleteTicket = async (id: number): Promise<void> => {
    const index = tickets.value.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('티켓을 찾을 수 없습니다.')
    }

    tickets.value.splice(index, 1)
  }

  // ===========================================
  // 일정 CRUD (기본 구조만)
  // ===========================================

  const createSchedule = async (data: CreateScheduleRequest): Promise<Schedule> => {
    // TODO: API integration
    console.log('Creating schedule:', data)
    throw new Error('아직 구현되지 않았습니다.')
  }

  const updateSchedule = async (data: UpdateScheduleRequest): Promise<Schedule> => {
    // TODO: API integration
    console.log('Updating schedule:', data)
    throw new Error('아직 구현되지 않았습니다.')
  }

  const deleteSchedule = async (id: number): Promise<void> => {
    // TODO: API integration
    console.log('Deleting schedule:', id)
    throw new Error('아직 구현되지 않았습니다.')
  }

  // ===========================================
  // 유틸리티 함수들
  // ===========================================

  const getUniqueCodeById = (id: number): UniqueCode | undefined => {
    return uniqueCodes.value.find(item => item.id === id)
  }

  const getTicketsByUniqueCodeId = (uniqueCodeId: number): Ticket[] => {
    return tickets.value.filter(ticket => ticket.uniqueCodeIds.includes(uniqueCodeId))
  }

  const getSchedulesByUniqueCodeId = (uniqueCodeId: number): Schedule[] => {
    return schedules.value.filter(schedule => schedule.uniqueCodeIds.includes(uniqueCodeId))
  }

  // ===========================================
  // 모달 관리 함수들
  // ===========================================

  const openUniqueCodeModal = (mode: 'create' | 'edit' | 'view', item?: UniqueCode) => {
    uniqueCodeModal.value = {
      show: true,
      mode,
      item: item || null
    }
  }

  const closeUniqueCodeModal = () => {
    uniqueCodeModal.value = {
      show: false,
      mode: 'create',
      item: null
    }
  }

  const openTicketModal = (mode: 'create' | 'edit' | 'view', item?: Ticket) => {
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
    // 상태
    uniqueCodes: readonly(uniqueCodes),
    tickets: readonly(tickets),
    schedules: readonly(schedules),
    
    // 모달 상태
    uniqueCodeModal: readonly(uniqueCodeModal),
    ticketModal: readonly(ticketModal),
    scheduleModal: readonly(scheduleModal),

    // 고유번호 CRUD
    createUniqueCode,
    updateUniqueCode,
    deleteUniqueCode,

    // 티켓 CRUD
    createTicket,
    updateTicket,
    deleteTicket,

    // 일정 CRUD (미구현)
    createSchedule,
    updateSchedule,
    deleteSchedule,

    // 유틸리티
    getUniqueCodeById,
    getTicketsByUniqueCodeId,
    getSchedulesByUniqueCodeId,

    // 모달 관리
    openUniqueCodeModal,
    closeUniqueCodeModal,
    openTicketModal,
    closeTicketModal
  }
} 