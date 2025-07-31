import type { Reservation, ReservationStatus, ModalState } from '~/types/membership';

import { mockReservations } from '~/composables/membership/mockData';

/**
 * Reservation management composable (예약 내역 관리)
 */
export const useReservations = () => {
  // ===========================================
  // State
  // ===========================================
  const reservations = useState<Reservation[]>('membership-reservations', () => [...mockReservations]);

  // 모달 상태 (조회/상세/취소 등)
  const reservationModal = useState<ModalState<Reservation>>('reservation-modal', () => ({
    show: false,
    mode: 'view',
    item: null,
  }));

  // ===========================================
  // Helpers
  // ===========================================
  const nextId = () => Math.max(0, ...reservations.value.map((r) => r.id)) + 1;

  // ===========================================
  // CRUD (create/update/cancel) – 실제 API 전까지 목데이터 조작
  // ===========================================
  const createReservation = async (
    data: Omit<Reservation, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<Reservation> => {
    const now = new Date().toISOString();
    const created: Reservation = {
      id: nextId(),
      status: '예약완료',
      createdAt: now,
      updatedAt: now,
      ...data,
    };

    reservations.value.unshift(created);
    return created;
  };

  const updateReservationStatus = async (id: number, status: ReservationStatus): Promise<Reservation> => {
    const idx = reservations.value.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('예약을 찾을 수 없습니다.');

    const existing = reservations.value[idx]!;
    const updated: Reservation = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    };

    reservations.value[idx] = updated;
    return updated;
  };

  const deleteReservation = async (id: number): Promise<void> => {
    const idx = reservations.value.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('예약을 찾을 수 없습니다.');

    reservations.value.splice(idx, 1);
  };

  // ===========================================
  // Modal helpers
  // ===========================================
  const openReservationModal = (mode: 'create' | 'edit' | 'view', item?: Reservation) => {
    reservationModal.value = {
      show: true,
      mode,
      item: item || null,
    };
  };

  const closeReservationModal = () => {
    reservationModal.value = {
      show: false,
      mode: 'view',
      item: null,
    };
  };

  return {
    // state
    reservations: readonly(reservations),
    reservationModal: readonly(reservationModal),

    // operations
    createReservation,
    updateReservationStatus,
    deleteReservation,

    // modal helpers
    openReservationModal,
    closeReservationModal,
  };
};
