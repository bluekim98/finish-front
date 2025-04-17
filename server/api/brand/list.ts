import { defineEventHandler, getQuery } from 'h3';

// 더미 데이터
const brands = [
  {
    brandId: 143,
    brandName: '남파랑국밥',
    headOfficeCustomerCode: 'namparang',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 138,
    brandName: '노랑통닭 대구평리점(신규)',
    headOfficeCustomerCode: 'q987NYboMV',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 4,
    brandName: '쥬씨이',
    headOfficeCustomerCode: 'u7qc0Pjpbu',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 3,
    brandName: '노랑통닭',
    headOfficeCustomerCode: 'hCnGEUQqde',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 141,
    brandName: 'test',
    headOfficeCustomerCode: 'cnEP2rEweD',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 5,
    brandName: '한옥집김치찜',
    headOfficeCustomerCode: 'hanokjip',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 139,
    brandName: '요식UP몰',
    headOfficeCustomerCode: 'xEPQW00e0r',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 36,
    brandName: '준코',
    headOfficeCustomerCode: 'FQ8rhblJoy',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 70,
    brandName: '마루에프씨',
    headOfficeCustomerCode: '8s3bgvLZ4v',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  {
    brandId: 71,
    brandName: '순수덮밥',
    headOfficeCustomerCode: 'xNmoSj38jr',
    largeCategory: 'large',
    middleCategory: 'middle',
    serviceYn: 'Y',
    openDateTime: '2025-01-23T00:00:00+09:00',
    phoneNumberCollectionYn: 'Y',
  },
  // ... 나머지 데이터 생략
];

// Nuxt API 핸들러 정의
export default defineEventHandler((event) => {
  // 클라이언트로부터 `page`와 `pageSize` 쿼리 파라미터 받기
  const query = getQuery(event);
  const page = Number(query.page) || 1; // 기본값 1
  const pageSize = Number(query.pageSize) || 10; // 기본값 10

  // 페이징 계산
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // 페이징된 데이터 추출
  const paginatedItems = brands.slice(startIndex, endIndex);

  // 응답 데이터 구성
  return {
    items: paginatedItems,
    pagination: {
      page,
      pageSize,
      totalCount: brands.length,
      isLast: endIndex >= brands.length,
      totalPage: Math.ceil(brands.length / pageSize),
    },
  };
});
