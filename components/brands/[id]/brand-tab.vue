<script setup lang="ts">
import type { UploadFileTypes } from '@/pages/brands/[id].vue';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { v4 as uuid4 } from 'uuid';
import LogoUploader from './logo-uploader.vue';
import type { VForm } from 'vuetify/components';
import SelectAppLauncherIconKeyDialog from './select-app-launcher-icon-key-dialog.vue';

const props = defineProps({
  id: {
    type: Number,
    require: true,
  },
  storeCount: {
    type: Number,
    default: 1,
  },
  headquarterBrandPath: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(['refetch']);

const middleCategoryInfo = ref<CaribbeanApiResponseBody['/brand/middle-category/{id}']['get']>();
const initialMiddleCategoryInfo = ref<CaribbeanApiResponseBody['/brand/middle-category/{id}']['get']>();

const isLoading = ref(true);
const isResetClicked = ref(false);
const isChanged = computed(() => !_.isEqual(middleCategoryInfo.value, initialMiddleCategoryInfo.value));
const isBrandNameOrBrandPathEmpty = computed(() => {
  const info = middleCategoryInfo.value;
  if (!info) return true;

  const isNameEmpty = !info.brandName?.trim();
  const isPathEmpty = info.sameHeadquarterPathYn !== 'Y' && !info.brandPath?.trim();

  return isNameEmpty || isPathEmpty;
});

const appIconDialog = ref(false);

const formRef = ref<VForm | null>(null);
const middleCategoryBrandPathRef = ref<any>(null);

const { snacks, showSnackbar } = useSnackbar();

const isBrandPathSame = ref(true);

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

// TODO: 동일한 함수 리팩토링 필요
const handleBrandPathInput = async (value?: string) => {
  if (!value) {
    return;
  }

  const cleanedValue = removeSpecialChars(value);

  if (cleanedValue !== value) {
    if (middleCategoryInfo.value) {
      middleCategoryInfo.value.brandPath = cleanedValue;
      await nextTick();

      if (middleCategoryBrandPathRef.value) {
        const inputElement = middleCategoryBrandPathRef.value.$el.querySelector('input');
        if (inputElement) {
          inputElement.value = cleanedValue;
        }
      }
    }
  }
};

// TODO: 동일 함수 리팩토링 필요
const handleRemoveInfo = (type: UploadFileTypes) => {
  if (!middleCategoryInfo.value || !initialMiddleCategoryInfo.value) {
    return;
  }

  if (type === 'pcLogo') {
    middleCategoryInfo.value.pcBrandLogoUri = '';
    middleCategoryInfo.value.pcLogoAttachSeqId = undefined;
  } else if (type === 'mobileLogo') {
    middleCategoryInfo.value.mobileBrandLogoUri = '';
    middleCategoryInfo.value.mobileLogoAttachSeqId = undefined;
  } else if (type === 'favicon') {
    middleCategoryInfo.value.faviconUri = '';
    middleCategoryInfo.value.faviconAttachSeqId = undefined;
  } else if (type === 'appLauncher') {
    middleCategoryInfo.value.appLauncherIconKey = '';
  }
};

// TODO: 동일 함수 리팩토링 필요
const reset = () => {
  isResetClicked.value = true;
  fetchMiddleCategoryInfo();
};

const update = async () => {
  const isFormValid = await formRef.value?.validate();
  console.log('1233');
  if (!isFormValid?.valid) {
    return;
  }

  updateMiddleCategoryInfo();
};

// TODO: undefined를 보내도록 wrapper 만드는 게 나을 듯
const updateMiddleCategoryInfo = async () => {
  if (!props.id) {
    return;
  }
  console.log('123');

  const { response, error } = await makeCaribbeanClient().PATCH('/brand/middle-category/{id}', {
    params: {
      path: {
        id: props.id,
      },
    },
    body: {
      brandName: middleCategoryInfo.value?.brandName,
      brandPath:
        middleCategoryInfo.value?.brandPath === '' || middleCategoryInfo.value?.brandPath == null
          ? undefined
          : middleCategoryInfo.value?.brandPath,
      pcLogoAttachSeqId: middleCategoryInfo.value?.pcLogoAttachSeqId,
      pcBackgroundColor:
        middleCategoryInfo.value?.pcBackgroundColor === '' || middleCategoryInfo.value?.pcBackgroundColor == null
          ? undefined
          : middleCategoryInfo.value?.pcBackgroundColor,
      mobileLogoAttachSeqId: middleCategoryInfo.value?.mobileLogoAttachSeqId,
      mobileBackgroundColor:
        middleCategoryInfo.value?.mobileBackgroundColor === '' ||
        middleCategoryInfo.value?.mobileBackgroundColor == null
          ? undefined
          : middleCategoryInfo.value?.mobileBackgroundColor,
      faviconAttachSeqId: middleCategoryInfo.value?.faviconAttachSeqId,
      appLauncherIconKey:
        middleCategoryInfo.value?.appLauncherIconKey === '' || middleCategoryInfo.value?.appLauncherIconKey == null
          ? undefined
          : middleCategoryInfo.value?.appLauncherIconKey,
      sameHeadquarterPathYn: middleCategoryInfo.value?.sameHeadquarterPathYn ?? 'Y',
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

const deleteMiddleCategory = async () => {
  Swal.fire({
    icon: 'question',
    html: `<div style="white-space: pre-wrap;"><div style="font-size: 24px; font-weight: 700;">브랜드 BI를 삭제하시겠습니까?</div><br /><div style="display: flex; justify-content: center">삭제 시, ${props.storeCount}개 지점에 적용된 브랜드 BI가 변경됩니다.</div>`,
    showCancelButton: true,
    buttonsStyling: false,
    confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px; margin-right: 16px ">삭제</div>`,
    cancelButtonText: `<div style="background-color: grey; color: white; padding: 8px 18px; border-radius: 5px; margin-right: 16px ">닫기</div>`,
    reverseButtons: true,
  }).then(async (result) => {
    if (result.isConfirmed) {
      if (!props.id) {
        return;
      }

      try {
        const { response } = await makeCaribbeanClient().DELETE('/brand/middle-category/{id}', {
          params: {
            path: {
              id: props.id,
            },
          },
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            html: `<div style="white-space: pre-wrap;">삭제 완료</div>`,
            buttonsStyling: false,
            confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
          });
          emit('refetch');
        }
      } catch (error) {
        const errorInfo = error as unknown as { code: string; message: string };
        Swal.fire({
          icon: 'error',
          html: `<div style="white-space: pre-wrap;">DELETE('/brand/middle-category/{id}') 실패\n\ncode: ${errorInfo.code}\n\nmessage: ${errorInfo.message}</div>`,
          buttonsStyling: false,
          confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
        });
      }
    }
  });
};

const fetchMiddleCategoryInfo = async () => {
  if (!props.id) {
    return;
  }

  try {
    const { data } = await makeCaribbeanClient().GET('/brand/middle-category/{id}', {
      params: {
        path: {
          id: props.id,
        },
      },
    });

    middleCategoryInfo.value = data;

    if (!initialMiddleCategoryInfo.value) {
      initialMiddleCategoryInfo.value = _.cloneDeep(data);
    }

    if (isResetClicked.value) {
      initialMiddleCategoryInfo.value = _.cloneDeep(data);
      isResetClicked.value = false;
    }
    isBrandPathSame.value = props.headquarterBrandPath === middleCategoryInfo.value?.brandPath;
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

// TODO: 동일 함수 리팩토링 필요
const uploadImage = async (file: File, type: UploadFileTypes) => {
  const { data, error } = await makeCaribbeanClient().POST('/files/upload', {
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

  if (data && middleCategoryInfo.value) {
    if (type === 'pcLogo') {
      middleCategoryInfo.value.pcBrandLogoUri = data.fileUri;
      middleCategoryInfo.value.pcLogoAttachSeqId = data.sysAttachInfoSeqId;
    } else if (type === 'mobileLogo') {
      middleCategoryInfo.value.mobileBrandLogoUri = data.fileUri;
      middleCategoryInfo.value.mobileLogoAttachSeqId = data.sysAttachInfoSeqId;
    } else {
      middleCategoryInfo.value.faviconUri = data.fileUri;
      middleCategoryInfo.value.faviconAttachSeqId = data.sysAttachInfoSeqId;
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

fetchMiddleCategoryInfo();
</script>

<template>
  <p class="text-2xl py-6">BI 정보 상세</p>
  <VForm v-if="middleCategoryInfo && !isLoading" ref="formRef" class="pl-6" @submit.prevent="update">
    <VRow>
      <VCol cols="12">
        <VRow no-gutters>
          <VCol cols="12" md="2" class="d-flex align-start">
            <label class="font-weight-bold d-flex align-center gap-2">
              <span>브랜드명</span>
              <span class="text-necessary pt-1">*</span>
            </label>
          </VCol>
          <VTextField
            class="centered-text"
            v-model="middleCategoryInfo.brandName"
            :rules="[(value: string) => !!value?.trim() || '브랜드명을 입력하세요']"
          />
        </VRow>
      </VCol>

      <VCol md="12">
        <VRow no-gutters>
          <VCol cols="12" md="2" class="d-flex align-start">
            <label for="brandPath" class="font-weight-bold d-flex align-center gap-2">
              <span>Path</span>
              <span class="text-necessary pt-1">*</span>
            </label>
          </VCol>

          <VCol>
            <VTextField
              id="brandPath"
              v-model="middleCategoryInfo.brandPath"
              placeholder="브랜드 path"
              class="no-details-padding"
              persistent-placeholder
              clearable
              :disabled="middleCategoryInfo.sameHeadquarterPathYn === 'Y'"
              @update:model-value="handleBrandPathInput"
              :rules="[
                (value: string) =>
                  middleCategoryInfo?.sameHeadquarterPathYn === 'Y' || !!value?.trim() || '* Path를 입력해주세요.',
              ]"
            />
          </VCol>
          <VCol cols="auto">
            <VCheckbox
              label="대분류와동일"
              v-model="middleCategoryInfo.sameHeadquarterPathYn"
              :true-value="'Y'"
              :false-value="'N'"
              @update:model-value="
                (checked) => {
                  if (checked && middleCategoryInfo) middleCategoryInfo.brandPath = undefined;
                }
              "
            ></VCheckbox>
          </VCol>
          <VSnackbarQueue v-model="snacks" />
        </VRow>
      </VCol>

      <VCol md="12" class="pt-0">
        <VRow no-gutters>
          <VCol cols="2" />
          <VCol>
            <div class="text-secondary">
              path 생성 시 고객사 전용 주소로 제공합니다.
              <br />
              ex&#41; sfood 입력 시 -> www.oesikup.com/@sfood 로 제공
            </div>
          </VCol>
        </VRow>
      </VCol>

      <VCol cols="12">
        <label class="font-weight-bold">로그인지면 및 PC 홈</label>
      </VCol>

      <VCol cols="6" class="pl-10 d-flex flex-column gap-3">
        <div class="d-flex align-center" style="height: 100px">
          <VRow no-gutters>
            <VCol class="d-flex align-center">
              <label>로고이미지</label>
            </VCol>
            <LogoUploader
              :id="uuid4()"
              :src="middleCategoryInfo.pcBrandLogoUri"
              @file-changed="(file) => uploadImage(file, 'pcLogo')"
              @file-removed="handleRemoveInfo('pcLogo')"
            />
          </VRow>
        </div>
        <div class="d-flex align-center">
          <VRow no-gutters>
            <VCol class="d-flex align-center">
              <label>배경색</label>
            </VCol>
            <SelectBackgroundColorDialog
              v-model:bgColor="middleCategoryInfo.pcBackgroundColor"
              :initialBgColor="initialMiddleCategoryInfo?.pcBackgroundColor"
            />
          </VRow>
        </div>
      </VCol>

      <VCol cols="12" class="pt-8">
        <label class="font-weight-bold">모바일 홈</label>
      </VCol>
      <VCol cols="6" class="pl-10 d-flex flex-column gap-3">
        <div class="d-flex align-center">
          <VRow no-gutters>
            <VCol class="d-flex align-center" style="height: 100px">
              <label>로고이미지</label>
            </VCol>
            <LogoUploader
              :id="uuid4()"
              :src="middleCategoryInfo.mobileBrandLogoUri"
              @file-changed="(file) => uploadImage(file, 'mobileLogo')"
              @file-removed="handleRemoveInfo('mobileLogo')"
            />
          </VRow>
        </div>
        <div class="d-flex align-center">
          <VRow no-gutters>
            <VCol class="d-flex align-center">
              <label>배경색</label>
            </VCol>
            <SelectBackgroundColorDialog
              v-model:bgColor="middleCategoryInfo.mobileBackgroundColor"
              :initialBgColor="initialMiddleCategoryInfo?.mobileBackgroundColor"
            />
          </VRow>
        </div>
      </VCol>

      <VCol cols="12" class="pt-8">
        <label class="font-weight-bold">파비콘</label>
      </VCol>
      <VCol cols="12">
        <VCol cols="6" class="pl-10 pb-0">
          <div class="d-flex align-center">
            <VRow no-gutters>
              <VCol class="d-flex align-center" style="height: 100px">
                <label>로고이미지</label>
              </VCol>
              <LogoUploader
                :id="uuid4()"
                :src="middleCategoryInfo.faviconUri"
                @file-changed="(file) => uploadImage(file, 'favicon')"
                @file-removed="handleRemoveInfo('favicon')"
              />
            </VRow>
          </div>
        </VCol>
      </VCol>

      <VCol cols="6">
        <div class="d-flex align-center pt-8" style="height: 60px">
          <VRow no-gutters>
            <VCol cols="4" class="d-flex align-center">
              <label class="font-weight-bold">앱 런쳐 아이콘 식별정보</label>
            </VCol>
            <SelectAppLauncherIconKeyDialog
              v-model:dialog="appIconDialog"
              v-model:appLauncherIconKey="middleCategoryInfo.appLauncherIconKey"
              @file-removed="handleRemoveInfo('appLauncher')"
            />
          </VRow>
        </div>
      </VCol>

      <VCol cols="12" class="d-flex flex-wrap gap-4 justify-end">
        <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="deleteMiddleCategory">삭제</VBtn>
        <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="reset">초기화</VBtn>
        <VBtn type="submit" :disabled="!isChanged || isBrandNameOrBrandPathEmpty">저장</VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>

<style scoped>
.no-details-padding ::v-deep(.v-input__details) {
  padding-left: 0;
}
</style>
