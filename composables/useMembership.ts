import { useUniqueCodes } from '~/composables/membership/useUniqueCodes'
import { useTickets } from '~/composables/membership/useTickets'
import { useSchedules } from '~/composables/membership/useSchedules'
import { useConnections } from '~/composables/membership/useConnections'

/**
 * Aggregated composable that combines UniqueCode, Ticket, Schedule, and Connection logic.
 * 기존 코드 호환을 위해 기존 `useMembership()` API 유지합니다.
 */
export const useMembership = () => {
  return {
    ...useUniqueCodes(),
    ...useTickets(),
    ...useSchedules(),
    ...useConnections()
  }
} 