<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <!-- 페이지 헤더 -->
        <div class="d-flex align-center mb-6">
          <VIcon icon="ri-user-settings-line" size="32" class="mr-3" />
          <h1 class="text-h4 font-weight-bold">멤버십 관리</h1>
        </div>

        <!-- 탭 네비게이션 -->
        <VTabs v-model="activeTab" class="mb-6">
          <VTab value="unique-codes">
            <VIcon icon="ri-code-box-line" class="mr-2" />
            고유번호 관리
          </VTab>
          <VTab value="tickets">
            <VIcon icon="ri-ticket-line" class="mr-2" />
            티켓 관리
          </VTab>
          <VTab value="schedules">
            <VIcon icon="ri-calendar-event-line" class="mr-2" />
            일정 관리
          </VTab>
          <VTab value="connections">
            <VIcon icon="ri-links-line" class="mr-2" />
            연결 관리
          </VTab>
        </VTabs>

        <!-- 탭 컨텐츠 -->
        <VWindow v-model="activeTab" class="mt-4">
          <!-- 고유번호 관리 탭 -->
          <VWindowItem value="unique-codes">
            <UniqueCodeTab />
          </VWindowItem>

          <!-- 티켓 관리 탭 -->
          <VWindowItem value="tickets">
            <TicketTab />
          </VWindowItem>

          <!-- 일정 관리 탭 -->
          <VWindowItem value="schedules">
            <ScheduleTab />
          </VWindowItem>

          <!-- 연결 관리 탭 -->
          <VWindowItem value="connections">
            <ConnectionTab />
          </VWindowItem>
        </VWindow>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
// 페이지 메타 설정
definePageMeta({
  title: '멤버십 관리',
  layout: 'default'
})

// 탭 상태 관리
const activeTab = ref('unique-codes')
</script>

<style scoped>
.v-tab {
  text-transform: none !important;
  font-weight: 500;
}

.v-tab--selected {
  color: rgb(var(--v-theme-primary)) !important;
}
</style> 