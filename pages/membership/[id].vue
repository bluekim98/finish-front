<script setup lang="ts">
import DatePicker from '@/views/common/DatePicker.vue';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { type VForm } from 'vuetify/components';
import * as _ from 'lodash';
import { v4 as uuid4 } from 'uuid';
import SelectMiddleCategoryDialog from '@/components/brands/[id]/select-middle-category-dialog.vue';
import SelectBackgroundColorDialog from '@/components/brands/[id]/select-background-color-dialog.vue';
import LogoUploader from '@/components/brands/[id]/logo-uploader.vue';
import SelectAppLauncherIconKeyDialog from '@/components/brands/[id]/select-app-launcher-icon-key-dialog.vue';
import BrandTab from '@/components/brands/[id]/brand-tab.vue';

export type UploadFileTypes = 'pcLogo' | 'mobileLogo' | 'favicon' | 'pcBg' | 'mobileBg' | 'appLauncher';

const route = useRoute();
const brandId = Number(route.params.id);

const brandInfo = ref<ApiResponseBody['/brand/{brandId}']['get']>();
const initialBrandInfo = ref<ApiResponseBody['/brand/{brandId}']['get']>();

const isLoading = ref(true);
const isResetClicked = ref(false);
const isChanged = computed(() => !_.isEqual(brandInfo.value, initialBrandInfo.value));

const brandPathFieldRef = ref<any>(null);
const isBrandPathRequired = computed(() => {
  if (
    brandInfo.value?.pcBrandLogoUri ||
    brandInfo.value?.pcBgColor ||
    brandInfo.value?.mobileBrandLogoUri ||
    brandInfo.value?.mobileBgColor ||
    brandInfo.value?.faviconUri
  ) {
    if (brandInfo.value.brandPath) {
      return false;
    } else {
      return true;
    }
  }
  return false;
});

const middleCategoryDialog = ref({
  select: false,
  register: false,
  selectedMiddleCategoryName: '',
  selectedMiddleCategoryCode: '',
});
const appLauncherIconKeyDialog = ref(false);

const formRef = ref<VForm | null>(null);

const activeTab = ref(0);
const tabItems = ref<ApiResponseBody['/brand/{brandId}']['get']['brandMiddleCategories']>([]);

const { snacks, showSnackbar } = useSnackbar();

