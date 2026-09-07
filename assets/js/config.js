/*
 * Public site configuration.
 *
 * Set inquiryEndpoint to the API URL shown after deploying
 * infrastructure/template.yaml. Leave it blank while developing locally to
 * retain the mail-app fallback in main.js.
 */
window.TRAVEL_BUG_CONFIG = {
  inquiryEndpoint: 'https://7bcje4v5ra.execute-api.us-east-1.amazonaws.com/prod/enquiries',
};
