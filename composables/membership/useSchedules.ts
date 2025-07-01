import type {
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ModalState
} from '~/types/membership'

import { mockSchedules } from '~/composables/membership/mockData'

/**
 * Schedule management composable (일정 관리)
 */
export const useSchedules = () => {
  // ===========================================
  // State
  // ===========================================
  const schedules = useState<Schedule[]>(
    'membership-schedules',
    () => [...mockSchedules]
  )

  // modal state (아직 사용되지 않을 수 있음)
  const scheduleModal = useState<ModalState<Schedule>>('schedule-modal', () => ({
    show: false,
    mode: 'create',
    item: null
  }))

  // ===========================================
  // CRUD
  // ===========================================
  const createSchedule = async (
    data: CreateScheduleRequest
  ): Promise<Schedule> => {
    const newId = Math.max(0, ...schedules.value.map(i => i.id)) + 1
    const now = new Date().toISOString()

    const created: Schedule = {
      id: newId,
      ...data,
      createdAt: now,
      updatedAt: now
    }

    schedules.value.unshift(created)
    return created
  }

  const updateSchedule = async (
    data: UpdateScheduleRequest
  ): Promise<Schedule> => {
    const idx = schedules.value.findIndex(i => i.id === data.id)
    if (idx === -1) throw new Error('일정을 찾을 수 없습니다.')

    const existing = schedules.value[idx]!
    const updated: Schedule = {
      ...data,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    }

    schedules.value[idx] = updated
    return updated
  }

  const deleteSchedule = async (id: number): Promise<void> => {
    const idx = schedules.value.findIndex(i => i.id === id)
    if (idx === -1) throw new Error('일정을 찾을 수 없습니다.')

    schedules.value.splice(idx, 1)
  }

  // ===========================================
  // Modal helpers (예정)
  // ===========================================
  const openScheduleModal = (
    mode: 'create' | 'edit' | 'view',
    item?: Schedule
  ) => {
    scheduleModal.value = {
      show: true,
      mode,
      item: item || null
    }
  }

  const closeScheduleModal = () => {
    scheduleModal.value = {
      show: false,
      mode: 'create',
      item: null
    }
  }

  return {
    // state
    schedules: readonly(schedules),
    scheduleModal: readonly(scheduleModal),

    // crud
    createSchedule,
    updateSchedule,
    deleteSchedule,

    // modal helpers
    openScheduleModal,
    closeScheduleModal
  }
} 