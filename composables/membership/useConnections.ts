import type { Ticket, Schedule } from '~/types/membership'

import { useTickets } from '~/composables/membership/useTickets'
import { useSchedules } from '~/composables/membership/useSchedules'

/**
 * Connection utility composable (연결 관리)
 * 고유번호 ID 기준으로 티켓/일정 필터링 등 보조 기능 제공합니다.
 */
export const useConnections = () => {
  const { tickets } = useTickets()
  const { schedules } = useSchedules()

  const getTicketsByUniqueCodeId = (uniqueCodeId: number): Ticket[] => {
    return (tickets.value as unknown as Ticket[]).filter(ticket =>
      ticket.uniqueCodeIds.includes(uniqueCodeId)
    )
  }

  const getSchedulesByUniqueCodeId = (uniqueCodeId: number): Schedule[] => {
    return (schedules.value as unknown as Schedule[]).filter(schedule =>
      schedule.uniqueCodeIds.includes(uniqueCodeId)
    )
  }

  return {
    getTicketsByUniqueCodeId,
    getSchedulesByUniqueCodeId
  }
} 