const fetchBrandInfo = async () => {
  try {
    const { data } = await makeApiClient().GET('/brand/{brandId}', {
      params: {
        path: {
          brandId,
        },
      },
    });

    brandInfo.value = data;
    tabItems.value = data?.brandMiddleCategories || [];

    if (!initialBrandInfo.value) {
      initialBrandInfo.value = _.cloneDeep(data);
    }

    if (isResetClicked.value) {
      initialBrandInfo.value = _.cloneDeep(data);
      isResetClicked.value = false;
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      html: `<div style="white-space: pre-wrap;">GET('/brand/{brandId}') 실패\n${error}</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
  } finally {
    isLoading.value = false;
  }
};

// TODO: undefined를 보내도록 wrapper 만드는 게 나을 듯
const updateBrandInfo = async () => {
  const { response, error } = await makeApiClient().PATCH('/brand/{brandId}', {
    params: {
      path: {
        brandId,
      },
    },
    body: {
      brandName: brandInfo.value?.brandName,
      openDateTime: brandInfo.value?.openDateTime,
      serviceYn: brandInfo.value?.serviceYn as 'Y' | 'N',
      phoneCollectionDateTimeStart: brandInfo.value?.collectionStartDateTime,
      phoneCollectionDateTimeEnd: brandInfo.value?.collectionEndDateTime,
      pcBrandLogoSeqId: brandInfo.value?.pcBrandLogoSeqId,
      mobileBrandLogoSeqId: brandInfo.value?.mobileBrandLogoSeqId,
      faviconSeqId: brandInfo.value?.faviconSeqId,
      brandPath:
        brandInfo.value?.brandPath === '' || brandInfo.value?.brandPath == null
          ? undefined
          : brandInfo.value?.brandPath,
      pcBgColor:
        brandInfo.value?.pcBgColor === '' || brandInfo.value?.pcBgColor == null
          ? undefined
          : brandInfo.value?.pcBgColor,
      mobileBgColor:
        brandInfo.value?.mobileBgColor === '' || brandInfo.value?.mobileBgColor == null
          ? undefined
          : brandInfo.value?.mobileBgColor,
      appLauncherIconKey:
        brandInfo.value?.appLauncherIconKey === '' || brandInfo.value?.appLauncherIconKey == null
          ? undefined
          : brandInfo.value?.appLauncherIconKey,
    },
  });

  if (response.ok) {
    Swal.fire({
      icon: 'success',
      html: `<div style="white-space: pre-wrap;">저장 완료</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    reset();
  } else {
    const errorInfo = error as unknown as { code: string; message: string };
    Swal.fire({
      icon: 'error',
      html: `<div style="white-space: pre-wrap;">저장 실패\n\ncode: ${errorInfo.code}\n\nmessage: ${errorInfo.message}</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
  }
};

// TODO: 동일 함수 리팩토링 필요
const uploadImage = async (file: File, type: UploadFileTypes) => {
  const { data, error } = await makeApiClient().POST('/files/upload', {
    body: {
      file: '',
    },
    bodySerializer: () => {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        return formData;
      }
    },
  });

  if (data && brandInfo.value) {
    if (type === 'pcLogo') {
      brandInfo.value.pcBrandLogoUri = data.fileUri;
      brandInfo.value.pcBrandLogoSeqId = data.sysAttachInfoSeqId;
    } else if (type === 'mobileLogo') {
      brandInfo.value.mobileBrandLogoUri = data.fileUri;
      brandInfo.value.mobileBrandLogoSeqId = data.sysAttachInfoSeqId;
    } else {
      brandInfo.value.faviconUri = data.fileUri;
      brandInfo.value.faviconSeqId = data.sysAttachInfoSeqId;
    }
  } else {
    const errorInfo = error as unknown as { code: string; message: string };
    Swal.fire({
      icon: 'error',
      html: `<div style="white-space: pre-wrap;">업로드 실패\n\ncode: ${errorInfo.code}\n\nmessage: ${errorInfo.message}</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
  }
};

fetchBrandInfo();

// TODO: 동일 함수 리팩토링 필요
const handleRemoveInfo = (type: UploadFileTypes) => {
  if (!brandInfo.value || !initialBrandInfo.value) {
    return;
  }

  if (type === 'pcLogo') {
    brandInfo.value.pcBrandLogoUri = '';
    brandInfo.value.pcBrandLogoSeqId = undefined;
  } else if (type === 'mobileLogo') {
    brandInfo.value.mobileBrandLogoUri = '';
    brandInfo.value.mobileBrandLogoSeqId = undefined;
  } else if (type === 'favicon') {
    brandInfo.value.faviconUri = '';
    brandInfo.value.faviconSeqId = undefined;
  } else if (type === 'appLauncher') {
    brandInfo.value.appLauncherIconKey = '';
  }
};

// TODO: 동일 함수 리팩토링 필요
const reset = () => {
  isResetClicked.value = true;
  fetchBrandInfo();
  activeTab.value = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const update = async () => {
  const isFormValid = await formRef.value?.validate();

  const isValidOpenDateTime = brandInfo.value?.openDateTime !== null;
  const isValidPhoneCollectionDateTimeStart = brandInfo.value?.collectionStartDateTime !== null;
  const isValidPhoneCollectionDateTimeEnd = brandInfo.value?.collectionEndDateTime !== null;

  if (!isFormValid?.valid) {
    return;
  }

  if (!isValidOpenDateTime) {
    Swal.fire({
      icon: 'warning',
      html: `<div style="white-space: pre-wrap;">오픈 일시를 입력하세요</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    return;
  }

  if (!isValidPhoneCollectionDateTimeStart) {
    Swal.fire({
      icon: 'warning',
      html: `<div style="white-space: pre-wrap;">전화번호 수집 시작 일시를 입력하세요</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    return;
  }

  if (!isValidPhoneCollectionDateTimeEnd) {
    Swal.fire({
      icon: 'warning',
      html: `<div style="white-space: pre-wrap;">전화번호 수집 종료 일시를 입력하세요</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    return;
  }

  if (dayjs(brandInfo.value?.collectionStartDateTime).diff(dayjs(brandInfo.value?.collectionEndDateTime), 'day') > 0) {
    Swal.fire({
      icon: 'warning',
      html: `<div style="white-space: pre-wrap;">전화번호 수집 종료 일시는 시작 일시 이후만 가능합니다</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
    return;
  }

  Swal.fire({
    icon: 'question',
    html: `<div style="white-space: pre-wrap;"><div style="font-size: 24px; font-weight: 700;">변경된 내용을 저장하시겠습니까?</div></div>`,
    showCancelButton: true,
    buttonsStyling: false,
    confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px; margin-right: 16px ">확인</div>`,
    cancelButtonText: `<div style="background-color: grey; color: white; padding: 8px 18px; border-radius: 5px; margin-right: 16px ">취소</div>`,
  }).then(async (result) => {
    if (result.isConfirmed) {
      updateBrandInfo();
    }
  });
};

// TODO: 동일한 함수 사용 리팩토링 필요
const removeSpecialChars = (input: string) => {
  const regex = /(?:[\/&<\^~\?%>\[\:# \{\]\*\;\\\=\u201D\|']|\.{2})/g;

  if (regex.test(input)) {
    showSnackbar({
      text: '사용할 수 없는 특수문자 입니다.',
      color: 'error',
      timeout: 2000,
      closeOnContentClick: true,
    });
  }

  return input.replace(regex, '');
};

// TODO: rules만 모아서 파일을 분리하든지 필요
// return true - 통과
// return false - 실패
const brandPathRules = [
  () => {
    return isBrandPathRequired.value ? '* 로고이미지, 배경색을 적용하려면 Path를 입력해주세요.' : true;
  },
];

// TODO: 동일한 함수 리팩토링 필요
const handleBrandPathInput = async (value?: string) => {
  if (!value) {
    return;
  }

  const cleanedValue = removeSpecialChars(value);

  if (cleanedValue !== value) {
    if (brandInfo.value) {
      brandInfo.value.brandPath = cleanedValue;
      await nextTick();

      if (brandPathFieldRef.value) {
        const inputElement = brandPathFieldRef.value.$el.querySelector('input');
        if (inputElement) {
          inputElement.value = cleanedValue;
        }
      }
    }
  }
};

const handleSelectionCompleteClick = () => {
  middleCategoryDialog.value.select = false;
  middleCategoryDialog.value.register = true;
};

const handleCloseDialog = () => {
  middleCategoryDialog.value.select = false;
  middleCategoryDialog.value.register = false;
  middleCategoryDialog.value.selectedMiddleCategoryName = '';
  middleCategoryDialog.value.selectedMiddleCategoryCode = '';
};

watch(
  () => [brandInfo.value?.openDateTime],
  (_, oldOpenDatetime) => {
    // 저장 버튼을 누르면 reset()이 동작하고 데이터를 fetch 한다.
    // 데이터가 fetch 되면서 openDateTime이 변경되므로 watch가 동작한다.
    // 이 때, 아래 *의 if문에 의해 collectionEndDateTime 값을 새롭게 할당하게 되고 isChanged가 true가 되어 저장 버튼이 활성화 된다.
    // 다음 조건을 추가하여 저장 버튼이 활성화 되는 것을 방지한다.
    if (
      dayjs(brandInfo.value?.collectionEndDateTime).toISOString() ===
      dayjs(brandInfo.value?.openDateTime).subtract(1, 'day').hour(23).minute(59).second(59).toDate().toISOString()
    ) {
      return;
    }

    if (oldOpenDatetime[0] && brandInfo.value?.openDateTime) {
      brandInfo.value.collectionEndDateTime = dayjs(brandInfo.value.openDateTime)
        .subtract(1, 'day')
        .hour(23)
        .minute(59)
        .second(59)
        .toDate()
        .toISOString();
    }
  },
);

watch(isBrandPathRequired, () => {
  brandPathFieldRef.value?.validate();
});
</script>

<template>
  <p class="text-2xl">FC 브랜드 상세</p>
  <VRow v-if="brandInfo">
    <VCol cols="12">
      <VCard>
        <div class="my-6 mx-6 d-flex">
          <VTabs v-model="activeTab" class="flex-grow-1" show-arrows>
            <VTab :value="0">
              <span :class="{ 'font-weight-bold': activeTab === 0 }">기본정보 (본사: {{ brandInfo.brandName }})</span>
            </VTab>
            <VTab v-for="(item, index) in tabItems" :key="index + 1" :value="index + 1">
              <div class="d-flex gap-1 align-center justify-center">
                <span :class="{ 'font-weight-bold': index + 1 === activeTab }">
                  {{ `${item.brandName} ${item.middleGbn}` }}
                </span>
                <v-avatar color="primary" size="24">
                  <span class="white--text">{{ item.storeCount }}</span>
                </v-avatar>
              </div>
            </VTab>
          </VTabs>
          <!-- TODO: dialog가 생성될 때 DOM에 그려지는 게 필요한지 확인하기 / 필요하다면 v-if 넣기 -->
          <SelectMiddleCategoryDialog
            v-model:dialog="middleCategoryDialog.select"
            v-model:selectedName="middleCategoryDialog.selectedMiddleCategoryName"
            v-model:selectedCode="middleCategoryDialog.selectedMiddleCategoryCode"
            :brandId="brandId"
            :brandName="brandInfo.brandName"
            :tabCount="tabItems.length"
            @complete-button-click="handleSelectionCompleteClick"
            @close-dialog="handleCloseDialog"
          />
          <RegisterMiddleCategoryDialog
            v-if="middleCategoryDialog.register"
            v-model:dialog="middleCategoryDialog.register"
            :brandId="brandId"
            :brandName="brandInfo.brandName"
            :middleCategoryName="middleCategoryDialog.selectedMiddleCategoryName"
            :middleCategoryCode="middleCategoryDialog.selectedMiddleCategoryCode"
            :headquarterBrandPath="brandInfo.brandPath"
            @close-dialog="handleCloseDialog"
            @refetch="reset"
          />
        </div>
        <VTabsWindow v-model="activeTab" class="my-6 mx-6">
          <VTabsWindowItem>
            <VForm class="my-6 mx-6" ref="formRef" @submit.prevent="update">
              <VRow>
                <VCol cols="7">
                  <VCol cols="12">
                    <VRow no-gutters>
                      <VCol cols="12" md="4" class="d-flex align-start">
                        <label class="font-weight-bold">식별번호</label>
                      </VCol>
                      <VTextField class="centered-text" v-model="brandInfo.brandId" disabled />
                    </VRow>
                  </VCol>

                  <VCol cols="12">
                    <VRow no-gutters>
                      <VCol cols="12" md="4" class="d-flex align-start">
                        <label class="font-weight-bold d-flex align-center gap-2">
                          <span>브랜드명</span>
                          <span class="text-necessary pt-1">*</span>
                        </label>
                      </VCol>
                      <VTextField
                        class="centered-text"
                        v-model="brandInfo.brandName"
                        :rules="[(value: string) => !!value?.trim() || '브랜드명을 입력하세요']"
                      />
                    </VRow>
                  </VCol>

                  <VCol cols="12">
                    <VRow no-gutters>
                      <VCol cols="12" md="4" class="d-flex align-start">
                        <label class="font-weight-bold">
                          본사고객코드
                          <br />
                          대분류
                        </label>
                      </VCol>
                      <VTextField class="centered-text" v-model="brandInfo.largeCategory" disabled />
                    </VRow>
                  </VCol>

                  <VCol cols="12">
                    <VRow no-gutters>
                      <VCol cols="12" md="4" class="d-flex align-start">
                        <label class="font-weight-bold">
                          본사고객코드
                          <br />
                          본점고객코드
                        </label>
                      </VCol>
                      <VTextField class="centered-text" v-model="brandInfo.middleCategory" disabled />
                    </VRow>
                  </VCol>

                  <VCol md="12" class="d-flex flex-column">
                    <VRow no-gutters style="height: 48px">
                      <VCol cols="12" md="4" class="d-flex align-start">
                        <label class="font-weight-bold">오픈 일시</label>
                      </VCol>
                      <VCol cols="12" md="8" class="d-flex align-center">
                        <DatePicker
                          class="centered-text"
                          v-model="brandInfo.openDateTime"
                          :format="'yyyy-MM-dd HH:mm'"
                          enable-time-picker
                          enable-minutes
                        />
                      </VCol>
                    </VRow>
                  </VCol>

                  <VCol cols="12">
                    <VRow no-gutters>
                      <VCol cols="12" md="4" class="d-flex align-start">
                        <label class="font-weight-bold d-flex align-center gap-2">
                          <span>서비스 대상 여부</span>
                          <span class="text-necessary pt-1">*</span>
                        </label>
                      </VCol>
                      <VSelect class="vselect-centered-text" v-model="brandInfo.serviceYn" :items="['Y', 'N']" />
                    </VRow>
                  </VCol>

                  <VCol v-if="brandInfo.serviceYn === 'Y'" md="12" class="pt-0">
                    <VRow no-gutters>
                      <VCol cols="12" md="4" />
                      <VCol>
                        <div class="text-necessary">
                          * 서비스대상여부가 ‘Y’로 설정할 경우, FreshOn 및 외식UP에 실시간 반영됩니다. 모든 정보가
                          정상등록되었는지 꼭 확인해 주세요.
                        </div>
                      </VCol>
                    </VRow>
                  </VCol>

                  <VCol md="12">
                    <VRow no-gutters>
                      <VCol md="4" class="d-flex align-start">
                        <label class="font-weight-bold d-flex align-center gap-2">
                          <span>전화번호 수집 기간</span>
                          <span class="text-necessary pt-1">*</span>
                        </label>
                      </VCol>
                      <VCol class="d-flex align-center">
                        <DatePicker
                          class="centered-text"
                          v-model="brandInfo.collectionStartDateTime"
                          :format="'yyyy-MM-dd HH:mm'"
                          enable-time-picker
                          enable-minutes
                        />
                      </VCol>
                      <VCol md="auto" class="d-flex align-center px-2">
                        <span>~</span>
                      </VCol>
                      <VCol class="d-flex align-center">
                        <DatePicker
                          class="centered-text"
                          v-model="brandInfo.collectionEndDateTime"
                          :format="'yyyy-MM-dd HH:mm'"
                          :min-date="dayjs(brandInfo.collectionStartDateTime).toDate()"
                          enable-time-picker
                          enable-minutes
                        />
                      </VCol>
                    </VRow>
                  </VCol>

                  <VCol md="12">
                    <VRow no-gutters>
                      <VCol cols="12" md="4" class="d-flex align-start">
                        <label for="brandPath" class="font-weight-bold d-flex align-center gap-2">Path</label>
                      </VCol>
                      <VCol cols="12" md="8">
                        <VTextField
                          ref="brandPathFieldRef"
                          id="brandPath"
                          v-model="brandInfo.brandPath"
                          placeholder="브랜드 path"
                          class="no-details-padding"
                          persistent-placeholder
                          clearable
                          @update:model-value="handleBrandPathInput"
                          :rules="brandPathRules"
                        />
                      </VCol>
                      <VSnackbarQueue v-model="snacks" />
                    </VRow>
                  </VCol>

                  <VCol md="12" class="pt-0">
                    <VRow no-gutters>
                      <VCol cols="4" />
                      <VCol>
                        <div class="text-secondary">
                          path 생성 시 고객사 전용 주소로 제공합니다.
                          <br />
                          ex&#41; sfood 입력 시 -> www.oesikup.com/@sfood 로 제공
                        </div>
                      </VCol>
                    </VRow>
                  </VCol>
                </VCol>

                <VCol cols="5">
                  <VCol cols="12">
                    <label class="font-weight-bold">로그인지면 및 PC 홈</label>
                  </VCol>
                  <VCol cols="12" class="pl-10 pb-0">
                    <div class="d-flex align-center" style="height: 100px">
                      <VRow no-gutters>
                        <VCol cols="12" md="4" class="d-flex align-center">
                          <label>로고이미지</label>
                        </VCol>
                        <LogoUploader
                          :id="uuid4()"
                          :src="brandInfo.pcBrandLogoUri"
                          @file-changed="(file) => uploadImage(file, 'pcLogo')"
                          @file-removed="handleRemoveInfo('pcLogo')"
                        />
                      </VRow>
                    </div>
                  </VCol>

                  <VCol cols="12" class="pl-10 pt-3">
                    <div class="d-flex align-center">
                      <VRow no-gutters>
                        <VCol cols="12" md="4" class="d-flex align-center">
                          <label>배경색</label>
                        </VCol>
                        <SelectBackgroundColorDialog
                          v-model:bgColor="brandInfo.pcBgColor"
                          :initialBgColor="initialBrandInfo?.pcBgColor"
                        />
                      </VRow>
                    </div>
                  </VCol>

                  <VCol cols="12" class="pt-8">
                    <label class="font-weight-bold">모바일 홈</label>
                  </VCol>
                  <VCol cols="12" class="pl-10 pb-0">
                    <div class="d-flex align-center">
                      <VRow no-gutters>
                        <VCol cols="12" md="4" class="d-flex align-center" style="height: 100px">
                          <label>로고이미지</label>
                        </VCol>
                        <LogoUploader
                          :id="uuid4()"
                          :src="brandInfo.mobileBrandLogoUri"
                          @file-changed="(file) => uploadImage(file, 'mobileLogo')"
                          @file-removed="handleRemoveInfo('mobileLogo')"
                        />
                      </VRow>
                    </div>
                  </VCol>

                  <VCol cols="12" class="pl-10 pt-3">
                    <div class="d-flex align-center">
                      <VRow no-gutters>
                        <VCol cols="12" md="4" class="d-flex align-center">
                          <label>배경색</label>
                        </VCol>
                        <SelectBackgroundColorDialog
                          v-model:bgColor="brandInfo.mobileBgColor"
                          :initialBgColor="initialBrandInfo?.mobileBgColor"
                        />
                      </VRow>
                    </div>
                  </VCol>

                  <VCol cols="12" class="pt-8">
                    <label class="font-weight-bold">파비콘</label>
                  </VCol>
                  <VCol cols="12" class="pl-10 pb-0">
                    <div class="d-flex align-center">
                      <VRow no-gutters>
                        <VCol cols="12" md="4" class="d-flex align-center" style="height: 100px">
                          <label>로고이미지</label>
                        </VCol>
                        <LogoUploader
                          :id="uuid4()"
                          :src="brandInfo.faviconUri"
                          @file-changed="(file) => uploadImage(file, 'favicon')"
                          @file-removed="handleRemoveInfo('favicon')"
                        />
                      </VRow>
                    </div>
                  </VCol>

                  <VCol cols="12">
                    <div class="d-flex align-center pt-8" style="height: 60px">
                      <VRow no-gutters>
                        <VCol cols="12" md="4" class="d-flex align-center">
                          <label class="font-weight-bold">앱 런쳐 아이콘 식별정보</label>
                        </VCol>
                        <SelectAppLauncherIconKeyDialog
                          v-model:dialog="appLauncherIconKeyDialog"
                          v-model:appLauncherIconKey="brandInfo.appLauncherIconKey"
                          @file-removed="handleRemoveInfo('appLauncher')"
                        />
                      </VRow>
                    </div>
                  </VCol>
                </VCol>

                <VCol cols="12" class="d-flex flex-wrap gap-4 justify-end">
                  <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="reset">초기화</VBtn>
                  <VBtn type="submit" :disabled="!isChanged || isBrandPathRequired">저장</VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VTabsWindowItem>
          <VTabsWindowItem v-for="item in tabItems">
            <BrandTab
              v-if="item.headquarterBrandInfoId"
              :id="item.headquarterBrandInfoId"
              :storeCount="item.storeCount"
              :headquarterBrandPath="brandInfo.brandPath"
              @refetch="reset"
            />
          </VTabsWindowItem>
        </VTabsWindow>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.centered-text :deep(input) {
  text-align: center;
}

.vselect-centered-text :deep(.v-select__selection) {
  width: 100%;
  justify-content: center;
}

.no-details-padding ::v-deep(.v-input__details) {
  padding-left: 0;
}
</style>
