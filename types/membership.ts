// 멤버십 관리 시스템 타입 정의

// ===========================================
// 1. 고유번호 (Unique Code) - 티켓과 일정을 연결하는 매핑 엔티티
// ===========================================

export interface UniqueCode {
  id: number;
  title: string; // 필수: 고유번호의 제목
  description?: string; // 선택: 비고
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniqueCodeRequest {
  title: string;
  description?: string;
}

export interface UpdateUniqueCodeRequest extends CreateUniqueCodeRequest {
  id: number;
}

// ===========================================
// 2. 티켓 (Ticket) - 회원이 구매하는 수강권 상품
// ===========================================

export type TicketType = '횟수제' | '기간제';

export type ValidityPeriod = {
  type: '1개월' | '2개월' | '3개월' | '6개월' | '1년' | '기타';
  days: number; // 30, 60, 90, 180, 365 또는 사용자 지정
};

export type UsageLimit = {
  /** 일일 예약 제한 (없을 수도 있음 – 기존 데이터 호환) */
  daily?: {
    type: '제한없음' | '1회' | '2회' | '3회' | '4회' | '직접입력';
    value?: number;
  };
  weekly: {
    type: '제한없음' | '1회' | '2회' | '3회' | '4회' | '직접입력';
    value?: number; // 직접입력일 때 사용
  };
  monthly: {
    type: '제한없음' | '5회' | '10회' | '15회' | '20회' | '직접입력';
    value?: number; // 직접입력일 때 사용
  };
};

export type ReservationTime = {
  type: '시간대지정' | '하루종일';
  startTime?: string; // 30분 단위 (09:00, 09:30, ...)
  endTime?: string; // 30분 단위
  weekdays?: string[];
};

export interface Ticket {
  id: number;
  type: TicketType; // 필수: 횟수제 | 기간제
  title: string; // 필수: 수강권명
  usageCount?: {
    total?: number; // 총 이용횟수
    cancellable?: number; // 취소가능 횟수
  }; // 횟수제인 경우 필수
  validityPeriod: ValidityPeriod; // 필수: 수강권 사용기한
  maxParticipants: number | 'unlimited'; // 필수: 수강 인원
  price: number; // 필수: 판매 가격 (원화)
  usageLimit: UsageLimit; // 필수: 이용 횟수 제한
  reservationTime: ReservationTime; // 필수: 예약 가능한 시간
  isFamilyTicket?: boolean;
  concurrentParticipants?: number;
  sameDayChangeLimit?: number;
  uniqueCodeIds: number[]; // 필수: 연결된 고유번호 ID 배열
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  type: TicketType;
  title: string;
  usageCount?: {
    total?: number;
    cancellable?: number;
  };
  validityPeriod: ValidityPeriod;
  maxParticipants: number | 'unlimited';
  price: number;
  usageLimit: UsageLimit;
  reservationTime: ReservationTime;
  isFamilyTicket?: boolean;
  concurrentParticipants?: number;
  sameDayChangeLimit?: number;
  uniqueCodeIds: number[];
}

export interface UpdateTicketRequest extends CreateTicketRequest {
  id: number;
}

// ===========================================
// 3. 일정 (Schedule) - 실제 수업 및 이용 시간 정보
// ===========================================

// -----------------
// NEW: 시간대 & 요일
// -----------------
export type Weekday = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export interface TimeSlot {
  /** HH:mm 형식 */
  start: string;
  /** HH:mm 형식 */
  end: string;
}

/** 요일 → 슬롯 배열 매핑 */
export type TimeSlots = Partial<Record<Weekday, TimeSlot[]>>;

// -----------------
// NEW: 예약 / 취소 정책
// -----------------

export type TimeUnit = 'minutes' | 'hours' | 'days';

/**
 * 시작/마감 등 상대적 시점을 표현
 *  - from: 기준 (수업시간 | 수업일)
 *  - value: 정수
 *  - unit: 단위 (분/시간/일)
 */
export interface RelativeWindow {
  value: number;
  unit: TimeUnit;
  from: 'classTime' | 'classDate';
}

export interface ReservationPolicy {
  open: RelativeWindow; // 예약 가능 시작
  close: RelativeWindow; // 예약 마감
}

export interface CancellationPolicy {
  open: RelativeWindow; // 취소 가능 시작
  close: RelativeWindow; // 취소 마감
}

// -----------------
// NEW: 예약대기 정책
// -----------------
export interface WaitlistPolicy {
  enabled: boolean;
  /** 자동 예약 승격 시점 (N분 전) */
  autoReserveBefore: {
    value: number;
    unit: 'minutes';
  };
}

export interface Schedule {
  id: number;
  title: string; // 필수: 일정명
  instructor?: string; // 선택: 담당강사
  description: string; // 필수: 일정설명
  maxParticipants: number | 'unlimited'; // 필수: 최대 인원
  location?: string; // 선택: 장소
  period: {
    startDate: string; // 필수: 일정 시작일
    endDate: string; // 필수: 일정 종료일
    weekdays?: string[]; // 요일 지정 (선택)
  };
  /** 요일별 시간 슬롯. 빈 객체 또는 undefined 는 "하루종일" 의미 */
  timeSlots?: TimeSlots;

  /** 예약/취소 정책 */
  reservationPolicy?: ReservationPolicy;
  cancellationPolicy?: CancellationPolicy;

  /** 예약 대기 정책 */
  waitlistPolicy?: WaitlistPolicy;
  uniqueCodeIds: number[]; // 필수: 연결된 고유번호 ID 배열
  createdAt: string;
  updatedAt: string;
  /** (Deprecated) 단일 시간대. timeSlots 사용 권장 */
  time?: {
    startTime: string;
    endTime: string;
  };
}

export interface CreateScheduleRequest {
  title: string;
  instructor?: string;
  description: string;
  maxParticipants: number | 'unlimited';
  location?: string;
  period: {
    startDate: string;
    endDate: string;
    weekdays?: string[];
  };
  timeSlots?: TimeSlots;
  reservationPolicy?: ReservationPolicy;
  cancellationPolicy?: CancellationPolicy;
  waitlistPolicy?: WaitlistPolicy;
  uniqueCodeIds: number[];
}

export interface UpdateScheduleRequest extends CreateScheduleRequest {
  id: number;
}

// ===========================================
// 3b. 예약 (Reservation) - 회원 예약 내역
// ===========================================

export type ReservationStatus = '예약완료' | '취소됨' | '대기';

export interface Reservation {
  id: number;
  memberId: number;
  memberName: string;
  scheduleId: number;
  scheduleTitle: string;
  ticketId?: number;
  ticketTitle?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// 4. 연결 관계 및 공통 타입
// ===========================================

export interface TicketScheduleMapping {
  uniqueCodeId: number;
  ticketId: number;
  scheduleId: number;
  createdAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 폼 검증 관련
export interface ValidationError {
  field: string;
  message: string;
}

// 테이블 정렬 및 필터링
export interface TableOptions {
  page: number;
  itemsPerPage: number;
  sortBy?: string;
  sortDesc?: boolean;
  search?: string;
}

// 모달 상태
export type ModalMode = 'create' | 'edit' | 'view';

export interface ModalState<T> {
  show: boolean;
  mode: ModalMode;
  item: T | null;
}
