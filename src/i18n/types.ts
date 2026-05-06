// ─── i18n Dictionary Type ─────────────────────────────────────────────────────
// Add new keys here as you expand multilingual support.
// When adding English, fill en.ts with the same structure.

export interface Dictionary {
  sidebar: {
    dashboard: string;
    performance: string;
    storeProfile: string;
    productFinder: string;
    productResearch: string;
    storeContent: string;
    tiktokPosts: string;
    trends: string;
    myNiches: string;
    aiBuilder: string;
    adGenerator: string;
    integrations: string;
    billing: string;
    referrals: string;
    profile: string;
    settings: string;
    logout: string;
    upgradeCta: string;
  };
  onboarding: {
    step: string;
    of: string;
    gettingStarted: string;
    followSteps: string;
    connectShopify: string;
    connectShopifyDesc: string;
    importProducts: string;
    importProductsDesc: string;
    scanStore: string;
    scanStoreDesc: string;
    optimizePublish: string;
    optimizePublishDesc: string;
    rescanNow: string;
    scanning: string;
    goToIntegrations: string;
    openDsers: string;
  };
  builder: {
    title: string;
    subtitle: string;
    betaBadge: string;
    betaDisclaimer: string;
    nicheLabel: string;
    promptLabel: string;
    promptPlaceholder: string;
    promptTip: string;
    charCount: string;
    generateButton: string;
    generatingButton: string;
    awaitingTitle: string;
    awaitingDesc: string;
    resultSuccess: string;
    sectionProducts: string;
    sectionPricing: string;
    sectionSetup: string;
    sectionAds: string;
    sectionLaunch: string;
    priceLabel: string;
    marginLabel: string;
    loadingStep1: string;
    loadingStep2: string;
    loadingStep3: string;
    loadingStep4: string;
    errorEmpty: string;
    errorApi: string;
  };
  adGenerator: {
    title: string;
    subtitle: string;
    betaBadge: string;
    betaDisclaimer: string;
    planFree: string;
    planPro: string;
    productLabel: string;
    productPlaceholder: string;
    generateButton: string;
    generatingButton: string;
    hook: string;
    script: string;
    concept: string;
    shotList: string;
    caption: string;
    hashtags: string;
    angleType: string;
    upgradePrompt: string;
    upgradeButton: string;
    adNumber: string;
    errorEmpty: string;
    errorApi: string;
    awaitingTitle: string;
    awaitingDesc: string;
  };
  auth: {
    emailLabel: string;
    passwordLabel: string;
    loginButton: string;
    loggingIn: string;
    forgotPassword: string;
    sendingReset: string;
    resetSent: string;
    continueGoogle: string;
    noAccount: string;
    startTrial: string;
    backToHome: string;
    errorInvalidCredentials: string;
    errorEmailNotConfirmed: string;
    errorTooManyRequests: string;
    errorGeneric: string;
    errorEnterEmail: string;
  };
  layout: {
    betaBadge: string;
    betaFull: string;
    betaBannerText: string;
    betaBannerDismiss: string;
    verifyingAccess: string;
  };
}
