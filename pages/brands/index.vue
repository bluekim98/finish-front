<script setup lang="ts">
import { NuxtLink } from '#components';
import DatePicker from '@/views/common/DatePicker.vue';
import dayjs from 'dayjs';

const brandList = ref<CaribbeanApiResponseBody['/brand']['get']['items']>([]);
const totalPages = ref(1);

const defaultQuery: CaribbeanApiQueryParams['/brand']['get'] = {
  page: 1,
  pageSize: 10,
  brandName: '',
  headOfficeCustomerCodeLargeCategory: '',
  headOfficeCustomerCodeMiddleCategory: '',
  openDateStart: dayjs('2024-01-01').format('YYYY-MM-DD'),
  openDateEnd: dayjs('2999-12-31').format('YYYY-MM-DD'),
  serviceTarget: 'ALL',
  phoneCollectTarget: 'ALL',
  pcLogoRegistered: 'ALL',
  mobileLogoRegistered: 'ALL',
  faviconRegistered: 'ALL',
  appLauncherIconRegistered: 'ALL',
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

  fetchBrandList();
};

const reset = () => {
  Object.assign(query, defaultQuery);
};

const fetchBrandList = async () => {
  const { data } = await makeCaribbeanClient().GET('/brand', {
    params: {
      query,
    },
  });

  brandList.value = data?.items || [];
  totalPages.value = data?.pagination.totalPage || 1;
};

fetchBrandList();

watch(
  () => [query.page, query.pageSize],
  () => {
    fetchBrandList();
  },
);
</script>

<template>
  <p class="text-2xl">FC 브랜드 관리</p>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VForm class="my-6 mx-6" @submit.prevent="search">
          <VRow>
            <VCol md="2">
              <VTextField v-model="query.brandName" label="브랜드명" placeholder="브랜드명" />
            </VCol>
            <VCol md="2">
              <VTextField v-model="query.headOfficeCustomerCodeLargeCategory" label="대분류" placeholder="대분류" />
            </VCol>
            <VCol md="2">
              <VTextField
                v-model="query.headOfficeCustomerCodeMiddleCategory"
                label="본점고객코드"
                placeholder="본점고객코드"
              />
            </VCol>

            <VCol md="6">
              <VRow class="px-3 gap-6">
                <VCol class="pt-0 px-0">
                  <span class="text-overline">오픈 시작일</span>
                  <DatePicker v-model="query.openDateStart" />
                </VCol>
                <VCol class="pt-0 px-0">
                  <span class="text-overline">오픈 종료일</span>
                  <DatePicker v-model="query.openDateEnd" />
                </VCol>
              </VRow>
            </VCol>
            <VCol md="2">
              <VSelect
                v-model="query.serviceTarget"
                label="서비스 대상 여부"
                :items="['ALL', 'Y', 'N']"
                placeholder="선택"
              />
            </VCol>
            <VCol md="2">
              <VSelect
                v-model="query.phoneCollectTarget"
                label="전화번호 수집 대상 여부"
                :items="['ALL', 'Y', 'N']"
                placeholder="선택"
              />
            </VCol>
            <VCol md="2">
              <VSelect
                v-model="query.pcLogoRegistered"
                label="웹(PC) 로고 등록 여부"
                :items="['ALL', 'Y', 'N']"
                placeholder="선택"
              />
            </VCol>
            <VCol md="2">
              <VSelect
                v-model="query.mobileLogoRegistered"
                label="모바일 로고 등록 여부"
                :items="['ALL', 'Y', 'N']"
                placeholder="선택"
              />
            </VCol>
            <VCol md="2">
              <VSelect
                v-model="query.faviconRegistered"
                label="파비콘 등록 여부"
                :items="['ALL', 'Y', 'N']"
                placeholder="선택"
              />
            </VCol>
            <VCol md="2">
              <VSelect
                v-model="query.appLauncherIconRegistered"
                label="앱 런처 아이콘 등록 여부"
                :items="['ALL', 'Y', 'N']"
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
      <NuxtLink to="/brands/register">
        <VBtn>기본정보 등록</VBtn>
      </NuxtLink>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VTable width="100%">
          <thead>
            <tr>
              <th class="text-center no-wrap">식별번호</th>
              <th class="text-center no-wrap">브랜드명</th>
              <th class="text-center no-wrap">
                본사고객코드
                <br />
                대분류
              </th>
              <th class="text-center no-wrap">
                본사고객코드
                <br />
                본점고객코드
              </th>
              <th class="text-center no-wrap">오픈일시</th>
              <th class="text-center no-wrap">서비스 대상</th>
              <th class="text-center no-wrap">전화번호 수집 대상</th>
              <th class="text-center no-wrap">path - text</th>
              <th class="text-center no-wrap">
                웹(PC) 로고
                <br />
                등록 여부
              </th>
              <th class="text-center no-wrap">
                웹(모바일) 로고
                <br />
                등록 여부
              </th>
              <th class="text-center no-wrap">
                파비콘
                <br />
                등록 여부
              </th>
              <th class="text-center no-wrap">
                앱런처
                <br />
                등록 여부
              </th>
              <th class="text-center no-wrap">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="brand in brandList ? brandList : []" :key="brand.brandId">
              <td class="text-center no-wrap">{{ brand.brandId }}</td>
              <td class="text-center no-wrap">{{ brand.brandName }}</td>
              <td class="text-center no-wrap">{{ brand.largeCategory }}</td>
              <td class="text-center no-wrap">{{ brand.middleCategory }}</td>
              <td class="text-center no-wrap">
                {{ dayjs(brand.openDateTime).format('YYYY-MM-DD HH:mm') }}
              </td>
              <td class="text-center no-wrap">{{ brand.serviceYn }}</td>
              <td class="text-center no-wrap">{{ brand.phoneNumberCollectionYn }}</td>
              <td class="text-center no-wrap">{{ brand.brandPath }}</td>
              <td class="text-center no-wrap">{{ brand.pcBrandLogoUri ? 'Y' : 'N' }}</td>
              <td class="text-center no-wrap">{{ brand.mobileBrandLogoUri ? 'Y' : 'N' }}</td>
              <td class="text-center no-wrap">{{ brand.faviconUri ? 'Y' : 'N' }}</td>
              <td class="text-center no-wrap">
                {{ typeof brand.appLauncherIconKey === 'string' && brand.appLauncherIconKey.trim() !== '' ? 'Y' : 'N' }}
              </td>
              <td class="text-center no-wrap">
                <NuxtLink :to="`/brands/${brand.brandId}`">
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
