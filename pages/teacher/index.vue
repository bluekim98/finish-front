<script setup lang="ts">
import { NuxtLink } from '#components';
import DatePicker from '@/views/common/DatePicker.vue';
import dayjs from 'dayjs';

const membershipList = ref<ApiResponseBody['/membership']['get']['items']>([]);
const totalPages = ref(1);

const defaultQuery: ApiQueryParams['/membership']['get'] = {
  page: 1,
  pageSize: 10,
  membershipName: '',
  headOfficeCustomerCodeLargeCategory: '',
  headOfficeCustomerCodeMiddleCategory: '',
  openDateStart: dayjs('2024-01-01').format('YYYY-MM-DD'),
  openDateEnd: dayjs('2999-12-31').format('YYYY-MM-DD'),
  serviceTarget: '전체',
  phoneCollectTarget: '전체',
  pcLogoRegistered: '전체',
  mobileLogoRegistered: '전체',
  faviconRegistered: '전체',
  appLauncherIconRegistered: '전체',
};

const query = reactive({
  ...defaultQuery,
});

const search = () => {
  if (typeof query.openDateStart === 'object') {
    query.openDateStart = dayjs(query.openDateStart).format('YYYY-MM-DD');
  }
  if (typeof query.openDateEnd === 'object') {
    query.openDateEnd = dayjs(query.openDateEnd).format('YYYY-MM-DD');
  }

  fetchMembershipList();
};

const reset = () => {
  Object.assign(query, defaultQuery);
};

const fetchMembershipList = async () => {
  const { data } = await makeApiClient().GET('/membership', {
    params: {
      query,
    },
  });

  membershipList.value = data?.items || [];
  totalPages.value = data?.pagination.totalPage || 1;
};

fetchMembershipList();

watch(
  () => [query.page, query.pageSize],
  () => {
    fetchMembershipList();
  },
);
</script>

<template>
  <p class="text-2xl">강사 관리</p>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VForm class="my-6 mx-6" @submit.prevent="search">
          <VRow>
            <VCol md="2">
              <VTextField v-model="query.teacherName" label="강사명" placeholder="강사명  " />
            </VCol>
            <VCol md="2">
              <VTextField v-model="query.membershipName" label="수강권명" placeholder="수강권명" />
            </VCol>
            <VCol md="2">
              <VSelect
                v-model="query.pcLogoRegistered"
                label="지점"
                :items="['전체', '인덕원점', '호계점']"
                placeholder="선택"
              />
            </VCol>
            <VCol md="2">
              <VSelect
                v-model="query.pcLogoRegistered"
                label="레슨연결여부"
                :items="['전체', '연결', '비연결']"
                placeholder="선택"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-wrap gap-4 justify-end">
              <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="reset">초기화</VBtn>
              <VBtn type="submit">검색</VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCard>
    </VCol>

    <VCol class="d-flex justify-end">
      <NuxtLink to="/teacher/register">
        <VBtn>강사 등록</VBtn>
      </NuxtLink>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VTable width="100%">
          <thead>
            <tr>
              <th class="text-center no-wrap">식별번호</th>
              <th class="text-center no-wrap">강사명</th>
              <th class="text-center no-wrap">지점</th>
              <th class="text-center no-wrap">레슨연결여부</th>
              <th class="text-center no-wrap">상세</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="membership in membershipList ? membershipList : []" :key="membership.membershipId">
              <td class="text-center no-wrap">{{ membership.membershipId }}</td>
              <td class="text-center no-wrap">{{ membership.membershipName }}</td>
              <td class="text-center no-wrap">{{ membership.largeCategory }}</td>
              <td class="text-center no-wrap">{{ membership.middleCategory }}</td>
              <td class="text-center no-wrap">
                {{ dayjs(membership.openDateTime).format('YYYY-MM-DD HH:mm') }}
              </td>
              <td class="text-center no-wrap">{{ membership.serviceYn }}</td>
              <td class="text-center no-wrap">{{ membership.phoneNumberCollectionYn }}</td>
              <td class="text-center no-wrap">{{ membership.membershipPath }}</td>
              <td class="text-center no-wrap">
                <NuxtLink :to="`/membership/${membership.membershipId}`">
                  <v-btn variant="outlined">상세보기</v-btn>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>

  <VPagination class="mt-4" v-model="query.page" :length="totalPages" total-visible="10" />
</template>

<style scoped>
.no-wrap {
  white-space: nowrap;
}
</style>
