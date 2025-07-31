import type { UniqueCode, Ticket, Schedule, Reservation } from '~/types/membership';

// ===========================================
// Mock Data centralization for membership module
// ===========================================

export const mockUniqueCodes: UniqueCode[] = [
  {
    id: 1,
    title: '기본 골프 프로그램',
    description: '일반 골프 수업과 자유 연습을 위한 기본 프로그램',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 2,
    title: '프리미엄 골프 프로그램',
    description: '개인 레슨과 그룹 수업이 포함된 프리미엄 프로그램',
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
  {
    id: 3,
    title: '주말 골프 패키지',
    description: '주말 전용 골프 프로그램',
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z',
  },
];

export const mockTickets: Ticket[] = [
  {
    id: 1,
    type: '횟수제',
    title: '10회 이용권',
    usageCount: {
      total: 10,
      cancellable: 2,
    },
    validityPeriod: {
      type: '3개월',
      days: 90,
    },
    maxParticipants: 'unlimited',
    price: 150000,
    usageLimit: {
      daily: { type: '제한없음' },
      weekly: { type: '제한없음' },
      monthly: { type: '제한없음' },
    },
    reservationTime: {
      type: '시간대지정',
      startTime: '09:00',
      endTime: '21:00',
      weekdays: ['월', '화', '수', '목', '금'],
    },
    isFamilyTicket: false,
    sameDayChangeLimit: 0,
    uniqueCodeIds: [1],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 2,
    type: '기간제',
    title: '1개월 무제한 이용권',
    validityPeriod: {
      type: '1개월',
      days: 30,
    },
    maxParticipants: 'unlimited',
    price: 200000,
    usageLimit: {
      daily: { type: '제한없음' },
      weekly: { type: '제한없음' },
      monthly: { type: '제한없음' },
    },
    reservationTime: {
      type: '하루종일',
      weekdays: ['월', '화', '수', '목', '금', '토', '일'],
    },
    isFamilyTicket: true,
    concurrentParticipants: 4,
    sameDayChangeLimit: 1,
    uniqueCodeIds: [1, 2],
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
];

export const mockSchedules: Schedule[] = [
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
      weekdays: ['월', '수', '금'],
    },
    timeSlots: {
      월: [{ start: '14:00', end: '16:00' }],
      수: [{ start: '14:00', end: '16:00' }],
      금: [{ start: '14:00', end: '16:00' }],
    },
    uniqueCodeIds: [1],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
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
      weekdays: ['토', '일'],
    },
    timeSlots: {
      토: [{ start: '09:00', end: '18:00' }],
      일: [{ start: '09:00', end: '18:00' }],
    },
    uniqueCodeIds: [3],
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z',
  },
];

export const mockReservations: Reservation[] = [
  {
    id: 1,
    memberId: 101,
    memberName: '홍길동',
    scheduleId: 1,
    scheduleTitle: '초급자 골프 레슨',
    ticketId: 1,
    ticketTitle: '10회 이용권',
    date: '2024-02-05',
    startTime: '14:00',
    endTime: '16:00',
    status: '예약완료',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 2,
    memberId: 102,
    memberName: '김철수',
    scheduleId: 2,
    scheduleTitle: '주말 자유 연습',
    ticketId: 2,
    ticketTitle: '1개월 무제한 이용권',
    date: '2024-02-10',
    startTime: '09:00',
    endTime: '12:00',
    status: '대기',
    createdAt: '2024-01-27T12:00:00Z',
    updatedAt: '2024-01-27T12:00:00Z',
  },
  {
    id: 3,
    memberId: 103,
    memberName: '이영희',
    scheduleId: 1,
    scheduleTitle: '초급자 골프 레슨',
    ticketId: 1,
    ticketTitle: '10회 이용권',
    date: '2024-02-07',
    startTime: '14:00',
    endTime: '16:00',
    status: '취소됨',
    createdAt: '2024-01-28T09:30:00Z',
    updatedAt: '2024-01-29T08:00:00Z',
  },
];
