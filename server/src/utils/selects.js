export const safeUserSelect = {
  id: true, email: true, name: true, createdAt: true, updatedAt: true,
};

export const safeOrganizationSelect = {
  id: true, name: true, slug: true, createdAt: true, updatedAt: true,
};

export const webHostingListSelect = {
  id: true, organizationId: true, provider: true, providerServiceId: true,
  name: true, slug: true, serviceType: true, status: true, region: true,
  plan: true, url: true, customDomain: true, monthlyCostCents: true,
  markupPercent: true, markupAmountCents: true, totalPriceCents: true,
  currency: true, billingModel: true, paymentStatus: true,
  createdAt: true, updatedAt: true,
};

export const vpsServiceListSelect = {
  id: true, organizationId: true, createdByUserId: true, checkoutOrderId: true,
  provider: true, providerInstanceId: true, label: true, hostname: true,
  region: true, plan: true, osId: true, osName: true, status: true,
  mainIp: true, vcpuCount: true, ramMb: true, diskGb: true,
  monthlyCostCents: true, markupPercent: true, markupAmountCents: true,
  totalPriceCents: true, currency: true, paymentStatus: true,
  createdAt: true, updatedAt: true,
};
