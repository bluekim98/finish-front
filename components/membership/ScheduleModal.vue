<template>
  <VDialog
    :model-value="props.show"
    @update:model-value="$emit('update:show', $event)"
    max-width="800"
    persistent
  >
    <VCard>
      <!-- 모달 헤더 -->
      <VCardTitle class="d-flex align-center pa-6 pb-4 bg-grey-50">
        <VIcon
          :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
          class="mr-3"
        />
        {{ isEdit ? '일정 수정' : '새 일정 추가' }}
      </VCardTitle>

      <!-- 모달 내용 -->
      <VCardText class="pa-6 pt-4">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <!-- 기본 정보 -->
          <h4 class="text-h6 mb-4">기본 정보</h4>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="form.title"
                label="일정명*"
                placeholder="일정의 제목을 입력하세요"
                variant="outlined"
                :rules="[v => !!v || '일정명은 필수입니다']"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.instructor"
                label="담당강사"
                placeholder="담당 강사명을 입력하세요"
                variant="outlined"
                clearable
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="form.description"
                label="일정설명*"
                placeholder="일정에 대한 상세 설명을 입력하세요"
                variant="outlined"
                rows="3"
                :rules="[v => !!v || '일정설명은 필수입니다']"
              />
            </VCol>
          </VRow>

          <!-- 인원 및 장소 -->
          <h4 class="text-h6 mb-4 mt-6">인원 및 장소</h4>
          <VRow>
            <VCol cols="12" md="6">
              <VRow>
                <VCol cols="12">
                  <VSelect
                    v-model="form.maxParticipantsType"
                    label="최대 인원*"
                    :items="[
                      { title: '무제한', value: 'unlimited' },
                      { title: '직접 입력', value: 'custom' }
                    ]"
                    variant="outlined"
                  />
                </VCol>
                <VCol cols="12" v-if="form.maxParticipantsType === 'custom'">
                  <VTextField
                    v-model.number="form.maxParticipants"
                    label="인원 수*"
                    type="number"
                    variant="outlined"
                    suffix="명"
                    min="1"
                    :rules="[
                      v => form.maxParticipantsType === 'unlimited' || !!v || '인원 수를 입력하세요',
                      v => form.maxParticipantsType === 'unlimited' || v > 0 || '1명 이상이어야 합니다'
                    ]"
                  />
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.location"
                label="장소"
                placeholder="수업 진행 장소"
                variant="outlined"
                clearable
              />
            </VCol>
          </VRow>

          <!-- 시간 정보 -->
          <h4 class="text-h6 mb-4 mt-6">시간 정보</h4>
          <VRow>
            <VCol cols="12">
              <vue-date-picker
                v-model="form.dateRange"
                range
                :format="dateFormat"
                locale="ko"
                :enable-time-picker="false"
                auto-apply
                :text-input="true"
                :placeholder="'시작일 ~ 종료일'"
                :rules="[v => !!v || '기간은 필수입니다']"
                :week-start="0"
                :month-change-on-scroll="false"
                :calendar-cell-class-name="'dp__calendar-cell'"
                :preview-format="(date) => dayjs(date).format('YYYY.MM.DD')"
                :menu-class-name="'dp__menu'"
                :calendar-class-name="'dp__calendar'"
                :action-row-class-name="'dp__action-row'"
                :input-class-name="'dp__input'"
                :inline-input-class-name="'dp__inline-input'"
                :calendar-header-class-name="'dp__calendar-header'"
                :calendar-row-class-name="'dp__calendar-row'"
                :calendar-header-separator-class-name="'dp__calendar-header-separator'"
                :calendar-weekday-class-name="'dp__calendar-weekday'"
                :calendar-month-class-name="'dp__calendar-month'"
                :calendar-year-class-name="'dp__calendar-year'"
                :calendar-decade-class-name="'dp__calendar-decade'"
                :action-preview-class-name="'dp__action-preview'"
                :action-buttons-class-name="'dp__action-buttons'"
                :action-button-class-name="'dp__action-button'"
                :action-select-class-name="'dp__action-select'"
                :action-cancel-class-name="'dp__action-cancel'"
                :month-year-select-class-name="'dp__month-year-select'"
                :month-year-header-class-name="'dp__month-year-header'"
                :time-picker-class-name="'dp__time-picker'"
                :time-picker-header-class-name="'dp__time-picker-header'"
                :time-picker-input-class-name="'dp__time-picker-input'"
                :time-picker-column-class-name="'dp__time-picker-column'"
                :time-picker-cell-class-name="'dp__time-picker-cell'"
              >
                <template #trigger>
                  <VTextField
                    :model-value="form.dateRange ? formatDateRange(form.dateRange) : ''"
                    label="기간*"
                    placeholder="시작일 ~ 종료일"
                    variant="outlined"
                    readonly
                    :rules="[v => !!v || '기간은 필수입니다']"
                  >
                    <template #append-inner>
                      <VIcon icon="ri-calendar-line" />
                    </template>
                  </VTextField>
                </template>
              </vue-date-picker>
            </VCol>

            <VCol cols="12">
              <VRow>
                <VCol cols="12">
                  <VSelect
                    v-model="form.timeType"
                    label="시간 설정"
                    :items="[
                      { title: '하루종일', value: 'allday' },
                      { title: '시간 지정', value: 'custom' }
                    ]"
                    variant="outlined"
                  />
                </VCol>
                <VCol v-if="form.timeType === 'custom'" cols="12" md="6">
                  <VTextField
                    v-model="form.startTime"
                    label="시작 시간"
                    type="time"
                    variant="outlined"
                    :rules="timeRules"
                  />
                </VCol>
                <VCol v-if="form.timeType === 'custom'" cols="12" md="6">
                  <VTextField
                    v-model="form.endTime"
                    label="종료 시간"
                    type="time"
                    variant="outlined"
                    :rules="timeRules"
                  />
                </VCol>
              </VRow>
            </VCol>
          </VRow>

          <!-- 예약/취소 설정 -->
          <h4 class="text-h6 mb-4 mt-6">예약/취소 설정</h4>
          <VRow>
            <!-- 예약 마감 시간 설정 -->
            <VCol cols="12" md="6">
              <VRow>
                <VCol cols="12">
                  <VSwitch
                    v-model="form.hasReservationDeadline"
                    label="예약 마감 시간 설정"
                    color="primary"
                    hide-details
                  />
                </VCol>
                <VCol v-if="form.hasReservationDeadline" cols="12">
                  <VTextField
                    v-model.number="form.reservationDeadlineHours"
                    label="예약 마감 시간*"
                    type="number"
                    variant="outlined"
                    suffix="시간 전"
                    min="1"
                    :rules="[
                      v => !form.hasReservationDeadline || !!v || '예약 마감 시간을 입력하세요',
                      v => !form.hasReservationDeadline || v > 0 || '1시간 이상이어야 합니다'
                    ]"
                  />
                </VCol>
              </VRow>
            </VCol>

            <!-- 취소 마감 시간 설정 -->
            <VCol cols="12" md="6">
              <VRow>
                <VCol cols="12">
                  <VSwitch
                    v-model="form.hasCancellationDeadline"
                    label="취소 마감 시간 설정"
                    color="primary"
                    hide-details
                  />
                </VCol>
                <VCol v-if="form.hasCancellationDeadline" cols="12">
                  <VTextField
                    v-model.number="form.cancellationDeadlineHours"
                    label="취소 마감 시간*"
                    type="number"
                    variant="outlined"
                    suffix="시간 전"
                    min="1"
                    :rules="[
                      v => !form.hasCancellationDeadline || !!v || '취소 마감 시간을 입력하세요',
                      v => !form.hasCancellationDeadline || v > 0 || '1시간 이상이어야 합니다'
                    ]"
                  />
                </VCol>
              </VRow>
            </VCol>
          </VRow>

          <!-- 연결 정보 -->
          <h4 class="text-h6 mb-4 mt-6">연결 정보</h4>
          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="form.uniqueCodeIds"
                label="고유번호*"
                :items="uniqueCodeOptions"
                variant="outlined"
                multiple
                chips
                closable-chips
                :rules="[v => v.length > 0 || '고유번호는 필수입니다']"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <!-- 모달 액션 -->
      <VCardActions class="pa-6 pt-4 border-t bg-grey-50">
        <VSpacer />
        <VBtn
          variant="text"
          color="secondary"
          @click="$emit('update:show', false)"
          class="bg-secondary-50"
        >
          취소
        </VBtn>
        <VBtn
          color="primary"
          @click="handleSubmit"
          :loading="isSubmitting"
          variant="text"
          class="bg-primary-25"
        >
          {{ isEdit ? '수정' : '추가' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import type { Schedule } from '~/types/membership'
import dayjs from 'dayjs'

// Props
interface Props {
  show: boolean
  editData?: Schedule
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

// Emits
const emit = defineEmits<{
  'update:show': [value: boolean]
  'submit': [data: Partial<Schedule>]
}>()

// Composables
const { uniqueCodes } = useMembership()

// Refs
const formRef = ref()
const isSubmitting = ref(false)

// 계산된 속성
const isEdit = computed(() => !!props.editData)

const uniqueCodeOptions = computed(() => {
  return uniqueCodes.value.map(code => ({
    title: code.title,
    value: code.id
  }))
})

// 폼 상태
const form = ref({
  title: '',
  instructor: '',
  description: '',
  maxParticipantsType: 'unlimited' as 'unlimited' | 'custom',
  maxParticipants: null as number | null,
  location: '',
  dateRange: null as [Date, Date] | null,
  timeType: 'allday' as 'allday' | 'custom',
  startTime: '',
  endTime: '',
  uniqueCodeIds: [] as number[],
  hasReservationDeadline: false,
  reservationDeadlineHours: null as number | null,
  hasCancellationDeadline: false,
  cancellationDeadlineHours: null as number | null
})

// 유효성 검사 규칙
const timeRules = [
  (v: string) => form.value.timeType === 'allday' || !!v || '시간을 입력하세요'
]

// Date Picker 설정
const dateFormat = (date: Date) => {
  return dayjs(date).format('YYYY.MM.DD')
}

const formatDateRange = (dateRange: [Date, Date]) => {
  if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) return ''
  return `${dayjs(dateRange[0]).format('YYYY.MM.DD')} ~ ${dayjs(dateRange[1]).format('YYYY.MM.DD')}`
}

// Methods
const resetForm = () => {
  form.value = {
    title: '',
    instructor: '',
    description: '',
    maxParticipantsType: 'unlimited',
    maxParticipants: null,
    location: '',
    dateRange: null,
    timeType: 'allday',
    startTime: '',
    endTime: '',
    uniqueCodeIds: [],
    hasReservationDeadline: false,
    reservationDeadlineHours: null,
    hasCancellationDeadline: false,
    cancellationDeadlineHours: null
  }
}

const initEditData = () => {
  if (!props.editData) return

  const { 
    startDate, 
    endDate, 
    startTime, 
    endTime, 
    maxParticipants,
    reservationDeadlineHours,
    cancellationDeadlineHours,
    uniqueCodeIds,
    ...rest 
  } = props.editData
  
  form.value = {
    ...rest,
    dateRange: [new Date(startDate), new Date(endDate)],
    timeType: startTime && endTime ? 'custom' : 'allday',
    maxParticipantsType: maxParticipants === 'unlimited' ? 'unlimited' : 'custom',
    maxParticipants: maxParticipants === 'unlimited' ? null : Number(maxParticipants),
    startTime: startTime || '',
    endTime: endTime || '',
    uniqueCodeIds: uniqueCodeIds || [],
    hasReservationDeadline: !!reservationDeadlineHours,
    reservationDeadlineHours: reservationDeadlineHours || null,
    hasCancellationDeadline: !!cancellationDeadlineHours,
    cancellationDeadlineHours: cancellationDeadlineHours || null
  }
}

const handleSubmit = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  isSubmitting.value = true
  try {
    const formData = {
      ...form.value,
      startDate: form.value.dateRange?.[0].toISOString(),
      endDate: form.value.dateRange?.[1].toISOString(),
      maxParticipants: form.value.maxParticipantsType === 'unlimited' 
        ? 'unlimited' 
        : form.value.maxParticipants,
      startTime: form.value.timeType === 'custom' ? form.value.startTime : null,
      endTime: form.value.timeType === 'custom' ? form.value.endTime : null,
      reservationDeadlineHours: form.value.hasReservationDeadline ? form.value.reservationDeadlineHours : null,
      cancellationDeadlineHours: form.value.hasCancellationDeadline ? form.value.cancellationDeadlineHours : null
    }

    emit('submit', formData)
    emit('update:show', false)
    resetForm()
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(() => props.show, (show) => {
  if (show && props.editData) {
    initEditData()
  } else if (!show) {
    resetForm()
  }
})

// 초기화
onMounted(() => {
  if (props.editData) {
    initEditData()
  }
})
</script> 