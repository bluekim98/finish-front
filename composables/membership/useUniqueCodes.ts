import type {
  UniqueCode,
  CreateUniqueCodeRequest,
  UpdateUniqueCodeRequest,
  ModalState
} from '~/types/membership'

import { mockUniqueCodes } from '~/composables/membership/mockData'

/**
 * UniqueCode management composable (고유번호 관리)
 * 각 탭에서 `useUniqueCodes()` 를 호출하여 상태 및 CRUD를 사용할 수 있습니다.
 */
export const useUniqueCodes = () => {
  // ===========================================
  // State
  // ===========================================
  const uniqueCodes = useState<UniqueCode[]>(
    'membership-unique-codes',
    () => [...mockUniqueCodes]
  )

  // modal state (create | edit | view)
  const uniqueCodeModal = useState<ModalState<UniqueCode>>(
    'unique-code-modal',
    () => ({
      show: false,
      mode: 'create',
      item: null
    })
  )

  // ===========================================
  // CRUD
  // ===========================================
  const createUniqueCode = async (
    data: CreateUniqueCodeRequest
  ): Promise<UniqueCode> => {
    const newId = Math.max(0, ...uniqueCodes.value.map(i => i.id)) + 1
    const now = new Date().toISOString()

    const created: UniqueCode = {
      id: newId,
      title: data.title,
      description: data.description,
      createdAt: now,
      updatedAt: now
    }

    uniqueCodes.value.unshift(created)
    return created
  }

  const updateUniqueCode = async (
    data: UpdateUniqueCodeRequest
  ): Promise<UniqueCode> => {
    const idx = uniqueCodes.value.findIndex(i => i.id === data.id)
    if (idx === -1) throw new Error('고유번호를 찾을 수 없습니다.')

    const existing = uniqueCodes.value[idx]!
    const updated: UniqueCode = {
      id: existing.id,
      title: data.title,
      description: data.description,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    }

    uniqueCodes.value[idx] = updated
    return updated
  }

  const deleteUniqueCode = async (id: number): Promise<void> => {
    const index = uniqueCodes.value.findIndex(i => i.id === id)
    if (index === -1) throw new Error('고유번호를 찾을 수 없습니다.')

    uniqueCodes.value.splice(index, 1)
  }

  // ===========================================
  // Modal helpers
  // ===========================================
  const openUniqueCodeModal = (
    mode: 'create' | 'edit' | 'view',
    item?: UniqueCode
  ) => {
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

  // ===========================================
  // Utilities
  // ===========================================
  const getUniqueCodeById = (id: number): UniqueCode | undefined => {
    return uniqueCodes.value.find(item => item.id === id)
  }

  return {
    // state
    uniqueCodes: readonly(uniqueCodes),
    uniqueCodeModal: readonly(uniqueCodeModal),

    // crud
    createUniqueCode,
    updateUniqueCode,
    deleteUniqueCode,

    // utils
    getUniqueCodeById,

    // modal helpers
    openUniqueCodeModal,
    closeUniqueCodeModal
  }
} 